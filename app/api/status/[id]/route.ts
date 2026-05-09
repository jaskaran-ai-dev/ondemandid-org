import { NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"
import { getAuthResult, mapIvaltStatus } from "@/lib/ivalt"
import { simRequests } from "@/lib/sim-store"

// Demo mode handler
async function handleDemoMode(id: string) {
  const r = simRequests.get(id)

  if (!r) {
    return { id, status: "not_found", ivaltStatusCode: 404 }
  }

  // If already terminal, return as-is
  if (
    r.status === "authenticated" ||
    r.status === "failed" ||
    r.status === "not_found"
  ) {
    return {
      id: r.id,
      status: r.status,
      ivaltStatusCode: r.ivaltStatusCode,
      completedAt: r.completedAt,
    }
  }

  const now = Date.now()
  if (now >= r.resolveAt) {
    r.status = r.finalStatus
    r.ivaltStatusCode = r.finalCode
    r.completedAt = now
    simRequests.set(r.id, r)
    return {
      id: r.id,
      status: r.status,
      ivaltStatusCode: r.ivaltStatusCode,
      completedAt: r.completedAt,
    }
  }

  return {
    id: r.id,
    status: "pending",
    ivaltStatusCode: 422,
  }
}

// Production mode handler
async function handleProductionMode(id: string) {
  // Query the database for the request
  const requests = await db
    .select()
    .from(schema.ondemandRequests)
    .where(eq(schema.ondemandRequests.id, id))
    .limit(1)

  if (requests.length === 0) {
    return { id, status: "not_found", ivaltStatusCode: 404 }
  }

  const request = requests[0]

  // If already terminal (authenticated, failed, not_found, error), return as-is
  if (
    request.status === "authenticated" ||
    request.status === "failed" ||
    request.status === "not_found" ||
    request.status === "error"
  ) {
    return {
      id: request.id,
      status: request.status,
      ivaltStatusCode: request.ivaltStatusCode,
      completedAt: request.completedAt,
    }
  }

  // If pending or initiated, query iVALT API for latest status
  if (request.status === "pending" || request.status === "initiated") {
    try {
      const authResult = await getAuthResult(id)
      
      // Map iVALT status code to internal status
      const { status, ivaltStatusCode } = mapIvaltStatus(authResult.statusCode)

      // Update database with latest status
      const updateData: any = {
        status,
        ivaltStatusCode,
        ivaltResponse: process.env.DB_TYPE === "neon" ? authResult : JSON.stringify(authResult),
      }

      // If terminal, set completedAt
      if (status === "authenticated" || status === "failed" || status === "not_found") {
        updateData.completedAt = new Date().toISOString()
      }

      await db
        .update(schema.ondemandRequests)
        .set(updateData)
        .where(eq(schema.ondemandRequests.id, id))

      return {
        id: request.id,
        status,
        ivaltStatusCode,
        completedAt: updateData.completedAt,
      }
    } catch (error) {
      console.error("iVALT status API error:", error)
      // Return current pending status on error
      return {
        id: request.id,
        status: "pending",
        ivaltStatusCode: request.ivaltStatusCode || 422,
      }
    }
  }

  // Default return for any other status
  return {
    id: request.id,
    status: request.status,
    ivaltStatusCode: request.ivaltStatusCode || 422,
  }
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  try {
    const isDemoMode = process.env.DEMO_MODE === "true"

    const result = isDemoMode 
      ? await handleDemoMode(id)
      : await handleProductionMode(id)

    if ("status" in result && result.status === "not_found") {
      return NextResponse.json(result, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 },
    )
  }
}
