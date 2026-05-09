import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/reveal"

export function CTA() {
  return (
    <section aria-labelledby="cta-heading" className="bg-primary text-primary-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 py-16 md:flex-row md:items-center md:justify-between md:px-6 md:py-20">
        <Reveal direction="left" className="max-w-2xl">
          <h2
            id="cta-heading"
            className="text-balance font-serif text-3xl font-semibold tracking-tight md:text-4xl"
          >
            Ready to retire passwords for your workforce?
          </h2>
          <p className="mt-3 text-pretty text-base leading-relaxed text-primary-foreground/80 md:text-lg">
            Start a 100-user proof of concept in minutes. We&apos;ll provision
            your IDCONNECTION code and onboard your admins within one business
            day.
          </p>
        </Reveal>
        <Reveal
          direction="right"
          delay={120}
          className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row"
        >
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-background text-foreground hover:bg-background/90"
          >
            <Link href="/signup">
              Start free trial
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="/ondemand-id">Try OnDemand ID</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
