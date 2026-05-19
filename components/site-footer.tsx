"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "@/components/theme-provider-custom"
import { ThemeToggle } from "@/components/theme-toggle"

const links = [
  { label: "Product", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Verify ID", href: "/ondemand-id" },
  { label: "Company", href: "https://ivalt.com" },
  { label: "Start trial", href: "/signup" },
  { label: "Contact", href: "https://ivalt.com/contact" },
]

export function SiteFooter() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      {/* Main footer */}
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="relative size-20">
              <Image
                src={isDark ? "/logo-dark.webp" : "/logo-light.png"}
                alt="iVALT Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Navigation links - horizontal on desktop, 2-col grid on mobile */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm md:gap-x-8">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Theme toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground hidden md:inline">Appearance</span>
            <ThemeToggle variant="compact" />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row md:px-6">
          <p>© {new Date().getFullYear()} iVALT, Inc. All rights reserved.</p>
          <span className="font-mono">v1.0 · OnDemand ID</span>
        </div>
      </div>
    </footer>
  )
}
