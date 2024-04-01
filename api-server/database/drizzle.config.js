import "dotenv/config";

export default {
  schema: "./schema.js",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.POSTGRESDB,
  },
}