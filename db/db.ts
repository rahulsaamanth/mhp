import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import * as Database from "@rahulsaamanth/mhp_shared-schema"

const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: Database,
  logger: true,
})

export { sql }
