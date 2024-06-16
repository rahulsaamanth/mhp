import { DB as Database } from "@/db/types"
import { Pool } from "pg"
import { Kysely, PostgresDialect } from "kysely"

import fs from "fs"
import path from "path"

const certPath = path.resolve(process.cwd(), process.env.DB_SSL_CA as string)
const sslCert = fs.readFileSync(certPath)

const dialect = new PostgresDialect({
  pool: new Pool({
    ssl: {
      rejectUnauthorized: true,
      ca: sslCert,
    },
    database: "auth",
    host: "next-auth.c9qg0e4ke7mx.ap-south-1.rds.amazonaws.com",
    user: "postgres",
    password: "postgres",
    port: 5432,
    max: 10,
  }),
})

export const db = new Kysely<Database>({
  dialect,
})
