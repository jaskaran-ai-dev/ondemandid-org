# iVALT OnDemand ID — Design System

## Overview

A clean, enterprise-grade design system built for trust and security. The visual language emphasizes clarity, professionalism, and modern SaaS aesthetics with a teal-forward primary palette and warm amber accents.

---

## Color System

### Primary Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--primary` | `lab(62 -42.57 7.73)` | `lab(62 -42.57 7.73)` | Main brand color, buttons, links, focus states |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.14 0.02 240)` | Text on primary backgrounds |

### Neutral Scale

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--background` | `oklch(1 0 0)` (white) | `oklch(0.14 0.02 240)` | Page backgrounds |
| `--foreground` | `oklch(0.18 0.02 240)` | `oklch(0.985 0 0)` | Primary text |
| `--card` | `oklch(1 0 0)` | `oklch(0.18 0.02 240)` | Card surfaces |
| `--card-foreground` | `oklch(0.18 0.02 240)` | `oklch(0.985 0 0)` | Card text |
| `--muted` | `oklch(0.96 0.005 200)` | `oklch(0.24 0.02 240)` | Subtle backgrounds |
| `--muted-foreground` | `oklch(0.45 0.02 240)` | `oklch(0.7 0.02 240)` | Secondary text, labels |
| `--border` | `oklch(0.9 0.01 220)` | `oklch(0.28 0.02 240)` | Dividers, input borders |
| `--input` | `oklch(0.9 0.01 220)` | `oklch(0.28 0.02 240)` | Form field borders |
| `--ring` | `lab(62 -42.57 7.73)` | `lab(62 -42.57 7.73)` | Focus rings, outlines |

### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--secondary` | `oklch(0.96 0.005 200)` | `oklch(0.24 0.02 240)` | Secondary buttons, badges |
| `--secondary-foreground` | `oklch(0.18 0.02 240)` | `oklch(0.985 0 0)` | Text on secondary |
| `--accent` | `oklch(0.78 0.14 75)` | `oklch(0.78 0.14 75)` | Highlights, warm amber accents |
| `--accent-foreground` | `oklch(0.18 0.02 240)` | `oklch(0.14 0.02 240)` | Text on accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.55 0.22 27)` | Errors, destructive actions |
| `--destructive-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | Text on destructive |

### Chart Palette

| Token | Value |
|-------|-------|
| `--chart-1` | `lab(62 -42.57 7.73)` (primary) |
| `--chart-2` | `oklch(0.6 0.12 200)` (teal) |
| `--chart-3` | `oklch(0.78 0.14 75)` (amber) |
| `--chart-4` | `oklch(0.45 0.02 240)` (mid-gray) |
| `--chart-5` | `oklch(0.18 0.02 240)` (dark) |

---

## Typography

### Font Stack

| Token | Font | Usage |
|-------|------|-------|
| `--font-sans` | Inter, system-ui, sans-serif | Body text, UI elements, buttons |
| `--font-serif` | Source Serif 4, Georgia, serif | Display headings, hero titles |
| `--font-stencil` | Bespoke Stencil, sans-serif | Special badges, tag lines, accents |
| `--font-mono` | SFMono-Regular, Menlo, monospace | Code, stats, technical data |

### Type Scale

| Element | Size | Weight | Line Height | Font |
|---------|------|--------|-------------|------|
| H1 (Hero) | `text-4xl` → `md:text-6xl` | `font-semibold` | `leading-[1.05]` | Serif |
| Body | `text-base` → `md:text-lg` | `font-normal` | `leading-relaxed` | Sans |
| Small/Label | `text-xs` | `font-medium` | `leading-relaxed` | Sans |
| Badge/Tag | `text-xs` | `font-medium` | — | Stencil |
| Mono/Data | `text-sm` | `font-semibold` | — | Mono |

---

## Spacing & Layout

### Container

- Max width: `max-w-6xl` (72rem / 1152px)
- Horizontal padding: `px-4` → `md:px-6`

### Border Radius

| Token | Value |
|-------|-------|
| `--radius` | `0.625rem` (10px) |
| `--radius-sm` | `calc(var(--radius) - 4px)` |
| `--radius-md` | `calc(var(--radius) - 2px)` |
| `--radius-lg` | `var(--radius)` |
| `--radius-xl` | `calc(var(--radius) + 4px)` |

---

## Components

### Button

**Variants:**
- `default`: Solid primary background
- `destructive`: Red background for dangerous actions
- `outline`: Bordered with hover accent
- `secondary`: Muted background
- `ghost`: Transparent with hover state
- `link`: Text-only with underline on hover

**Sizes:**
- `default`: `h-9 px-4 py-2`
- `sm`: `h-8 px-3`
- `lg`: `h-10 px-6`
- `icon`: `size-9` (square)

