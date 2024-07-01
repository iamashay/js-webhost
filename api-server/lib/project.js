import {db} from '../../database/db.js'
import {projects, deployments, deploymentLogs} from '../../database/schema.js'
import { eq } from "drizzle-orm";
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