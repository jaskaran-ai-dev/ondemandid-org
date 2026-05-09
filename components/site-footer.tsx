"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "@/components/theme-provider-custom"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteFooter() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto flex items-center justify-center w-full max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="flex flex-col gap-3 max-w-sm">
          <Link href="/" className="flex items-center gap-3 font-semibold">
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
              <span className="text-muted-foreground text-sm">OnDemand ID</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Password-free identity verification for the enterprise. Biometric
            authentication delivered through secure push notifications.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 justify-items-center">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
              Product
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#features" className="hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-foreground">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/ondemand-id" className="hover:text-foreground">
                  Verify ID
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
              Company
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/signup" className="hover:text-foreground">
                  Start trial
                </Link>
              </li>
              <li>
                <Link href="https://ivalt.com/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          {/* <div className="col-span-2 sm:col-span-1">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
              Legal
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#" className="hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/#" className="hover:text-foreground">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/#" className="hover:text-foreground">
                  Compliance
                </Link>
              </li>
            </ul>
          </div> */}
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-4 py-4 text-xs text-muted-foreground md:flex-row md:items-center md:px-6">
          <p>© {new Date().getFullYear()} iVALT, Inc. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">Appearance</span>
            <ThemeToggle variant="compact" />
            <span className="font-mono text-xs">v1.0 · OnDemand ID</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
