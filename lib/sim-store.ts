// In-memory simulated iVALT request store, shared between /api/verify and
// /api/status/[id]. UI-only build — not durable across cold starts.

export type SimulatedRequest = {
  id: string
  idConnection: string
  countryCode: string
  mobile: string
  status:
    | "initiated"
    | "pending"
    | "authenticated"
    | "failed"
    | "not_found"
    | "error"
  ivaltStatusCode: number
  createdAt: number
  resolveAt: number
  completedAt?: number
  finalStatus: "authenticated" | "failed" | "not_found"
  finalCode: number
}

declare global {
  // eslint-disable-next-line no-var
  var __ivaltSimRequests: Map<string, SimulatedRequest> | undefined
}

export const simRequests: Map<string, SimulatedRequest> =
  globalThis.__ivaltSimRequests ?? new Map<string, SimulatedRequest>()

if (!globalThis.__ivaltSimRequests) {
  globalThis.__ivaltSimRequests = simRequests
}
