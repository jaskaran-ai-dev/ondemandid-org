import { CheckCircle2, Lock, ScrollText, ShieldCheck } from "lucide-react"
import { Reveal } from "@/components/reveal"

const PILLARS = [
  {
    icon: Lock,
    title: "End-to-end encryption",
    description:
      "Every biometric request is encrypted in transit and at rest. Templates never leave the user's device.",
    points: [
      "TLS 1.3 transport",
      "AES-256 at rest",
      "Per-tenant key isolation",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Granular access control",
    description:
      "Only provisioned IDCONNECTION codes can trigger verifications. Inactive customers are blocked at the edge.",
    points: [
      "Per-customer status enforcement",
      "Phone-number scoped requests",
      "Optional geo-fence + time window",
    ],
  },
  {
    icon: ScrollText,
    title: "Compliance-ready audit",
    description:
      "Every attempt is recorded with IP, user agent, raw response, and timestamps for downstream reporting.",
    points: [
      "Tamper-evident audit log",
      "SOC 2 / ISO 27001 ready",
      "Exportable JSON & CSV",
    ],
  },
]

export function Security() {
  return (
    <section
      id="security"
      aria-labelledby="security-heading"
      className="border-b border-border/60"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Security architecture
          </p>
          <h2
            id="security-heading"
            className="mt-3 text-balance font-serif text-3xl font-semibold tracking-tight md:text-4xl"
          >
            Built to meet enterprise security requirements out of the box.
          </h2>
          <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
            Defense in depth at every layer — from the iVALT mobile app to the
            audit trail your compliance team will inevitably ask for.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {PILLARS.map((p, i) => (
            <Reveal
              key={p.title}
              as="article"
              direction="scale"
              delay={i * 100}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <p.icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-serif text-lg font-semibold tracking-tight">
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
              <ul className="mt-auto flex flex-col gap-2 border-t border-border pt-4 text-sm">
                {p.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-foreground"
                  >
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
