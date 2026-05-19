import type { Config } from "drizzle-kit"

// Use PostgreSQL for production (Neon)
export default {
  schema: "./lib/db/schema.pg.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config
