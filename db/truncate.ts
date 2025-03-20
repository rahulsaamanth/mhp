import { db } from "./db"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

async function truncateAll() {
  // Create a new connection for raw SQL
  const queryClient = postgres(process.env.DATABASE_URL!, {
    max: 1,
  })

  try {
    // Drop all tables using raw SQL
    await queryClient`
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN
        FOR r IN (
          SELECT tablename 
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename != '_drizzle_migrations'
        ) 
        LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `

    console.log("✅ Successfully dropped all tables")
  } catch (error) {
    console.error("❌ Error dropping tables:", error)
    process.exit(1)
  } finally {
    // Close the connection
    await queryClient.end()
    process.exit(0)
  }
}

truncateAll()
