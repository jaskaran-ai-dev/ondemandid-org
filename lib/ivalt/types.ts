// iVALT API response types

export interface IvaltAuthRequestResponse {
  status: "initiated" | "pending"
  requestId: string
  message?: string
}

export interface IvaltAuthResultResponse {
  status: "authenticated" | "failed" | "not_found" | "pending"
  statusCode: number
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
