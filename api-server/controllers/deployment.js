import { deploymentLogs, deployments, projectType, projects } from "../../database/schema.js";
import { buildSchema } from "../validation/project.js";
import { db } from "../../database/db.js";
import { generateSlug } from "../lib/utils.js";
import { getGitDetails, getUserRepoName } from "../lib/github.js";
import { queueClient } from "../queue/queueClient.js";
import { ZodError } from "zod";
import { DrizzleError, and, eq } from "drizzle-orm";
const {MAX_GIT_SIZE, BUILDQUEUE} = process.env

let conn, gitProducerChannel;

(async () => {
  //console.log(queueClient)
  conn = await queueClient();
  gitProducerChannel = await conn.createChannel();
})();

export const buildController = async (req, res) => {
    try {
      const body = await buildSchema.parseAsync(req.body);
      const { gitURL, buildScript, buildFolder } = body;
      const [userName, repoName] = getUserRepoName(gitURL);
      //console.log(userName, repoName)
      const getDetails = await getGitDetails(userName, repoName);
      if (getDetails?.size > MAX_GIT_SIZE) throw Error("Repo is too large!");
      // console.log(getDetails)
      const project = {
        gitURL,
        slug: await generateSlug(),
        userId: req.user.id,
        buildFolder,
        buildScript
      };
      //console.log(project);
      const createProject = await db.insert(projects).values(project).returning({
        slug: projects.slug,
        gitURL: projects.gitURL,
        id: projects.id,
        buildFolder: projects.buildFolder,
        buildScript: projects.buildScript
      });
      //console.log(createProject);
      if (createProject.length !== 1)
        throw new Error("Some error occured, new project more than one or none");
      const newProject = createProject[0];
      const projectDataString = JSON.stringify(newProject);
      await gitProducerChannel.assertQueue(BUILDQUEUE, { durable: true });
      await gitProducerChannel.sendToQueue(
        BUILDQUEUE,
        Buffer.from(projectDataString),
        {
          persistent: true,
        }
      );
      return res.status(200).json(newProject);
    } catch (e) {
      if (e instanceof ZodError)
        return res.status(400).json({ error: e.errors[0].message });
        
      return res.status(400).json({ error: e.message });
    }
}

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
    }).from(deployments).innerJoin(projects, eq(deployments.project, projects.id)).where(and(eq(projects.userId, userId), eq(projects.id, projectId)))

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