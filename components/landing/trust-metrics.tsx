import { Reveal } from "@/components/reveal"

const METRICS = [
  {
    value: "99.9%",
    label: "Biometric accuracy",
    description: "False acceptance rate of 1 in 100,000+",
  },
  {
    value: "<2s",
    label: "Median verification",
    description: "From request initiation to biometric response",
  },
  {
    value: "0",
    label: "Passwords required",
    description: "Eliminate phishing, reuse, and credential leaks",
  },
  {
    value: "SOC 2",
    label: "Compliance ready",
    description: "Audit trail with IP, device, and timestamps",
  },
]

export function TrustMetrics() {
  return (
    <section
      aria-label="Key metrics"
      className="border-b border-border/60 bg-secondary/30"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-12 md:grid-cols-4 md:px-6 md:py-16">
        {METRICS.map((m, i) => (
          <Reveal key={m.label} delay={i * 80} className="flex flex-col">
            <p className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {m.value}
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {m.label}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {m.description}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
