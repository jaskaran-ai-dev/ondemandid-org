"use client"

import { useEffect, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  ScanFace,
  ShieldAlert,
  ShieldX,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export type VerificationState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | {
      kind: "pending"
      requestId: string
      idConnection: string
      countryCode: string
      mobile: string
      attempt: number
      maxAttempts: number
      ivaltStatusCode: number
      startedAt: number
    }
  | {
      kind: "authenticated"
      requestId: string
      idConnection: string
      durationMs: number
    }
  | { kind: "failed"; requestId: string; ivaltStatusCode: number }
  | { kind: "not_found"; ivaltStatusCode: number }
  | { kind: "error"; message: string }

type Props = {
  state: VerificationState
  onReset: () => void
  onRetry: () => void
}

export function VerificationStatus({ state, onReset, onRetry }: Props) {
  if (state.kind === "idle") return null

  if (state.kind === "submitting") {
    return (
      <Frame
        tone="primary"
        icon={<Loader2 className="size-6 animate-spin" />}
        title="Sending verification request"
        description="Validating IDCONNECTION and dispatching push notification…"
      />
    )
  }

  if (state.kind === "pending") {
    return <PendingPanel state={state} onReset={onReset} />
  }

  if (state.kind === "authenticated") {
    return (
      <Frame
        tone="success"
        icon={<CheckCircle2 className="size-6" />}
        title="Identity verified"
        description={`Biometric authentication completed in ${(
          state.durationMs / 1000
        ).toFixed(1)}s.`}
      >
        <DetailsRow label="Request ID" value={state.requestId} mono />
        <DetailsRow label="IDCONNECTION" value={state.idConnection} mono />
        <DetailsRow label="iVALT status" value="200 · authenticated" mono />
        <Actions onReset={onReset} primaryLabel="Verify another user" />
      </Frame>
    )
  }

  if (state.kind === "failed") {
    return (
      <Frame
        tone="destructive"
        icon={<ShieldX className="size-6" />}
        title="Verification denied"
        description="The user rejected the request, the token expired, or the 5-minute window elapsed."
      >
        <DetailsRow label="Request ID" value={state.requestId} mono />
        <DetailsRow
          label="iVALT status"
          value={`${state.ivaltStatusCode} · failed`}
          mono
        />
        <Actions
          onReset={onReset}
          onRetry={onRetry}
          primaryLabel="Try again"
        />
      </Frame>
    )
  }

  if (state.kind === "not_found") {
    return (
      <Frame
        tone="warning"
        icon={<ShieldAlert className="size-6" />}
        title="User or IDCONNECTION not found"
        description="The IDCONNECTION code is invalid or inactive, or the user is not registered with iVALT."
      >
        <DetailsRow
          label="iVALT status"
          value={`${state.ivaltStatusCode} · not_found`}
          mono
        />
        <Actions
          onReset={onReset}
          onRetry={onRetry}
          primaryLabel="Edit details"
        />
      </Frame>
    )
  }

  if (state.kind === "error") {
    return (
      <Frame
        tone="destructive"
        icon={<AlertCircle className="size-6" />}
        title="Something went wrong"
        description={state.message}
      >
        <Actions onReset={onReset} onRetry={onRetry} primaryLabel="Retry" />
      </Frame>
    )
  }

  return null
}

function PendingPanel({
  state,
  onReset,
}: {
  state: Extract<VerificationState, { kind: "pending" }>
  onReset: () => void
}) {
  // Live elapsed timer
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(i)
  }, [])
  const elapsed = Math.max(0, now - state.startedAt)
  const seconds = Math.floor(elapsed / 1000)
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")
  const progress = Math.min(100, (state.attempt / state.maxAttempts) * 100)

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-6 text-foreground">
      <div className="flex items-start gap-4">
        <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ScanFace className="size-6" aria-hidden />
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-primary/20"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Awaiting biometric response
          </p>
          <h3 className="mt-1 font-serif text-xl font-semibold tracking-tight">
            Push notification delivered
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            The user is reviewing the request in the iVALT mobile app. They
            authenticate with face or fingerprint to approve.
          </p>
        </div>
        <div className="hidden text-right md:block">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Elapsed
          </p>
          <p className="font-mono text-2xl font-semibold tabular-nums">
            {mm}:{ss}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Progress value={progress} aria-label="Polling progress" />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Polling /api/status/{state.requestId} every 2s ·{" "}
            <span className="font-mono text-foreground">
              {state.attempt}/{state.maxAttempts}
            </span>
          </span>
          <span className="font-mono">HTTP {state.ivaltStatusCode}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        <DetailsRow label="Request ID" value={state.requestId} mono boxed />
        <DetailsRow
          label="IDCONNECTION"
          value={state.idConnection}
          mono
          boxed
        />
        <DetailsRow
          label="Phone"
          value={`${state.countryCode} ${state.mobile}`}
          mono
          boxed
        />
      </div>

      <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">
          Most users approve in under 10 seconds. Polling will continue for up
          to 5 minutes.
        </p>
        <Button variant="outline" size="sm" onClick={onReset}>
          <XCircle className="mr-1 size-4" aria-hidden />
          Cancel request
        </Button>
      </div>
    </div>
  )
}

type Tone = "primary" | "success" | "warning" | "destructive"

function Frame({
  tone,
  icon,
  title,
  description,
  children,
}: {
  tone: Tone
  icon: React.ReactNode
  title: string
  description: string
  children?: React.ReactNode
}) {
  const toneClasses: Record<
    Tone,
    { container: string; iconWrap: string }
  > = {
    primary: {
      container: "border-primary/40 bg-primary/5",
      iconWrap: "bg-primary/10 text-primary",
    },
    success: {
      container: "border-primary/40 bg-primary/5",
      iconWrap: "bg-primary text-primary-foreground",
    },
    warning: {
      container: "border-accent/60 bg-accent/10",
      iconWrap: "bg-accent text-accent-foreground",
    },
    destructive: {
      container: "border-destructive/40 bg-destructive/5",
      iconWrap: "bg-destructive text-destructive-foreground",
    },
  }
  const t = toneClasses[tone]
  return (
    <div className={`rounded-xl border ${t.container} p-6`}>
      <div className="flex items-start gap-4">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-full ${t.iconWrap}`}
          aria-hidden
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-xl font-semibold tracking-tight">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {children ? (
        <div className="mt-5 flex flex-col gap-2">{children}</div>
      ) : null}
    </div>
  )
}

function DetailsRow({
  label,
  value,
  mono,
  boxed,
}: {
  label: string
  value: string
  mono?: boolean
  boxed?: boolean
}) {
  if (boxed) {
    return (
      <div className="rounded-md border border-border bg-background p-2.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={`mt-0.5 truncate text-xs font-semibold ${
            mono ? "font-mono" : ""
          }`}
        >
          {value}
        </p>
      </div>
    )
  }
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-2 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`truncate text-foreground ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function Actions({
  onReset,
  onRetry,
  primaryLabel,
}: {
  onReset: () => void
  onRetry?: () => void
  primaryLabel: string
}) {
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <Button onClick={onReset} className="sm:flex-1">
        {primaryLabel}
      </Button>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry} className="sm:flex-1">
          <RefreshCcw className="mr-1 size-4" aria-hidden />
          Resend request
        </Button>
      ) : null}
    </div>
  )
}
