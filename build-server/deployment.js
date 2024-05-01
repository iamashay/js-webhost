import Docker from 'dockerode';
import { Writable } from 'node:stream';
import {Mutex, withTimeout, Semaphore} from 'async-mutex'
import {DeploymentError, DockerError}  from './error.js'
import path from 'path'
import fs from 'fs'

const MAX_UPTIME = 300
const DOCKER_LIMIT = 2
const docker = new Docker({
    protocol:'http', 
    host: '127.0.0.1', 
    port: 2375,
    version: 'v1.42'
});

import {updateDeploymentStatus, uploadDeploymentLog} from './lib.js'
import { uploadFiles } from './S3.js';

const assignDockerInstanceMutex = withTimeout(new Semaphore(2), 300000, new DockerError('Waiting for docker timedout'))
//console.log(deleteContainerMutex)

class DockerOutputLog extends Writable {
    constructor() {
        super()
        this.output = ""        
    }

    _write(chunk, encoding, callback) {
        this.output += chunk.toString()
        callback()
        // resolve(result);  // Moved the resolve to the handler, which fires at the end of the stream
    }

    toString() {
        return this.output
    }

}


const deleteUnusableContainers = async  () => {
    //deletes containers if they are exited or up for more than 2 minutes
    try {
        const listContainers = await getContainersByImage({image: "build-image"})
        for (const container of listContainers){
            const uptime = Math.floor((+new Date() / 1000) - container.Created)
            const {Id, State} = container
            //console.log(uptime)
            const dockerContainer = docker.getContainer(Id)
            console.log(listContainers)
            if (State == 'running' && uptime > MAX_UPTIME) {
                await dockerContainer.remove({force: true})
                console.log(`Time exceeded (${uptime}s) ${Id} deleted!`)
            } else if (State == 'running') {
                console.log(`${Id} is running since ${uptime}s!`)
            } else if (State != 'removing') {
                await dockerContainer.remove({force: true})
                console.log(`Removed ${Id} of ${State} status!`)
            } else {
                console.log(`Unknown ${Id} with ${State} found`)
    
            }
        }
    } catch (e) {
        console.log("Error deleting the containers"+e)
        throw e
    }
} 

//deleteUnusableContainers()

async function initiateContainer({Env, gitURL, image, projectId}) {
    const containerOutputLog = new DockerOutputLog();
    const containerErrLog = new DockerOutputLog();
    const sourcePath = path.join('I:', 'Temp', projectId)
    const targetPath = path.posix.join('/', 'home', 'app', 'output')
    const projectBuildCmd = 'npm run build'
    await fs.promises.rm(sourcePath, { maxRetries: 2, retryDelay: 2000, recursive: true, force: true })
    // const container = await docker.createContainer({
    //     Image: image,
    //     Env,
    //     Cmd: ['/bin/bash', '-c', 'ls'],
    //     Tty: true,
    //     HostConfig: {
    //         Mounts: [
    //           {
    //             Type: 'bind',
    //             Source: sourcePath,
    //             Target: targetPath,
    //             ReadOnly: false,
    //           },
    //         ],
    //     },
    // })
    // container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
    //     stream.pipe(process.stdout);
    // });
    const container = await docker.run(image, ['bash', '-c', `git clone --quiet ${gitURL} ${targetPath} && echo "Downloaded project from git" && npm config set update-notifier false && npm --loglevel=error i && echo "NPM package installed!" && ${projectBuildCmd} && echo "Project Built Successfully"`], [containerOutputLog, containerErrLog], {
            //Env,
            Tty: false,
            HostConfig: {
                Memory: 2e+8,
                AutoRemove: true,
                Mounts: [
                  {
                    Type: 'bind',
                    Source: sourcePath,
                    Target: targetPath,
                    ReadOnly: false,
                  },
                ],
            },
        },
    )
    console.log(containerOutputLog,containerErrLog)
    return {container, outputLog: containerOutputLog?.toString(), errorLog: containerErrLog?.toString()}

}

//initiateContainer({Env: ["GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git"], image: 'build-image'})

const getContainersByImage = async ({image}) => {
    
    try {
        const listContainers =  await docker.listContainers({ 
            all: true, 
            filters: JSON.stringify({ancestor: [image]})
        })
        return listContainers
    } catch (e) {
        console.error(`Error getting list of containers ${e}`)
        throw e
    } 
    
}



export const deployProject = async ({deploymentId, gitURL, image, Env, projectId, slug}) => {

    //if (assignDockerInstanceMutex.getValue() <= 0) throw new DockerError("No docker instance available for use!")
    await assignDockerInstanceMutex.acquire()
    await updateDeploymentStatus({id: deploymentId, status: 'Building'})
    try {
        await deleteUnusableContainers()
        const containerList = await getContainersByImage({image})
        if (containerList.length >= DOCKER_LIMIT) throw new DockerError(`Limit error, more than ${DOCKER_LIMIT} are on use`)
        console.log(containerList)
        console.log("Creating a container for "+gitURL)
        const {container, outputLog, errLog, buildLocation} = await initiateContainer({gitURL, image, Env, projectId})
        uploadDeploymentLog({deployment: deploymentId, outputLog, errLog})
        if (!container) throw new Error("No container exists")
        if (container[0].StatusCode != 0) throw new DeploymentError(`Container exited with ${container[0].StatusCode}`)
        await updateDeploymentStatus({id: deploymentId, status: 'Built'})
        await uploadFiles({projectId, slug});
        await updateDeploymentStatus({id: deploymentId, status: 'Deployed'})
        //console.log(`Installation ID: ${container[1].id}`)
        return true
    }  finally {
        assignDockerInstanceMutex.release()
    }

}
