"use client"

import { useEffect, useRef, useState } from "react"

interface ReCaptchaProps {
  siteKey?: string
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  theme?: "light" | "dark"
  className?: string
}

export function ReCaptcha({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = "light",
  className,
}: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [scriptError, setScriptError] = useState(false)

  const key = siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  useEffect(() => {
    if (!key) {
      console.warn("reCAPTCHA site key not configured — CAPTCHA disabled")
      return
    }

    if (window.grecaptcha) {
      setScriptLoaded(true)
      return
    }

    if (document.getElementById("recaptcha-script")) {
      const checkReady = () => {
        if (window.grecaptcha) {
          setScriptLoaded(true)
        } else {
          setTimeout(checkReady, 100)
        }
      }
      checkReady()
      return
    }

    const script = document.createElement("script")
    script.id = "recaptcha-script"
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit"
    script.async = true
    script.defer = true
    script.onload = () => {
      const checkReady = () => {
        if (window.grecaptcha) {
          setScriptLoaded(true)
        } else {
          setTimeout(checkReady, 100)
        }
      }
      checkReady()
    }
    script.onerror = () => setScriptError(true)
    document.body.appendChild(script)
  }, [key])

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !key) return

    if (widgetIdRef.current !== null) {
      try {
        window.grecaptcha?.reset(widgetIdRef.current)
      } catch {
        // Ignore reset errors
      }
      widgetIdRef.current = null
    }

    const id = window.grecaptcha?.render(containerRef.current, {
      sitekey: key,
      theme,
      callback: onVerify,
      "error-callback": onError,
      "expired-callback": onExpire,
    })
    if (id !== undefined) {
      widgetIdRef.current = id
    }
  }, [scriptLoaded, key, theme, onVerify, onError, onExpire])

  useEffect(() => {
    return () => {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current)
        } catch {
          // Ignore
        }
      }
    }
  }, [])

  if (!key) {
    return null
  }

  if (scriptError) {
    return (
      <div className={`text-xs text-destructive ${className ?? ""}`}>
        CAPTCHA failed to load. Please refresh the page.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-[78px] ${className ?? ""}`}
      aria-label="Security verification"
      role="region"
    />
  )
}

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => number
      reset: (widgetId: number) => void
      getResponse: (widgetId: number) => string | undefined
    }
  }
}
