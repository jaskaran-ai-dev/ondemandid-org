import { NextResponse } from "next/server"
import { signupSchema } from "@/lib/validation"
import { db, schema } from "@/lib/db"
import { sendAdminSignupNotification, sendCustomerConfirmation } from "@/lib/email"

// Demo mode handler
async function handleDemoMode(body: any) {
  await new Promise((r) => setTimeout(r, 600))
  const id = `cust_${Math.random().toString(36).slice(2, 10)}`
  return {
    ok: true,
    id,
    status: "pending",
    message: "Signup received. An iVALT representative will provision your IDCONNECTION code within one business day.",
  }
}

// Production mode handler
async function handleProductionMode(data: any) {
  const customer = await db.insert(schema.customers).values({
    companyName: data.companyName,
    contactName: data.contactName,
    email: data.email,
    countryCode: data.countryCode,
    mobile: data.mobile,
    initialUsers: data.initialUsers,
    notes: data.notes || null,
    status: "pending",
  }).returning()

  const customerId = customer[0].id

  // Send emails (non-blocking, graceful degradation)
  Promise.all([
    sendAdminSignupNotification({
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      countryCode: data.countryCode,
      mobile: data.mobile,
      initialUsers: data.initialUsers,
      notes: data.notes || "",
      customerId,
    }).catch((error) => {
      console.error("Failed to send admin notification email:", error)
    }),
    sendCustomerConfirmation({
      email: data.email,
      companyName: data.companyName,
      customerId,
    }).catch((error) => {
      console.error("Failed to send customer confirmation email:", error)
    }),
  ])

  return {
    ok: true,
    id: customerId,
    status: "pending",
    message: "Signup received. An iVALT representative will provision your IDCONNECTION code within one business day.",
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid signup payload",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const data = parsed.data
    const isDemoMode = process.env.DEMO_MODE === "true"

    const result = isDemoMode 
      ? await handleDemoMode(body)
      : await handleProductionMode(data)

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Failed to process signup" },
      { status: 500 },
    )
  }
}
