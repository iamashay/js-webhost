import { deploymentLogs, deployments, projectType, projects } from "../../database/schema.js";
import { db } from "../../database/db.js";
import { generateSlug } from "../lib/utils.js";
import { getGitDetails, getUserRepoName } from "../lib/github.js";
import { queueClient } from "../queue/queueClient.js";
import { ZodError } from "zod";
import { DrizzleError, and, desc, eq } from "drizzle-orm";
const {MAX_GIT_SIZE, BUILDQUEUE} = process.env



export const viewAllDeploymentController = async (req, res) => {
  try {

    const { projectId } = req.params;
    const userId = req.user.id
    //console.log(userName, repoName)
    console.log(projectId, userId)

    const deployment = await db.select({
      id: deployments.id,
      createdAt: deployments.createdAt,
      status: deployments.status,
    }).from(deployments).innerJoin(projects, eq(deployments.project, projects.id)).where(and(eq(projects.userId, userId), eq(projects.id, projectId))).orderBy(desc(deployments.createdAt))

    if (deployment?.length === 0 || !deployment) throw new Error('No deployments found!')

    return res.status(200).json(deployment);
  } catch (e) {
    //console.log(e)
    if (e.code === '22P02')
      return res.status(400).json({ error: 'Invalid project id' });
    return res.status(400).json({ error: 'Some error occured while finding the deployments' });
    
  }
}

export const viewDeployment = async (req, res) => {
  try {

    const { deploymentId } = req.params;
    const userId = req.user.id
    //console.log(userName, repoName)
    console.log(deploymentId, userId)

    const deployment = await db.select({
      id: deployments.id,
      createdAt: deployments.createdAt,
      status: deployments.status,
    }).from(deployments).innerJoin(projects, eq(deployments.project, projects.id)).where(and(eq(projects.userId, userId), eq(deployments.id, deploymentId)))

    if (deployment?.length === 0 || !deployment) throw new Error('No deployment found!')

    return res.status(200).json(...deployment);
  } catch (e) {
    //console.log(e)
    if (e.code === '22P02')
      return res.status(400).json({ error: 'Invalid deployment id' });
    return res.status(400).json({ error: 'Some error occured while finding the deployment' });
    
  }
}

export const viewDeploymentLog = async (req, res) => {
  try {

    const { deploymentId } = req.params;
    const userId = req.user.id
    //console.log(userName, repoName)
    console.log(deploymentId, userId)

    const deployment = await db.select({
      id: deploymentLogs.id,
      createdAt: deploymentLogs.createdAt,
      outputLog: deploymentLogs.outputLog,
    }).from(deploymentLogs).innerJoin(deployments, eq(deployments.id, deploymentLogs.deployment)).innerJoin(projects, eq(deployments.project, projects.id)).where(and(eq(projects.userId, userId), eq(deploymentLogs.deployment, deploymentId)))
    console.log(deployment)
    if (deployment?.length === 0 || !deployment) throw new Error('No deployment found!')

    return res.status(200).json(...deployment);
  } catch (e) {
    console.log(e)
    if (e.code === '22P02')
      return res.status(400).json({ error: 'Invalid deployment id' });
    return res.status(400).json({ error: 'Some error occured while finding the deployment' });
    
  }
}