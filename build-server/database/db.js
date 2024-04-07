import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema.js';
import 'dotenv/config'

export const dbClient = postgres(process.env.POSTGRESDB);
export const db = drizzle(dbClient, {schema});
