import { NextResponse } from "next/server"
import { verifySchema } from "@/lib/validation"
import { simRequests } from "@/lib/sim-store"

// IDCONNECTION codes that simulate "user not registered in iVALT".
const NOT_REGISTERED_CODES = new Set(["MISSING01"])

function isActiveConnection(code: string) {
  // Allow any 4-12 alphanumeric code for the demo.
  return /^[A-Z0-9]{4,12}$/.test(code)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = verifySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid verification payload",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { idConnection, countryCode, mobile } = parsed.data

    if (!isActiveConnection(idConnection)) {
      return NextResponse.json(
        {
          error: "IDCONNECTION not found or inactive",
          status: "not_found",
        },
        { status: 404 },
      )
    }

    // Simulate request creation latency.
    await new Promise((r) => setTimeout(r, 400))

    const id = `req_${Math.random().toString(36).slice(2, 10)}`
    const now = Date.now()

    // Decide final outcome for the demo.
    let finalStatus: "authenticated" | "failed" | "not_found" = "authenticated"
    let finalCode = 200
    if (NOT_REGISTERED_CODES.has(idConnection)) {
      finalStatus = "not_found"
      finalCode = 404
    } else if (mobile.endsWith("0000")) {
      finalStatus = "failed"
      finalCode = 403
    }

    // Resolve after 4–7 seconds for a believable polling experience.
    const resolveAt = now + 4000 + Math.floor(Math.random() * 3000)

    simRequests.set(id, {
      id,
      idConnection,
      countryCode,
      mobile,
      status: "pending",
      ivaltStatusCode: 422,
      createdAt: now,
      resolveAt,
      finalStatus,
      finalCode,
    })

    return NextResponse.json(
      {
        ok: true,
        id,
        status: "initiated",
        ivaltStatusCode: 422,
        message: "Push notification dispatched to user's iVALT mobile app",
      },
      { status: 202 },
    )
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 })
  }
}
