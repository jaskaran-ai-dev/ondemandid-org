// iVALT API client

import type {
  IvaltAuthRequestResponse,
  IvaltAuthResultResponse,
  IvaltGeoFenceResponse,
} from "./types"

const IVALT_API_BASE_URL = process.env.IVALT_API_BASE_URL || "https://api.ivalt.com"
const IVALT_API_KEY = process.env.IVALT_API_KEY

if (!IVALT_API_KEY) {
  console.warn("IVALT_API_KEY not set - iVALT API calls will fail")
}

async function ivaltRequest<T>(
  endpoint: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const url = `${IVALT_API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${IVALT_API_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `iVALT API error (${response.status}): ${errorText || response.statusText}`,
    )
  }

  return response.json()
}

/**
 * Trigger biometric authentication request
 * POST /biometric-auth-request
 */
export async function triggerAuthRequest(params: {
  idConnection: string
  countryCode: string
  mobile: string
}): Promise<IvaltAuthRequestResponse> {
  return ivaltRequest<IvaltAuthRequestResponse>("/biometric-auth-request", {
    id_connection: params.idConnection,
    country_code: params.countryCode,
    mobile: params.mobile,
  })
}

/**
 * Poll for authentication result
 * POST /biometric-auth-result
 */
export async function getAuthResult(requestId: string): Promise<IvaltAuthResultResponse> {
  return ivaltRequest<IvaltAuthResultResponse>("/biometric-auth-result", {
    request_id: requestId,
  })
}

/**
 * Geo-fence + time window validation (optional)
 * POST /biometric-geo-fence-auth-results
 */
export async function getGeoFenceResult(requestId: string): Promise<IvaltGeoFenceResponse> {
  return ivaltRequest<IvaltGeoFenceResponse>("/biometric-geo-fence-auth-results", {
    request_id: requestId,
  })
}

// Status code mapping from iVALT HTTP codes to internal status
export function mapIvaltStatus(statusCode: number): {
  status: "authenticated" | "failed" | "not_found" | "pending"
  ivaltStatusCode: number
} {
  switch (statusCode) {
    case 200:
      return { status: "authenticated", ivaltStatusCode: 200 }
    case 404:
      return { status: "not_found", ivaltStatusCode: 404 }
    case 422:
      return { status: "pending", ivaltStatusCode: 422 }
    case 403:
      return { status: "failed", ivaltStatusCode: 403 }
    default:
      return { status: "failed", ivaltStatusCode: statusCode }
  }
}
