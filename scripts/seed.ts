import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { customers } from "@/lib/db/schema.pg"
import { sql } from "drizzle-orm"

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client, { schema: { customers } })

async function main() {
  console.log("Seeding database...")
  
  const existing = await db.select().from(customers).where(
    sql`country_code = '+91' AND mobile = '9530654704'`
  ).limit(1)
  
  if (existing.length > 0) {
    console.log("Customer already exists, skipping...")
    await client.end()
    return
  }

  const result = await db.insert(customers).values({
    companyName: "iVALT Test Org",
    contactName: "Test User",
    email: "test@ivalt.com",
    countryCode: "+91",
    mobile: "9530654704",
    initialUsers: 10,
    idConnection: "ivalt",
    status: "active",
    notes: "Dummy test data",
  }).returning()
  
  console.log("Added customer:", result[0])
  await client.end()
}

main().catch(console.error)