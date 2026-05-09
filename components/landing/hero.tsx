import Link from "next/link"
import { ArrowRight, Fingerprint, ScanFace, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Background blob — animates in, then drifts subtly. Pure CSS, no JS. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          aria-hidden
          className="anim-fade-in anim-blob absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="anim-fade-in anim-delay-300 absolute right-[-10%] top-1/2 h-[320px] w-[420px] rounded-full bg-accent/10 blur-3xl"
        />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-16 pt-14 text-center md:px-6 md:pb-24 md:pt-20">
        <div className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Live biometric verification, delivered on demand
        </div>

        <h1 className="anim-fade-up anim-delay-75 mt-6 max-w-4xl text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Verify identity with biometrics.{" "}
          <span className="text-primary">Without passwords.</span>
        </h1>

        <p className="anim-fade-up anim-delay-150 mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          iVALT OnDemand ID lets enterprises verify users in seconds through face
          and fingerprint authentication delivered as secure push notifications to
          the iVALT mobile app.
        </p>

        <div className="anim-fade-up anim-delay-200 mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/signup">
              Start free trial
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto dark:hover:bg-white/10 dark:hover:text-white">
            <Link href="/ondemand-id">Try OnDemand ID</Link>
          </Button>
        </div>

        <p className="anim-fade-up anim-delay-300 mt-3 text-xs text-muted-foreground">
          No credit card required · Up to 100 trial users · Provisioned in 1 business day
        </p>

        {/* Visual mockup */}
        <div className="anim-scale-in anim-delay-450 mt-14 w-full max-w-4xl">
          <div className="relative grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:grid-cols-3 md:gap-6 md:p-6">
            <FeaturePill
              icon={<ShieldCheck className="size-4" />}
              label="End-to-end encrypted"
              delay={500}
            />
            <FeaturePill
              icon={<ScanFace className="size-4" />}
              label="Face recognition"
              delay={575}
            />
            <FeaturePill
              icon={<Fingerprint className="size-4" />}
              label="Fingerprint auth"
              delay={650}
            />

            <div className="md:col-span-3">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <PhoneMockup />
                <DesktopMockup />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturePill({
  icon,
  label,
  delay = 0,
}: {
  icon: React.ReactNode
  label: string
  delay?: number
}) {
  return (
    <div
      className="anim-fade-up flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-primary">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  )
}

function PhoneMockup() {
  return (
    <div
      className="anim-fade-up relative mx-auto w-full max-w-[260px] rounded-[2rem] border-[10px] border-foreground bg-foreground p-1 shadow-lg md:col-span-1"
      style={{ animationDelay: "725ms" }}
    >
      <div className="rounded-[1.5rem] bg-background p-5">
        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
          <span>9:41</span>
          <span>iVALT</span>
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
            <ScanFace className="size-9 text-primary" />
          </div>
          <p className="mt-4 text-sm font-semibold">Verify your identity</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Acme Corp is requesting access. Tap to authenticate with Face ID.
          </p>

          <div className="mt-5 flex w-full flex-col gap-2">
            <div className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
              Approve with Face ID
            </div>
            <div className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground">
              Decline
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DesktopMockup() {
  return (
    <div
      className="anim-fade-up md:col-span-2 flex flex-col gap-3 rounded-xl border border-border bg-secondary/30 p-4"
      style={{ animationDelay: "800ms" }}
    >
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="size-2.5 rounded-full bg-destructive/70" aria-hidden />
        <span className="size-2.5 rounded-full bg-accent" aria-hidden />
        <span className="size-2.5 rounded-full bg-primary/70" aria-hidden />
        <span className="ml-2 font-mono text-[10px] text-muted-foreground">
          ondemand.ivalt.com/verify
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-left">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            IDCONNECTION
          </p>
          <p className="mt-1 font-mono text-sm font-semibold">ACME-7421</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Phone
          </p>
          <p className="mt-1 font-mono text-sm font-semibold">+1 555 0142</p>
        </div>
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-left">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-primary">Awaiting biometric response</p>
          <span className="font-mono text-[10px] text-muted-foreground">02:47</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:200ms]" />
          <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:400ms]" />
          <span className="ml-2 text-[11px] text-muted-foreground">
            Push notification delivered
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-left">
        <Stat label="Sent" value="1" />
        <Stat label="Status" value="pending" />
        <Stat label="HTTP" value="422" mono />
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-md border border-border bg-background p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 text-xs font-semibold ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  )
}
