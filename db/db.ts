import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import * as _db from "@rahulsaamanth/mhp-schema"

const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: _db,
  logger: true,
})

export { sql }
