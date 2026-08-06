"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Fingerprint, ShieldCheck } from "lucide-react";
import { useTheme } from "@/components/theme-provider-custom";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Ambient background blobs — same treatment as the landing hero */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          aria-hidden
          className="anim-fade-in anim-blob absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="anim-fade-in anim-delay-300 absolute bottom-[-10%] right-[-10%] h-[320px] w-[420px] rounded-full bg-accent/10 blur-3xl"
        />
      </div>

      {/* Slim top bar — root 404 doesn't inherit the site header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative size-24">
              <Image
                src={isDark ? "/logo-dark.webp" : "/logo-light.png"}
                alt="iVALT Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-sm tracking-tight">
              <span className="text-muted-foreground">OnDemand ID</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-14 md:px-6">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy column */}
          <div className="text-center lg:text-left">
            <div
              className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
              style={{ fontFamily: "Bespoke Stencil, sans-serif" }}
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              Verification failed
            </div>

            <h1 className="anim-fade-up anim-delay-75 mt-6 text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
              Identity{" "}
              <span className="text-primary">not found.</span>
            </h1>

            <p className="anim-fade-up anim-delay-150 mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground lg:mx-0">
              The page you requested doesn&apos;t exist or has been moved.
              Check the address, or return home and start a new request.
            </p>

            <p
              className="anim-fade-up anim-delay-200 mt-4 font-mono text-xs font-semibold text-muted-foreground"
            >
              HTTP 404 &middot; NOT_FOUND
            </p>

            <div className="anim-fade-up anim-delay-300 mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/">
                  <ArrowLeft className="mr-1 size-4" />
                  Back to home
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Link href="/ondemand-id">
                  <Fingerprint className="mr-1 size-4" />
                  Verify identity
                </Link>
              </Button>
            </div>
          </div>

          {/* Status card — the signature element */}
          <div className="anim-scale-in anim-delay-450 mx-auto w-full max-w-[300px] lg:max-w-[320px]">
            <div className="relative rounded-[2rem] border-[3px] border-border bg-card p-1 shadow-xl">
              <div className="rounded-[1.5rem] bg-background p-5">
                {/* Status bar */}
                <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                  <span>9:41</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3 text-primary" />
                    iVALT
                  </span>
                </div>

                {/* Scan result */}
                <div className="mt-6 flex flex-col items-center text-center">
                  <div className="relative flex size-24 items-center justify-center">
                    {/* Dashed scan ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-border" />
                    {/* Soft pulse behind the ring */}
                    <div className="absolute inset-2 animate-ping rounded-full bg-primary/5" />
                    {/* Scan line sweeping across the fingerprint */}
                    <div
                      aria-hidden
                      className="anim-scan absolute inset-x-4 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
                    />
                    <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/10">
                      <Fingerprint className="size-8 text-primary" />
                    </div>
                  </div>

                  <p className="mt-5 text-sm font-semibold">
                    No identity matches
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    The requested resource could not be verified.
                  </p>

                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1">
                    <span className="size-1.5 rounded-full bg-accent" />
                    <span
                      className="font-mono text-[10px] font-semibold uppercase tracking-wider text-accent-foreground"
                    >
                      404 &middot; NOT_FOUND
                    </span>
                  </div>
                </div>

                {/* Mono readouts — same language as the hero mockup */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Readout label="Status" value="404" />
                  <Readout label="Type" value="page_not_found" mono />
                  <Readout label="Request" value="/unknown" mono />
                  <Readout label="Result" value="no match" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="anim-fade-in anim-delay-600 mt-12 text-center text-xs text-muted-foreground">
          Encrypted in transit &middot; Protected by iVALT biometric
          authentication
        </p>
      </main>
    </div>
  );
}

function Readout({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-2 text-left">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 text-xs font-semibold ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}
