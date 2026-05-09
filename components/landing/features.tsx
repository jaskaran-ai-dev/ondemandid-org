import {
  Bell,
  Fingerprint,
  KeyRound,
  Plug,
  ScrollText,
  Smartphone,
} from "lucide-react"
import { Reveal } from "@/components/reveal"

const FEATURES = [
  {
    icon: Fingerprint,
    title: "Biometric security",
    description:
      "Face and fingerprint recognition powered by the iVALT mobile app — no shared secrets, no passwords to leak.",
  },
  {
    icon: Bell,
    title: "Instant push verification",
    description:
      "Identity requests are delivered as secure push notifications. Users approve in a single tap.",
  },
  {
    icon: KeyRound,
    title: "Zero-password auth",
    description:
      "Eliminate phishing, credential stuffing, and password reset overhead from your support backlog.",
  },
  {
    icon: Plug,
    title: "Enterprise API",
    description:
      "Three REST endpoints: signup, verify, and status. Integrate into any workflow in an afternoon.",
  },
  {
    icon: ScrollText,
    title: "Complete audit trail",
    description:
      "Every verification logs IP, user agent, timestamps, and the raw iVALT response for compliance.",
  },
  {
    icon: Smartphone,
    title: "iOS and Android native",
    description:
      "Mobile-first by design. Works on every modern device with the iVALT companion app installed.",
  },
]

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="border-b border-border/60"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Capabilities
          </p>
          <h2
            id="features-heading"
            className="mt-3 text-balance font-serif text-3xl font-semibold tracking-tight md:text-4xl"
          >
            Everything you need to retire passwords for good.
          </h2>
          <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
            Six core capabilities, one mobile app, three API endpoints. iVALT
            OnDemand ID is built to drop into existing identity flows with
            minimal lift.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal
              key={f.title}
              delay={(i % 3) * 90}
              className="flex flex-col gap-3 bg-card p-6 transition-colors hover:bg-secondary/40"
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <f.icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-base font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
