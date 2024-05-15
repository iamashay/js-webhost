import { db } from "../../database/db.js"
import { eq } from "drizzle-orm"
import { projects } from "../../database/schema.js";
import namor from 'namor'

export const generateSlug = async () => {
    let tries = 10;
    while (tries--) {
        const slug = namor.generate({words: 3, salt: 0}) 
        const match = await db.query.projects.findFirst({where: eq(projects.slug, slug)})
        //console.log(slug, match)
        if (!match) return slug
    }
    throw new Error('Max number of tries reached for slug generation')
}