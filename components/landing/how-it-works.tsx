import Link from "next/link"
import { ArrowRight, Building2, ScanFace, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/reveal"

const STEPS = [
  {
    icon: Building2,
    step: "01",
    title: "Register your company",
    description:
      "Submit your organization details. iVALT provisions a unique IDCONNECTION code, your trial keys, and admin onboarding within one business day.",
    cta: { label: "Start signup", href: "/signup" },
  },
  {
    icon: Users,
    step: "02",
    title: "Onboard your users",
    description:
      "Invite up to 100 users to install the iVALT mobile app. They register face and fingerprint biometrics directly in the app — no enterprise PKI required.",
  },
  {
    icon: ScanFace,
    step: "03",
    title: "Verify identities on demand",
    description:
      "Trigger verification with the IDCONNECTION code and the user's mobile number. They approve via push notification in seconds. You receive the result via API.",
    cta: { label: "Try it now", href: "/ondemand-id" },
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="border-b border-border/60 bg-secondary/30"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal direction="left" className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Implementation guide
            </p>
            <h2
              id="how-heading"
              className="mt-3 text-balance font-serif text-3xl font-semibold tracking-tight md:text-4xl"
            >
              From signup to verified user in three steps.
            </h2>
          </Reveal>
          <Reveal direction="right" delay={120}>
            <Button asChild variant="outline">
              <Link href="/signup">
                Register company
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {STEPS.map((s, i) => (
            <Reveal
              key={s.step}
              as="li"
              delay={i * 120}
              className="relative flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <s.icon className="size-5" aria-hidden />
                </span>
                <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground">
                  STEP {s.step}
                </span>
              </div>
              <h3 className="font-serif text-xl font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
              {s.cta ? (
                <Link
                  href={s.cta.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {s.cta.label}
                  <ArrowRight className="size-3.5" />
                </Link>
              ) : null}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
