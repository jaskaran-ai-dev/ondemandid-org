// iVALT API response types

export interface IvaltAuthRequestResponse {
  status: "initiated" | "pending"
  requestId: string
  message?: string
}

// New response format from iVALT API
export interface IvaltAuthResultData {
  status: boolean
  message?: string
  details?: {
    id_connection?: string
    mobile?: string
    [key: string]: unknown
  }
}

export interface IvaltAuthResultResponse {
  // New response format
  data?: {
    status: boolean
    message?: string
    details?: Record<string, unknown>
  }
  error?: null | {
    type?: string
    title?: string
    status?: number
    detail?: string | string[]
    instance?: string
  }
  debug?: {
    timestamp: string
    activityId: string
  }
  // Legacy response format (for backwards compatibility)
  status?: "authenticated" | "failed" | "not_found" | "pending"
  statusCode?: number
  timestamp?: string
  message?: string
}

export interface IvaltGeoFenceResponse {
  status: "authenticated" | "failed"
  statusCode: number
  location?: {
    latitude: number
    longitude: number
    accuracy: number
  }
  timestamp?: string
}