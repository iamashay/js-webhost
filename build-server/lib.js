import {db} from '../database/db.js'
import {projects, deployments, deploymentLogs} from '../database/schema.js'
import { and, eq, gt, inArray, not, desc  } from "drizzle-orm";
import { Transform, Writable } from 'node:stream';


export const createDeployement = async ({id, status, buildFolder, buildScript}) => {
    if (!id) throw new Error('No id or status provided')
    const createDeployment = await db.insert(deployments).values({project: id, status, buildFolder, buildScript}).returning({id: deployments.id })
    if (createDeployment.length > 0) return createDeployment[0]
    throw new Error("Couldn't create a new deployment for project "+id)
}

export const updateDeploymentStatus = async ({id, status}) => {
    if (!id || !status) throw new Error('No id or status provided')
    const createDeployment = await db.update(deployments).set({status}).where(eq(deployments.id, id)).returning({id: deployments.id })
    if (createDeployment.length > 0) return true
    throw new Error(`Couldn't update the status for deployment id ${id}`)
}

export const uploadDeploymentLog = async ({deployment, outputLog, errorLog}) => {
    if (!deployment) throw new Error("Missing log values")
    const rows = [{
        deployment,
        outputLog,
        errorLog
    }]
    const insertLogs = await db.insert(deploymentLogs).values(rows).returning({id: deploymentLogs.id })
    if (insertLogs.length > 0) return true
    throw new Error(`Couldn't update the logs for deployment id ${id}`) 
    //console.log(insertLogs)
}

export const checkLatestDeployment = async ({deploymentId, projectId}) => {
  if (!projectId) throw new Error("No project id provided")
    const now = new Date()
    const dateLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000); //sets a range within which we check for status that are not 'Error' or 'Deployed' to halt the deployment
    const checkDeployment = await db.query.deployments.findFirst({where: and(eq(projectId, deployments.project), gt(deployments.createdAt, dateLimit), not(inArray(deployments.status, ['Error', 'Deployed'])))})
    console.log(checkDeployment, dateLimit)
    if (checkDeployment && checkDeployment?.id != deploymentId) throw new Error('Deployment already in progress!')
}

export const checkOngoingDeployment = async ({deploymentId, projectId}) => {
  if (!deploymentId || !projectId) throw new Error("Missing check deployment values")
  const latestDeployment = await db.query.deployments.findFirst({
      where: or(eq(deployments.project, projectId), ),
      orderBy: desc(deployments.createdAt)
  })
  console.log(latestDeployment, projectId)
  if (latestDeployment?.id === deploymentId) return true
  throw new Error(`${deploymentId} is not the latest deployment. Discarding it.`) 
  //console.log(insertLogs)
}

export class StreamLogger extends Transform {
    constructor(logger, type, source) {
        super()
        this.logger = logger    
        this.type = type
        this.source = source
    }

    _transform(chunk, encoding, callback) {
        if (this.type === 'error') {
            this.logger.error(chunk)
        } else {
            this.logger.info(chunk)
        }
        callback(null, chunk)
        // resolve(result);  // Moved the resolve to the handler, which fires at the end of the stream
    }
}

export const getGitDetails = async (userName, repoName) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${userName}/${repoName}`
      );
      if (response.status !== 200) throw Error("No repo found!");
      return response.json();
    } catch (e) {
      console.error(e);
      throw Error("Error getting git details");
    }
  };
  
  export const getUserRepoName = (giturl) => {
    const girURLSplitArr = giturl.split("/");
    const length = girURLSplitArr.length;
    if (length < 1) throw Error("Not a valid github url");
    return [
      girURLSplitArr[length - 2],
      girURLSplitArr[length - 1]?.replace(".git", ""),
    ];
  };
  
//uploadDeploymentLog({deployment: "2afe74dd-c342-4493-aa64-520cd08c9bd5", projectID: "df", log: "afaf"})
//updateProjectStatus({status: 'asd', id: '7d4ba0a4-62fb-4c2f-8417-d3b8b432c2b6'})