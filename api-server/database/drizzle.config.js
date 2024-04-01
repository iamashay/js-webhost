import "dotenv/config";

export default {
  schema: "./schema.js",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.POSTGRESDB || 'postgresql://staticdb_owner:4iGofK6weLTF@ep-black-mud-a10kvnhw.ap-southeast-1.aws.neon.tech/staticdb?sslmode=require',
  },
}