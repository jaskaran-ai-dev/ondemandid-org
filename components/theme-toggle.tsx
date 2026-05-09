"use client"

import * as React from "react"
import { useTheme } from "@/components/theme-provider-custom"
import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type ThemeToggleProps = {
  className?: string
  /**
   * "icon" renders the icon-only switcher (default, used in header).
   * "compact" renders a small inline group of three buttons.
   */
  variant?: "icon" | "compact"
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch — only render after mount.
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const current = mounted ? (theme === "system" ? resolvedTheme : theme) : undefined

  if (variant === "compact") {
    const items: { value: "light" | "dark" | "system"; label: string; Icon: typeof Sun }[] = [
      { value: "light", label: "Light", Icon: Sun },
      { value: "dark", label: "Dark", Icon: Moon },
      { value: "system", label: "System", Icon: Monitor },
    ]
    return (
      <div
        role="radiogroup"
        aria-label="Theme"
        className={cn(
          "inline-flex items-center rounded-md border border-border bg-background p-0.5",
          className,
        )}
      >
        {items.map(({ value, label, Icon }) => {
          const active = mounted && theme === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
                "text-muted-foreground hover:text-foreground",
                active && "bg-secondary text-foreground shadow-sm",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className={cn("relative", className)}
        >
          <Sun
            className={cn(
              "size-[1.1rem] transition-all",
              current === "dark" ? "scale-0 -rotate-90" : "scale-100 rotate-0",
            )}
            aria-hidden
          />
          <Moon
            className={cn(
              "absolute size-[1.1rem] transition-all",
              current === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90",
            )}
            aria-hidden
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
          <Sun className="size-4" aria-hidden />
          <span>Light</span>
          {theme === "light" && (
            <span className="ml-auto text-xs text-muted-foreground">Active</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
          <Moon className="size-4" aria-hidden />
          <span>Dark</span>
          {theme === "dark" && (
            <span className="ml-auto text-xs text-muted-foreground">Active</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
          <Monitor className="size-4" aria-hidden />
          <span>System</span>
          {theme === "system" && (
            <span className="ml-auto text-xs text-muted-foreground">Active</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
