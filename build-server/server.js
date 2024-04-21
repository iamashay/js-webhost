import {queueClient} from './queue/queueClient.js'
import 'dotenv/config'
import {assignDockerInstance} from'./docker.js'
import workerpool from 'workerpool'
import {DockerError} from './error.js'
import { createDeployement, updateDeploymentStatus } from './lib.js'


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
      const data = msg.content.toString()
      // console.log(msg)
      //ch1.ack(msg);
      let deploymentId;
      try {
        const project = JSON.parse(data)
        const {gitURL, id, slug} = project
        const newDeployment = await createDeployement({id})
        deploymentId = newDeployment.id
        console.log("Initiated deployment: "+deploymentId)

        const deployInstance = await assignDockerInstance({gitURL, id, deploymentId, image: 'build-image', Env: ['GIT_REPOSITORY_URL='+gitURL, 'PROJECT_ID='+slug]})
        //console.log(initiatePool)
        ch1.ack(msg)
      } catch(err){
        if (err instanceof DockerError) {
          console.log(err.message)
          if (deploymentId) await updateDeploymentStatus({id: deploymentId, status: "Requeued"})
          setTimeout(() => ch1.nack(msg, undefined, true), 120000)
          return
        }
        console.log(err)
        ch1.reject(msg, false)
        if (deploymentId) await updateDeploymentStatus({id: deploymentId, status: "Error"})
        console.log("Deployment halted")
      }
      
      //console.log('Consumer cancelled by server');
    }
  }, {
    noAck: false
  });
  
}


queueSys()