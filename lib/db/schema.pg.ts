import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const customers = pgTable("customers", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull().unique(),
  countryCode: text("country_code").notNull(),
  mobile: text("mobile").notNull(),
  initialUsers: integer("initial_users").notNull(),
  idConnection: text("id_connection").unique(),
  status: text("status").notNull().default("pending"), // pending, active, inactive
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const ondemandRequests = pgTable("ondemand_requests", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  countryCode: text("country_code").notNull(),
  mobile: text("mobile").notNull(),
  idConnection: text("id_connection").notNull(),
  requestFrom: text("request_from"),
  status: text("status").notNull().default("initiated"), // initiated, pending, authenticated, failed, not_found, error
  ivaltStatusCode: integer("ivalt_status_code"),
  ivaltResponse: jsonb("ivalt_response"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
})
