export type CaptchaProvider = "turnstile" | "recaptcha"

export function getCaptchaProvider(): CaptchaProvider {
  const provider = process.env.CAPTCHA_PROVIDER
  if (provider === "recaptcha") return "recaptcha"
  return "turnstile"
}

export function getCaptchaSiteKey(): string | undefined {
  const provider = getCaptchaProvider()
  if (provider === "recaptcha") {
    return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  }
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
}

export function getPublicCaptchaProvider(): CaptchaProvider {
  if (typeof process !== "undefined" && process.env) {
    const provider = process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER
    if (provider === "recaptcha") return "recaptcha"
  }
  return "turnstile"
}

async function verifyTurnstileToken(token: string): Promise<boolean> {
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
        body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
      },
    )
    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("Turnstile verification error:", error)
    return false
  }
}

async function verifyReCaptchaToken(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  if (!secretKey) {
    console.warn("RECAPTCHA_SECRET_KEY not set — skipping CAPTCHA verification")
    return true
  }
  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
      },
    )
    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    return false
  }
}

export async function verifyCaptchaToken(token: string): Promise<boolean> {
  const provider = getCaptchaProvider()
  if (provider === "recaptcha") {
    return verifyReCaptchaToken(token)
  }
  return verifyTurnstileToken(token)
}

export function isCaptchaConfigured(): boolean {
  const provider = getCaptchaProvider()
  if (provider === "recaptcha") {
    return !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  }
  return !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
}
