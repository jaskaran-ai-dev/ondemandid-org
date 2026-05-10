// Simple in-memory rate limiter for API routes
// In production, replace with Redis-backed rate limiting

type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Check if a request should be rate limited.
 * @param key - Unique identifier (e.g., IP address or user ID)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed flag and remaining count
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(key, newEntry)
    return { allowed: true, remaining: maxRequests - 1, resetAt: newEntry.resetAt }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}

/**
 * Basic HTML tag stripping to prevent XSS in plain text contexts.
 * For HTML email templates, use a proper HTML sanitizer like DOMPurify server-side.
 */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return ""
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()
}

/**
 * Verify a Cloudflare Turnstile token server-side.
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    console.warn("TURNSTILE_SECRET_KEY not set — skipping CAPTCHA verification")
    return true
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }).toString(),
      },
    )

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("Turnstile verification error:", error)
    return false
  }
}
