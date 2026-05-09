"use client"

import { useEffect, useRef, useState } from "react"

type Options = {
  /** Fraction of the element that must be visible. Defaults to 0.15. */
  threshold?: number
  /** Margin around the root viewport (CSS shorthand). Defaults to "0px 0px -10% 0px". */
  rootMargin?: string
  /** If true, observe only once and disconnect after first reveal. Defaults to true. */
  once?: boolean
}

/**
 * Tiny IntersectionObserver hook for scroll-triggered reveals.
 *
 * Returns a ref to attach to the target element and a boolean indicating
 * whether the element has crossed into the viewport. No animation library
 * required — pair with the `.reveal` / `.is-visible` CSS pattern in
 * `globals.css`.
 */
export function useReveal<T extends Element = HTMLElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  once = true,
}: Options = {}) {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Bail out gracefully on environments without IntersectionObserver
    // (or when the user prefers reduced motion).
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return
    }
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) observer.disconnect()
          } else if (!once) {
            setVisible(false)
          }
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, visible }
}
