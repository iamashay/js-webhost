import Docker from 'dockerode';
import { Writable } from 'node:stream';
import {Mutex, withTimeout, Semaphore} from 'async-mutex'
import {DockerError}  from './error.js'
const MAX_UPTIME = 300
const DOCKER_LIMIT = 2
const docker = new Docker({
    protocol:'http', 
    host: '127.0.0.1', 
    port: 2375,
    version: 'v1.42'
});
import {updateDeploymentStatus, uploadDeploymentLog} from './lib.js'

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

async function initiateContainer({Env, image, projectId}) {
    const myStream = new DockerOutputLog();
    const runContainer = await docker.run(image, [], myStream, {
        Env,
        HostConfig: {
            Mounts: [
              {
                Type: 'bind',
                Source: 'I:\\Temp\\'+projectId,
                Target: '/home/app/output/',
                ReadOnly: false,
              },
            ],
          },
    })
    //console.log(myStream)
    return [runContainer, myStream?.toString()]

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

export const assignDockerInstance = async ({deploymentId, gitURL, image, Env}) => {

    //if (assignDockerInstanceMutex.getValue() <= 0) throw new DockerError("No docker instance available for use!")
    await assignDockerInstanceMutex.acquire()
    await updateDeploymentStatus({id: deploymentId, status: 'Building'})
    try {
        await deleteUnusableContainers()
        const containerList = await getContainersByImage({image})
        if (containerList.length >= DOCKER_LIMIT) throw new DockerError(`Limit error, more than ${DOCKER_LIMIT} are on use`)
        console.log(containerList)
        console.log("Creating a container for "+gitURL)
        const [container, buildLog] = await initiateContainer({gitURL, image, Env})
        await updateDeploymentStatus({id: deploymentId, status: 'Deployed'})
        uploadDeploymentLog({deployment: deploymentId, log: buildLog})
        console.log(container, "StatusCode" in container)
        if (container?.length === 0) throw new Error("Error initalizing a container")
        console.log(`Installation ID: ${container[1].id}`)
        return container
    }  finally {
        assignDockerInstanceMutex.release()
    }

}
// assignDockerInstance({gitURL: 'GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git' , image: 'build-image', Env: ['GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git']})

// setTimeout(() => assignDockerInstance({gitURL: 'GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git' , image: 'build-image', Env: ['GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git']}), 3000)
// setTimeout(() => assignDockerInstance({gitURL: 'GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git' , image: 'build-image', Env: ['GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git']}), 6000)
//getContainers()

