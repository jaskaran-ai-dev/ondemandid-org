import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull().unique(),
  countryCode: text("country_code").notNull(),
  mobile: text("mobile").notNull(),
  initialUsers: integer("initial_users").notNull(),
  idConnection: text("id_connection").unique(),
  status: text("status").notNull().default("pending"), // pending, active, inactive
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(strftime('%s', 'now'))`),
})

export const ondemandRequests = sqliteTable("ondemand_requests", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  countryCode: text("country_code").notNull(),
  mobile: text("mobile").notNull(),
  idConnection: text("id_connection").notNull(),
  requestFrom: text("request_from"),
  status: text("status").notNull().default("initiated"), // initiated, pending, authenticated, failed, not_found, error
  ivaltStatusCode: integer("ivalt_status_code"),
  ivaltResponse: text("ivalt_response"), // JSON string for SQLite
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: text("created_at").notNull().default(sql`(strftime('%s', 'now'))`),
  completedAt: text("completed_at"),
})
