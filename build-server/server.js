import {queueClient} from './queue/queueClient.js'
import 'dotenv/config'
import {deployProject} from'./deployment.js'
import {DockerError, DeploymentError} from './error.js'
import { createDeployement, updateDeploymentStatus, uploadDeploymentLog, StreamLogger } from './lib.js'
import { StringLogger, logger } from './logger.js'

const BUILDQUEUE = process.env.BUILDQUEUE;

const queueSys = async () => {
  const conn = await queueClient()
  const ch1 = await conn.createChannel();
  await ch1.assertQueue(BUILDQUEUE);

  // Listener
  ch1.consume(BUILDQUEUE, async (msg) => {
    if (msg !== null) {
      const data = msg.content.toString()
      logger.info('Recieved a deployment link: '+data);
      // console.log(msg)
      //ch1.ack(msg);
      let deploymentId;
      const [localOutLogger, outputLog] = StringLogger()
      try {
        const project = JSON.parse(data)
        const {gitURL, id, slug, buildFolder, buildScript} = project
        //console.log(buildFolder)
        const newDeployment = await createDeployement({id, buildFolder, buildScript})
        deploymentId = newDeployment.id
        //console.log("Initiated deployment: "+deploymentId)
        logger.info("Initiated deployment: "+deploymentId)
        const deployInstance = await deployProject({gitURL, id, slug, projectId: id, buildFolder, buildScript, deploymentId, localOutLogger, image: 'build-image', Env: ['GIT_REPOSITORY_URL='+gitURL, 'PROJECT_ID='+slug]})
        //console.log(initiatePool)
        ch1.ack(msg)
      } catch(err){
        localOutLogger.error("Deployment Halted")
        localOutLogger.error(err.message)
        if (err instanceof DockerError) {
          if (deploymentId) await updateDeploymentStatus({id: deploymentId, status: "Error"})
          setTimeout(() => ch1.nack(msg, undefined, true), 120000)
          return
        } else if (err instanceof DeploymentError) {
          console.error(err)
          if (deploymentId) await updateDeploymentStatus({id: deploymentId, status: "Error"})
          ch1.reject(msg, false)
          return
        }

        ch1.reject(msg, false)
        if (deploymentId) await updateDeploymentStatus({id: deploymentId, status: "Error"})
      } finally {
        //console.log(containerErrLog, containerOutputLog)
        // containerOutputLog.end()
        // containerErrLog.end()
        if (deploymentId) uploadDeploymentLog({deployment: deploymentId, outputLog: outputLog.getLogString()})
      }
      
      //console.log('Consumer cancelled by server');
    }
  }, {
    noAck: false
  });
  
}


queueSys()