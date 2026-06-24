import {
  pgTable,
  unique,
  text,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const customers = pgTable(
  'customers',
  {
    id: text().default(gen_random_uuid()).primaryKey().notNull(),
    companyName: text('company_name').notNull(),
    contactName: text('contact_name').notNull(),
    email: text().notNull(),
    countryCode: text('country_code').notNull(),
    mobile: text().notNull(),
    initialUsers: integer('initial_users').notNull(),
    idConnection: text('id_connection'),
    status: text().default('pending').notNull(),
    notes: text(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    unique('customers_email_unique').on(table.email),
    unique('customers_id_connection_unique').on(table.idConnection),
  ]
);

export const ondemandRequests = pgTable('ondemand_requests', {
  id: text().default(gen_random_uuid()).primaryKey().notNull(),
  countryCode: text('country_code').notNull(),
  mobile: text().notNull(),
  idConnection: text('id_connection').notNull(),
  requestFrom: text('request_from'),
  status: text().default('initiated').notNull(),
  ivaltStatusCode: integer('ivalt_status_code'),
  ivaltResponse: jsonb('ivalt_response'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { mode: 'string' }),
});
