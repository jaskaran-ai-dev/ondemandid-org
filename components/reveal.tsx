"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useReveal } from "@/hooks/use-reveal"

type Direction = "up" | "left" | "right" | "scale" | "fade"

type RevealProps = {
  children: React.ReactNode
  /** Direction the element travels from. Defaults to "up". */
  direction?: Direction
  /** Stagger delay applied via CSS transition-delay (ms). Defaults to 0. */
  delay?: number
  /** Visibility threshold. Defaults to 0.15. */
  threshold?: number
  /** Reveal only once. Defaults to true. */
  once?: boolean
  className?: string
  as?: keyof React.JSX.IntrinsicElements
}

/**
 * Wraps its children in a transition that fires when the element scrolls
 * into view. Uses the `.reveal` / `.is-visible` CSS pattern in `globals.css`
 * — no animation library, only IntersectionObserver + CSS transitions.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  threshold = 0.15,
  once = true,
  className,
  as: Tag = "div",
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLElement>({ threshold, once })

  const directionClass =
    direction === "left"
      ? "reveal-left"
      : direction === "right"
        ? "reveal-right"
        : direction === "scale"
          ? "reveal-scale"
          : direction === "fade"
            ? ""
            : ""

  return React.createElement(
    Tag,
    {
      ref,
      className: cn("reveal", directionClass, visible && "is-visible", className),
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children,
  )
}
