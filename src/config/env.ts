import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.string().default("development"),
  ADMIN_TOKEN: z.string().default(""),
  APP_BASE_URL: z.string().default("http://localhost:3000"),
  APP_TIMEZONE: z.string().default("America/Sao_Paulo")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN,
  APP_BASE_URL: process.env.APP_BASE_URL,
  APP_TIMEZONE: process.env.APP_TIMEZONE
});
