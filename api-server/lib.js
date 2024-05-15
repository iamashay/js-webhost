import {db} from '../database/db.js'
import {projects} from '../database/schema.js'
import { eq } from "drizzle-orm";

export const getProjectsCountByUser = async ({userId}) => {
    if (!userId) throw new Error("Invalid user!")
    const projectsCount = await db.select({count: count()}).from(projects).where({where: eq(projects.userId, userId)})
    return projectsCount
}

//updateProjectStatus({status: 'asd', id: '7d4ba0a4-62fb-4c2f-8417-d3b8b432c2b6'})