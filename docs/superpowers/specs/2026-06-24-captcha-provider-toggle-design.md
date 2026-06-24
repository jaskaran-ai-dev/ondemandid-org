# CAPTCHA Provider Toggle — Design Spec

## Overview

Add the ability to toggle between Cloudflare Turnstile and Google reCAPTCHA v2 Checkbox for the signup form. The provider is selected at deploy time via an environment variable.

## Motivation

Some enterprise customers require Google reCAPTCHA for compliance or policy reasons. Rather than hardcode one provider, the system supports both with a single env var switch. No code changes needed to swap providers.

## Architecture

### Provider Abstraction

A new `lib/captcha/` module provides a unified interface:

```
lib/captcha/
  index.ts    — provider detection, site key lookup, server-side verification
```

### Env Var Control

```
CAPTCHA_PROVIDER=turnstile   # default, uses Cloudflare Turnstile
CAPTCHA_PROVIDER=recaptcha   # uses Google reCAPTCHA v2 Checkbox
```

### Key Design

1. **`getCaptchaProvider()`** — reads `CAPTCHA_PROVIDER`, defaults to `"turnstile"`
2. **`getCaptchaSiteKey()`** — returns `NEXT_PUBLIC_TURNSTILE_SITE_KEY` or `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
3. **`verifyCaptchaToken(token)`** — routes to Turnstile or reCAPTCHA server-side verification
4. **`CaptchaWidget`** component — renders `Turnstile` or `ReCaptcha` based on provider

## Changes

### New Files

| File                               | Purpose                                                       |
| ---------------------------------- | ------------------------------------------------------------- |
| `lib/captcha/index.ts`             | Provider detection, site key lookup, server-side verification |
| `components/ui/captcha-widget.tsx` | Unified client component that renders the active provider     |
| `components/ui/recaptcha.tsx`      | Google reCAPTCHA v2 Checkbox widget component                 |

### Modified Files

| File                                | Changes                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| `lib/validation.ts`                 | Rename `turnstileToken` → `captchaToken`                                         |
| `components/signup/signup-form.tsx` | Replace `Turnstile` import/usage with `CaptchaWidget`                            |
| `app/api/signup/route.ts`           | Use `verifyCaptchaToken()` instead of `verifyTurnstileToken()`                   |
| `lib/security.ts`                   | Remove `verifyTurnstileToken()` (moved to `lib/captcha/`)                        |
| `.env.example`                      | Add `CAPTCHA_PROVIDER`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` |

### File Details

#### `lib/captcha/index.ts`

```ts
export type CaptchaProvider = 'turnstile' | 'recaptcha';

export function getCaptchaProvider(): CaptchaProvider;
export function getCaptchaSiteKey(): string | undefined;
export async function verifyCaptchaToken(token: string): Promise<boolean>;
```

- `getCaptchaProvider()` reads `process.env.CAPTCHA_PROVIDER`, defaults to `"turnstile"`
- `getCaptchaSiteKey()` returns the corresponding `NEXT_PUBLIC_*_SITE_KEY`
- `verifyCaptchaToken()` POSTs to the correct `/siteverify` endpoint based on provider

#### `CaptchaWidget` (`components/ui/captcha-widget.tsx`)

Client component that:

- Reads `process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER` to determine which widget to render
- Falls back to `Turnstile` if no provider is set (backward compatible)
- Shows error state if the chosen provider's site key is missing
- Same prop interface: `onVerify`, `onError`, `onExpire`

#### `ReCaptcha` (`components/ui/recaptcha.tsx`)

Client component for Google reCAPTCHA v2 Checkbox:

- Loads `https://www.google.com/recaptcha/api.js` dynamically
- Renders the reCAPTCHA widget in a container div
- Provides `onVerify`, `onError`, `onExpire` callbacks
- Supports `theme` prop (`"light" | "dark"`)

#### Environment Variables

```env
CAPTCHA_PROVIDER=turnstile|recaptcha

# Turnstile (default)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...

# reCAPTCHA v2
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...
```

Existing Turnstile env vars remain supported. If `CAPTCHA_PROVIDER` is unset, Turnstile is used as default.

## Data Flow

### Signup Form Submit

```
User submits form
  → CaptchaWidget has token from Turnstile or reCAPTCHA
  → Form includes { ..., captchaToken: "..." }
  → POST /api/signup
  → Server calls verifyCaptchaToken(token)
    → verifyTurnstileToken(token) or verifyReCaptchaToken(token)
  → If invalid, return 400 "Security verification failed"
  → If valid, continue with signup
```

### Backward Compatibility

- Existing `.env` files with only Turnstile keys continue to work (default provider = Turnstile)
- The `turnstileToken` field in the schema is renamed to `captchaToken` — this is a single-field rename in one form component
- Old `Turnstile` component is kept and used internally by `CaptchaWidget`

## Security

- Server-side verification is mandatory for both providers (client-side token is never trusted alone)
- Both providers use the same POST-to-endpoint pattern with secret key
- Error handling: if the chosen provider's secret key is missing, verification is skipped with a warning (same as current Turnstile behavior)

## No-Go Scope

- No admin UI for toggling providers (env var only)
- No reCAPTCHA v3 (risk score model) — v2 Checkbox only
- No support for running both providers simultaneously
