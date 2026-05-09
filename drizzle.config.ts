import type { Config } from "drizzle-kit"

const dbType = process.env.DB_TYPE || "sqlite"

export default {
  schema: dbType === "neon" ? "./lib/db/schema.pg.ts" : "./lib/db/schema.sqlite.ts",
  out: "./drizzle",
  dialect: dbType === "neon" ? "postgresql" : "sqlite",
  dbCredentials: dbType === "neon" 
    ? { url: process.env.DATABASE_URL! }
    : { url: process.env.SQLITE_DB_PATH || "./local.db" },
} satisfies Config