**States:**
- Focus: `ring-[3px] ring-ring/50 border-ring`
- Disabled: `opacity-50 pointer-events-none`
- Invalid: `ring-destructive/20 border-destructive`

### Input

- Height: `h-9`
- Border: `rounded-md border border-input`
- Background: Transparent (light), `dark:bg-input/30`
- Focus: `ring-[3px] ring-ring/50 border-ring`
- Icon support: `leftIcon` prop with `pl-10` padding
- File input: Inline flex with hidden default styling

### Card

- Background: `bg-card`
- Border: `border border-border`
- Radius: `rounded-2xl` (for mockups), `rounded-lg` (for stats)
- Shadow: `shadow-sm`

---

## Animation System

### Entrance Animations

| Class | Effect | Duration | Easing |
|-------|--------|----------|--------|
| `.anim-fade-up` | Fade + translate Y (12px → 0) | 700ms | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `.anim-fade-in` | Fade only | 700ms | `ease-out` |
| `.anim-scale-in` | Fade + scale (0.96 → 1) | 700ms | `cubic-bezier(0.22, 1, 0.36, 1)` |

### Continuous Animations

| Class | Effect | Duration | Behavior |
|-------|--------|----------|----------|
| `.anim-blob` | Subtle drift + scale | 14s | Infinite ease-in-out |
| `.anim-shimmer` | Background position shift | 2.4s | Linear infinite |
| `.animate-ping` | Scale pulse | 1s | Infinite (for status dots) |
| `.animate-pulse` | Opacity pulse | 2s | Infinite (for status indicators) |

### Stagger Delays

| Class | Delay |
|-------|-------|
| `.anim-delay-75` | 75ms |
| `.anim-delay-150` | 150ms |
| `.anim-delay-200` | 200ms |
| `.anim-delay-300` | 300ms |
| `.anim-delay-450` | 450ms |
| `.anim-delay-600` | 600ms |

### Scroll Reveal

| Class | Initial State | Visible State |
|-------|--------------|---------------|
| `.reveal` | `opacity: 0, translateY(16px)` | `opacity: 1, translateY(0)` |
| `.reveal-left` | `translateX(-16px)` | — |
| `.reveal-right` | `translateX(16px)` | — |
| `.reveal-scale` | `scale(0.97)` | — |

Transition: `600ms cubic-bezier(0.22, 1, 0.36, 1)` for both opacity and transform.

---

## Accessibility

- **Reduced Motion**: All animations respect `prefers-reduced-motion: reduce`
  - Entrance animations: `animation: none`
  - Reveal transitions: `opacity: 1, transform: none, transition: none`
- **Focus States**: Visible focus rings (`ring-[3px]`) on all interactive elements
- **Color Contrast**: All color combinations meet WCAG AA standards
- **ARIA Labels**: Proper labeling on icon buttons, navigation, and interactive components

---

## Theme System

### Light Mode
- Background: White (`oklch(1 0 0)`)
- Surfaces: Slightly warm gray (`oklch(0.96 0.005 200)`)
- Text: Near-black (`oklch(0.18 0.02 240)`)
- Borders: Light gray (`oklch(0.9 0.01 220)`)

### Dark Mode
- Background: Deep navy (`oklch(0.14 0.02 240)`)
- Surfaces: Slightly lighter navy (`oklch(0.18 0.02 240)`)
- Text: White (`oklch(0.985 0 0)`)
- Borders: Dark gray (`oklch(0.28 0.02 240)`)

### Theme Switching
- Custom React context with localStorage persistence
- System preference detection via `matchMedia`
- CSS class-based switching (`class` attribute on `<html>`)
- Key: `ivalt-theme`

---

## Assets

### Logo
- Light mode: `/logo-light.png` (PNG with transparent background)
- Dark mode: `/logo-dark.webp` (WebP format)
- Size in header: `size-24` (96px)
- Size in footer: `size-24` (96px)
- Rendering: Next.js `Image` with `object-contain` and `fill`

### Icons
- Library: Lucide React
- Default size: `size-4` (16px)
- Icon-only buttons: `size-[1.1rem]`

---

## Patterns

### Status Indicators
- **Pending**: Pulsing dot (`animate-pulse bg-primary`)
- **Success**: Checkmark or solid green
- **Error**: Destructive color with alert styling

### Feature Pills
- Border: `rounded-lg border border-border`
- Background: `bg-secondary/50`
- Padding: `px-3 py-2`
- Icon + Label layout with `gap-2`

### Phone Mockup
- Outer border: `rounded-[2rem] border-[3px]`
- Inner screen: `rounded-[1.5rem] bg-background p-5`
- Status bar: `text-[10px] font-medium text-muted-foreground`

---

## Dependencies

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS 4 + tw-animate-css
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Animation**: Pure CSS (no JS animation library)
- **Fonts**: Google Fonts (Inter, Source Serif 4, Bespoke Stencil)
