import {db} from '../database/db.js'
import {projects, deployments, deploymentLogs} from '../database/schema.js'
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

export class StreamLogger extends Transform {
    constructor(logger, type) {
        super()
        this.logger = logger    
        this.type = type
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
//uploadDeploymentLog({deployment: "2afe74dd-c342-4493-aa64-520cd08c9bd5", projectID: "df", log: "afaf"})
//updateProjectStatus({status: 'asd', id: '7d4ba0a4-62fb-4c2f-8417-d3b8b432c2b6'})