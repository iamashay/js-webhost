import {db} from '../../database/db.js'
import {projects, deployments, deploymentLogs} from '../../database/schema.js'
import { and, eq, gt, inArray, not } from "drizzle-orm";
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

export const checkLatestDeployment = async ({projectId}) => {
    if (!projectId) throw new Error("No project id provided")
    const now = new Date()
    const dateLimit = new Date(now.getTime() - 2400 * 60 * 60 * 1000); //sets a range within which we check for status that are not 'Error' or 'Deployed' to halt the deployment
    const checkDeployment = await db.query.deployments.findFirst({where: and(eq(projectId, deployments.project), gt(deployments.createdAt, dateLimit), not(inArray(deployments.status, ['Error', 'Deployed'])))})
    console.log(checkDeployment, dateLimit)
    if (checkDeployment) throw new Error('Deployment already in progress!')
}