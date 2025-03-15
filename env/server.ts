import { createEnv } from "@t3-oss/env-nextjs"
import * as z from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url().min(1),
    DB_HOST: z.string().min(1),
    DB_PORT: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
    AUTH_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    AWS_BUCKET_NAME: z.string().min(1),
    AWS_BUCKET_REGION: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),

    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),

    REDIS_URL: z.string().min(1),
    REDIS_TOKEN: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
