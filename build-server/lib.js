import {db} from '../api-server/database/db.js'
import {projects, deployments, deploymentLogs} from '../api-server/database/schema.js'
import { eq } from "drizzle-orm";


export const createDeployement = async ({id, status}) => {
    if (!id) throw new Error('No id or status provided')
    if (!status) status = "Initial"
    const createDeployment = await db.insert(deployments).values({project: id, status}).returning({id: deployments.id })
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
//uploadDeploymentLog({deployment: "2afe74dd-c342-4493-aa64-520cd08c9bd5", projectID: "df", log: "afaf"})
//updateProjectStatus({status: 'asd', id: '7d4ba0a4-62fb-4c2f-8417-d3b8b432c2b6'})