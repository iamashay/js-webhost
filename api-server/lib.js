import namor from 'namor'
import {db} from '../database/db.js'
import {projects} from '../database/schema.js'
import { eq } from "drizzle-orm";

export const generateSlug = async () => {
    let tries = 10;
    while (tries--) {
        const slug = namor.generate({words: 2, salt: 5}) 
        const match = await db.query.projects.findFirst({where: eq(projects.slug, slug)})
        //console.log(slug, match)
        if (!match) return slug
    }
    throw new Error('Max number of tries reached for slug generation')
}


const createProject = async ({gitURL}) => {
    if (!gitURL) throw new Error('No git url provided!')
    const project = {
        slug: await generateSlug()
    }
    const createProject = await db.insert(projects).values(project).returning({ id: projects.id })
}

const updateProjectStatus = async ({id, status}) => {
    if (!id || !status) throw new Error('No id or status provided')
    const createProject = await db.update(projects).set({status}).where(eq(projects.id, id)).returning({id: projects.id })
    if (createProject.length > 0) return true
    throw new Error(`Couldn't update the status for id ${id}`)
}

export const getProjectsCountByUser = async ({userId}) => {
    if (!userId) throw new Error("Invalid user!")
    const projectsCount = await db.select({count: count()}).from(projects).where({where: eq(projects.userId, userId)})
    return projectsCount
}

//updateProjectStatus({status: 'asd', id: '7d4ba0a4-62fb-4c2f-8417-d3b8b432c2b6'})