import type { Metadata } from "next"
import { SignupClient } from "@/components/signup/signup-client"

export const metadata: Metadata = {
  title: "Start your trial — iVALT OnDemand ID",
  description:
    "Register your company to receive an iVALT IDCONNECTION code and start verifying user identities with biometric push notifications.",
}

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Customer signup
        </p>
        <h1 className="mt-3 text-balance font-serif text-3xl font-semibold tracking-tight md:text-5xl">
          Start your iVALT OnDemand ID trial
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          Register your company to receive a unique IDCONNECTION code. Provision
          up to 100 trial users and start verifying identities with biometric
          push notifications.
        </p>
      </header>

      <div className="mt-12">
        <SignupClient />
      </div>
    </div>
  )
}
