"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { VerificationForm } from "@/components/verification/verification-form"
import {
  VerificationStatus,
  type VerificationState,
} from "@/components/verification/verification-status"
import type { VerifyValues } from "@/lib/validation"

const POLL_INTERVAL_MS = 2000
const MAX_ATTEMPTS = 150 // ~5 minutes

export function VerificationClient() {
  const [state, setState] = useState<VerificationState>({ kind: "idle" })
  const [lastValues, setLastValues] = useState<VerifyValues | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  function clearPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  async function startVerification(values: VerifyValues) {
    setLastValues(values)
    clearPolling()
    setState({ kind: "submitting" })

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()

      if (res.status === 404) {
        setState({ kind: "not_found", ivaltStatusCode: 404 })
        return
      }
      if (!res.ok || !data.ok) {
        setState({
          kind: "error",
          message: data.error ?? "Failed to initiate verification.",
        })
        return
      }

      const startedAt = Date.now()
      setState({
        kind: "pending",
        requestId: data.id,
        idConnection: values.idConnection,
        countryCode: values.countryCode,
        mobile: values.mobile,
        attempt: 1,
        maxAttempts: MAX_ATTEMPTS,
        ivaltStatusCode: data.ivaltStatusCode ?? 422,
        startedAt,
      })

      // Start polling.
      let attempt = 1
      pollRef.current = setInterval(async () => {
        attempt += 1
        try {
          const statusRes = await fetch(`/api/status/${data.id}`)
          const statusData = await statusRes.json()

          if (statusData.status === "authenticated") {
            clearPolling()
            setState({
              kind: "authenticated",
              requestId: data.id,
              idConnection: values.idConnection,
              durationMs: Date.now() - startedAt,
            })
            toast.success("Identity verified")
            return
          }
          if (statusData.status === "failed") {
            clearPolling()
            setState({
              kind: "failed",
              requestId: data.id,
              ivaltStatusCode: statusData.ivaltStatusCode ?? 403,
            })
            toast.error("Verification denied")
            return
          }
          if (statusData.status === "not_found") {
            clearPolling()
            setState({
              kind: "not_found",
              ivaltStatusCode: statusData.ivaltStatusCode ?? 404,
            })
            return
          }

          // Still pending: bump attempt counter.
          setState((prev) =>
            prev.kind === "pending"
              ? {
                  ...prev,
                  attempt,
                  ivaltStatusCode: statusData.ivaltStatusCode ?? 422,
                }
              : prev,
          )

          if (attempt >= MAX_ATTEMPTS) {
            clearPolling()
            setState({
              kind: "failed",
              requestId: data.id,
              ivaltStatusCode: 403,
            })
            toast.error("Verification timed out")
          }
        } catch {
          clearPolling()
          setState({
            kind: "error",
            message: "Lost connection while polling for status.",
          })
        }
      }, POLL_INTERVAL_MS)
    } catch {
      setState({
        kind: "error",
        message: "Network error. Please try again.",
      })
    }
  }

  function handleReset() {
    clearPolling()
    setState({ kind: "idle" })
  }

  function handleRetry() {
    if (lastValues) {
      void startVerification(lastValues)
    } else {
      handleReset()
    }
  }

  const showForm = state.kind === "idle" || state.kind === "submitting"

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        {showForm ? (
          <VerificationForm
            onSubmit={startVerification}
            submitting={state.kind === "submitting"}
          />
        ) : (
          <VerificationStatus
            state={state}
            onReset={handleReset}
            onRetry={handleRetry}
          />
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-secondary/40 p-6">
          <h2 className="font-serif text-lg font-semibold tracking-tight">
            How verification works
          </h2>
          <ol className="mt-4 flex flex-col gap-3 text-sm">
            <Step n={1}>
              We validate the IDCONNECTION code against active customers.
            </Step>
            <Step n={2}>
              An audit record is created with status{" "}
              <code className="font-mono text-xs">initiated</code>.
            </Step>
            <Step n={3}>
              iVALT dispatches a push notification to the user&apos;s mobile
              device.
            </Step>
            <Step n={4}>
              The user authenticates with face or fingerprint biometrics.
            </Step>
            <Step n={5}>
              We poll for the result every 2 seconds for up to 5 minutes.
            </Step>
          </ol>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold">Demo IDCONNECTION codes</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Try these codes to see different states. Any 4–12 alphanumeric code
            is accepted in the demo.
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-xs">
            <DemoCode code="ACME7421" hint="Approved by user" />
            <DemoCode code="DEMO1234" hint="Approved by user" />
            <DemoCode
              code="MISSING01"
              hint="Returns not_found (user not registered)"
            />
            <DemoCode
              code="ACME7421"
              hint="With mobile ending 0000 → user denies"
            />
          </ul>
        </div>
      </aside>
    </div>
  )
}

function Step({
  n,
  children,
}: {
  n: number
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
        {n}
      </span>
      <p className="text-muted-foreground leading-relaxed">{children}</p>
    </li>
  )
}

function DemoCode({ code, hint }: { code: string; hint: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2">
      <code className="font-mono text-xs font-semibold">{code}</code>
      <span className="text-muted-foreground">{hint}</span>
    </li>
  )
}
