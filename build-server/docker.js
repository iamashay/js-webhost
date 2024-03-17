const Docker = require('dockerode');
const { Writable } = require('node:stream');

const MAX_UPTIME = 300
const DOCKER_LIMIT = 2
const docker = new Docker({
    protocol:'http', 
    host: '127.0.0.1', 
    port: 2375,
    version: 'v1.41'
});

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
    const listContainers = await getContainersByImage({image: "build-image"})
    for (const container of listContainers){
        const uptime = Math.floor((+new Date() / 1000) - container.Created)
        const {Id, State} = container
        //console.log(uptime)
        const dockerContainer = docker.getContainer(Id)
        console.log(listContainers)
        if (State == 'running' && uptime > MAX_UPTIME) {
            dockerContainer.remove({force: true}, (err, data) =>   {
                if (err) throw err
                console.log(`Time exceeded (${uptime}s) ${Id} deleted!`)
            })
        } else if (State == 'running') {
            console.log(`${Id} is running since ${uptime}s!`)
        } else if (State != 'removing') {
            dockerContainer.remove({force: true}, (err, data) =>   {
                if (err) throw err
                console.log(`Removed ${dockerContainer.id} of ${State} status!`)
            })
        } else {
            console.log(`Unknown ${dockerContainer.id} with ${State} found`)

        }
    }

} 

//deleteUnusableContainers()

async function initiateContainer({Env, image}) {
    const myStream = new DockerOutputLog();
    const runConatiner = await docker.run(image, [], myStream, {
        Env
    })
    console.log(myStream)
    return runConatiner

}

//initiateContainer({Env: ["GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git"], image: 'build-image'})

const getContainersByImage = async ({image}) => {
    return docker.listContainers({ 
            all: true, 
            filters: JSON.stringify({ancestor: [image]})
        })
}

const assignDockerInstance = async ({gitURL, image, Env}) => {
    await deleteUnusableContainers()
    const containerList = await getContainersByImage({image})
    if (containerList.length >= DOCKER_LIMIT) throw new Error("No instances available.")
    console.log(containerList)
    console.log("Creating a container for "+gitURL)
    const [result, newContainer] = await initiateContainer({gitURL, image, Env})
    if (!result?.StatusCode) throw new Error("Error initalizing a container")
    console.log(`Installation ID: ${newContainer.id}`)
    return newContainer
}
// assignDockerInstance({gitURL: 'GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git' , image: 'build-image', Env: ['GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git']})

// setTimeout(() => assignDockerInstance({gitURL: 'GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git' , image: 'build-image', Env: ['GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git']}), 3000)
// setTimeout(() => assignDockerInstance({gitURL: 'GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git' , image: 'build-image', Env: ['GIT_REPOSITORY_URL=https://github.com/iamashay/ShoppingApp.git']}), 6000)
//getContainers()

module.exports = {assignDockerInstance}