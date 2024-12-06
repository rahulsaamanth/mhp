import { drizzle } from "drizzle-orm/postgres-js"
// import { neon } from "@neondatabase/serverless"
import postgres from "postgres"
import * as schema from "./schema"
import * as relations from "./relations"

export const sql = postgres(process.env.DATABASE_URL!)

export const db = drizzle(sql, { schema: { ...schema, ...relations } })
