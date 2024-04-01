const {queueClient} = require('./queue/queueClient.js')
require('dotenv').config()
const {assignDockerInstance} = require('./docker.js')
const workerpool = require('workerpool');
const {DockerError} = require('./error')


const pool = workerpool.pool({
  maxWorkers: 2,
  maxQueueSize: 2,
});

const BUILDQUEUE = process.env.BUILDQUEUE;

const queueSys = async () => {
  const conn = await queueClient()
  const ch1 = await conn.createChannel();
  await ch1.assertQueue(BUILDQUEUE);

  // Listener
  ch1.consume(BUILDQUEUE, async (msg) => {
    if (msg !== null) {
      console.log('Recieved a deployment link:', msg.content.toString());
      const githubURL = msg.content.toString()
      // console.log(msg)
      //ch1.ack(msg);
      try {
        const deployInstance = await assignDockerInstance({gitURL: githubURL , image: 'build-image', Env: ['GIT_REPOSITORY_URL='+githubURL]})
        //console.log(initiatePool)
        ch1.ack(msg)
      } catch(err){
        if (err instanceof DockerError) {
          console.log(err.message)
          setTimeout(() => ch1.nack(msg, undefined, true), 120000)
          return
        }
        console.log(err.name)
        ch1.reject(msg, false)
        console.log("Deployment halted")
      }
      
      //console.log('Consumer cancelled by server');
    }
  }, {
    noAck: false
  });
  
}


queueSys()