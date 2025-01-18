import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle/",
  schema: "./db/schema.ts",
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

// // db/index.ts
// import { Pool, PoolConfig } from 'pg';

// // Type for global pool to handle Next.js hot reloading
// declare global {
//   var pool: Pool | undefined;
// }

// const config: PoolConfig = {
//   connectionString: process.env.DATABASE_URL,
//   max: 20,
//   idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
//   connectionTimeoutMillis: 2000,
//   ssl: process.env.NODE_ENV === 'production' ? {
//     rejectUnauthorized: false
//   } : false,
// };

// function createPool() {
//   const pool = new Pool(config);

//   // Log pool events in development
//   if (process.env.NODE_ENV === 'development') {
//     pool.on('connect', () => {
//       console.log('Pool => New connection');
//       console.log('Total:', pool.totalCount, 'Idle:', pool.idleCount, 'Waiting:', pool.waitingCount);
//     });

//     pool.on('remove', () => {
//       console.log('Pool => Connection removed');
//       console.log('Total:', pool.totalCount, 'Idle:', pool.idleCount, 'Waiting:', pool.waitingCount);
//     });
//   }

//   // Handle pool errors
//   pool.on('error', (err) => {
//     console.error('Unexpected pool error:', err);
//   });

//   return pool;
// }

// // In development, we store the pool on the global object to prevent
// // creating new pools on hot reload
// export const pool = global.pool ?? createPool();

// if (process.env.NODE_ENV === 'development') {
//   global.pool = pool;
// }

// // Helper for queries
// export async function query(text: string, params?: any[]) {
//   const start = Date.now();
//   try {
//     const res = await pool.query(text, params);
//     const duration = Date.now() - start;

//     if (process.env.NODE_ENV === 'development') {
//       console.log('Executed query', { text, duration, rows: res.rowCount });
//     }

//     return res;
//   } catch (error) {
//     console.error('Error executing query', { text, error });
//     throw error;
//   }
// }

// // Helper for transactions
// export async function withTransaction<T>(
//   callback: (client: any) => Promise<T>
// ): Promise<T> {
//   const client = await pool.connect();

//   try {
//     await client.query('BEGIN');
//     const result = await callback(client);
//     await client.query('COMMIT');
//     return result;
//   } catch (error) {
//     await client.query('ROLLBACK');
//     throw error;
//   } finally {
//     client.release();
//   }
// }

// // Add this if you're using a custom server or need explicit cleanup
// if (process.env.NEXT_MANUAL_SIG_HANDLE) {
//   process.on('SIGTERM', async () => {
//     console.log('SIGTERM received, closing pool...');
//     try {
//       await pool.end();
//       console.log('Pool successfully closed');
//     } catch (error) {
//       console.error('Error closing pool:', error);
//     }
//   });
// }
