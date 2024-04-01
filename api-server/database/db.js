import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema.js';
import 'dotenv/config'

const dbClient = postgres(process.env.POSTGRESDB || 'postgresql://staticdb_owner:4iGofK6weLTF@ep-black-mud-a10kvnhw.ap-southeast-1.aws.neon.tech/staticdb?sslmode=require');
export const db = drizzle(dbClient, {schema});
