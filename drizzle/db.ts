import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"
import * as relations from "./relations"

export const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql, { schema: { ...schema, ...relations } })
