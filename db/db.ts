import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import * as _db from "@rahulsaamanth/mhp-schema"

const sql = neon(
  "postgresql://mhp_admin:npg_YonX82fpPIQe@ep-black-wind-a10224g3.ap-southeast-1.aws.neon.tech/mhp0?sslmode=require"
)

export const db = drizzle(
  "postgresql://mhp_admin:npg_YonX82fpPIQe@ep-black-wind-a10224g3.ap-southeast-1.aws.neon.tech/mhp0?sslmode=require",
  {
    schema: _db,
    // logger: true,
  }
)

export { sql }
