import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import * as Database from "@rahulsaamanth/mhp_shared-schema"
import { env } from "@/env/server"

const sql = neon(env.DATABASE_URL)

export const db = drizzle(env.DATABASE_URL, {
  schema: Database,
  logger: true,
})

export { sql }
