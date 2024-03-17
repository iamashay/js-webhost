const {queueClient} = require('./queue/queueClient.js')
require('dotenv').config()
const {assignDockerInstance} = require('./docker.js')
const workerpool = require('workerpool');
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
      //ch1.ack(msg);
      try {
        const initiatePool = await pool.exec(assignDockerInstance, [assignDockerInstance({gitURL: githubURL , image: 'build-image', Env: ['GIT_REPOSITORY_URL='+githubURL]})])
        // const deployInstance = await assignDockerInstance({gitURL: githubURL , image: 'build-image', Env: ['GIT_REPOSITORY_URL='+githubURL]})
        console.log(initiatePool)
        //ch1.ack(mGIsg)
      } catch(e){
        
        console.log(e.message)
        console.log("Deployment halted")
      }
      
    } else {
      console.log('Consumer cancelled by server');
    }
  }, {
    noAck: false
  });
  
}


queueSys()