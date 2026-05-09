import Link from "next/link"
import Image from "next/image"
import { useTheme } from "@/components/theme-provider-custom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  const { theme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <div className="relative size-10">
            <Image
              src={isDark ? "/logo-dark.webp" : "/logo-light.png"}
              alt="iVALT Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-base tracking-tight">
            iVALT <span className="text-muted-foreground">OnDemand ID</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Primary">
          <Link
            href="/#features"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </Link>
          <Link
            href="/#security"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Security
          </Link>
          <Link
            href="/ondemand-id"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Verify
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/ondemand-id">Verify ID</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Start trial</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
