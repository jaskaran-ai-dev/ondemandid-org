import { Hero } from "@/components/landing/hero"
import { TrustMetrics } from "@/components/landing/trust-metrics"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Security } from "@/components/landing/security"
import { CTA } from "@/components/landing/cta"

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustMetrics />
      <Features />
      <HowItWorks />
      <Security />
      <CTA />
    </>
  )
}
