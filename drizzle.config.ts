import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle/",
  schema: "./drizzle/schema.ts",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: true,
  },
  verbose: true,
  strict: true,
})
