import { NextResponse } from "next/server"
import { simRequests } from "@/lib/sim-store"

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const r = simRequests.get(id)

  if (!r) {
    return NextResponse.json(
      { id, status: "not_found", ivaltStatusCode: 404 },
      { status: 404 },
    )
  }

  // If already terminal, return as-is.
  if (
    r.status === "authenticated" ||
    r.status === "failed" ||
    r.status === "not_found"
  ) {
    return NextResponse.json({
      id: r.id,
      status: r.status,
      ivaltStatusCode: r.ivaltStatusCode,
      completedAt: r.completedAt,
    })
  }

  const now = Date.now()
  if (now >= r.resolveAt) {
    r.status = r.finalStatus
    r.ivaltStatusCode = r.finalCode
    r.completedAt = now
    simRequests.set(r.id, r)
    return NextResponse.json({
      id: r.id,
      status: r.status,
      ivaltStatusCode: r.ivaltStatusCode,
      completedAt: r.completedAt,
    })
  }

  return NextResponse.json({
    id: r.id,
    status: "pending",
    ivaltStatusCode: 422,
  })
}
