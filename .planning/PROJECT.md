# iVALT OnDemand ID

## What This Is

A password-free identity verification SaaS platform that lets enterprises verify user identities through biometric authentication (face/fingerprint) delivered via secure push notifications to the iVALT mobile app. Companies register, get provisioned with an IDCONNECTION code, and then trigger on-demand verification requests to users' phones.

## Core Value

Enterprises can verify anyone's identity in under 5 seconds without passwords, using only their phone and biometrics.

## Requirements

### Validated

(None yet — ship to validate. Existing codebase includes landing page, signup flow, verification flow with live polling, dual database support, email system, and iVALT API integration.)

### Active

- [ ] **HARD-01**: Production-hardened error handling and observability
- [ ] **HARD-02**: Comprehensive test suite (unit, integration, E2E)
- [ ] **HARD-03**: CI/CD pipeline for automated testing and deployment
- [ ] **HARD-04**: Monitoring, alerting, and dashboard for production
- [ ] **HARD-05**: Rate limiting, security hardening, and compliance documentation
- [ ] **HARD-06**: Documentation for API consumers and admin operations
- [ ] **HARD-07**: Admin dashboard for managing customers and viewing audit logs

### Out of Scope

- Multi-tenant self-service provisioning — manual provisioning by iVALT admin is the current model
- Native mobile app — identity verification happens through the existing iVALT mobile app
- OAuth/SAML integration — not required for the push-notification-based verification model

## Context

**Current state:** Functional proof-of-concept with complete landing page, company signup flow, and on-demand biometric verification flow with real-time status polling. Built with Next.js 16 App Router, TypeScript 6, Tailwind CSS 4, Drizzle ORM (dual Postgres/SQLite), and Radix UI primitives. The iVALT API integration handles push notification triggers and result polling. Email notifications use AWS SES with SMTP fallback.

**Design system:** Enterprise-grade teal-forward palette with warm amber accents, dark mode support via custom theme provider, Inter (body) and Source Serif 4 (headings) fonts, comprehensive animation system with scroll reveal, and WCAG AA-compliant contrast ratios.

**Key architecture decisions:** Custom theme provider (not next-themes) to avoid script injection issues in Next.js 16, dual database schemas maintained in sync, demo mode toggle for development without backend dependencies.

**Development approach:** pnpm workspaces, Turbopack dev server, Drizzle Kit for database management.

## Constraints

- **Tech Stack**: Next.js 16, React 19, TypeScript 6, Tailwind CSS 4 — locked
- **Database**: Must support both PostgreSQL (Neon) and SQLite — dual schema maintenance required
- **API Dependency**: iVALT API availability required for verification flow production testing
- **Deployment**: Vercel-compatible architecture assumed (serverless functions, edge-ready)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Custom theme provider (not next-themes) | Avoids script tag injection errors in Next.js 16 | — Pending |
| Dual database schemas (Postgres + SQLite) | Production uses Neon, local dev uses SQLite | — Pending |
| Demo mode toggle | Enables frontend dev without iVALT API dependency | — Pending |
| React Query for API calls | Handles polling, caching, and mutation state | — Pending |
| Zod validation on both client and server | Defense in depth for all API inputs | — Pending |

---

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-12 after initialization*
