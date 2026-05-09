import { drizzle } from "drizzle-orm/postgres-js"
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3"
import postgres from "postgres"
import Database from "better-sqlite3"
import * as pgSchema from "./schema.pg"
import * as sqliteSchema from "./schema.sqlite"

const dbType = process.env.DB_TYPE || "sqlite"

let db: any
let schema: any

if (dbType === "neon" && process.env.DATABASE_URL) {
  // PostgreSQL (Neon)
  const client = postgres(process.env.DATABASE_URL)
  db = drizzle(client, { schema: pgSchema })
  schema = pgSchema
} else {
  // SQLite (local development)
  const dbPath = process.env.SQLITE_DB_PATH || "./local.db"
  const sqlite = new Database(dbPath)
  db = drizzleSqlite(sqlite, { schema: sqliteSchema })
  schema = sqliteSchema
}

export { db, schema }
export type DbType = typeof db
