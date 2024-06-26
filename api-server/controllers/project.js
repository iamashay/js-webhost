import { projectType, projects } from "../../database/schema.js";
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

export const viewProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id
    //console.log(userName, repoName)
    const project = await db.select({
      slug: projects.slug,
      gitURL: projects.gitURL,
      createdAt: projects.createdAt,
      buildScript: projects.buildScript,
      buildFolder: projects.buildFolder,
      projectType: projects.projectType
    }).from(projects).where(and(eq(projects.userId, userId), eq(projects.id, projectId)))
    if (project?.length === 0 || !project) throw new Error('No project found!')
    return res.status(200).json(project[0]);
  } catch (e) {
    if (e.code === '22P02')
      return res.status(400).json({ error: 'Invalid project id' });
    return res.status(400).json({ error: 'Some error occured while finding the project' });
    
  }
}

export const viewAllProjectsController = async (req, res) => {
  try {
    const userId = req.user.id
    //console.log(userName, repoName)
    const project = await db.select({
      id: projects.id,
      slug: projects.slug,
      gitURL: projects.gitURL,
      createdAt: projects.createdAt,
      buildScript: projects.buildScript,
      buildFolder: projects.buildFolder,
      projectType: projects.projectType
    }).from(projects).where(eq(projects.userId, userId))
    console.log(project)
    if (project?.length === 0 || !project) throw new Error('No projects found!')
    return res.status(200).json(project);
  } catch (e) {
    if (e.code === '22P02')
      return res.status(400).json({ error: 'Invalid project id' });
    console.log(e)
    return res.status(400).json({ error: 'Some error occured while finding the project' });
  }
}

