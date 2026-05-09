import { NextResponse } from "next/server"
import { signupSchema } from "@/lib/validation"

// UI-only build: signups are validated and acknowledged but not persisted.
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

    // Simulate processing latency for realism.
    await new Promise((r) => setTimeout(r, 600))

    const id = `cust_${Math.random().toString(36).slice(2, 10)}`

    return NextResponse.json(
      {
        ok: true,
        id,
        status: "pending",
        message:
          "Signup received. An iVALT representative will provision your IDCONNECTION code within one business day.",
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 })
  }
}
