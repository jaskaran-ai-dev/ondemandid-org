'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  RefreshCcw,
  ScanFace,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export type VerificationState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | {
      kind: 'pending';
      requestId: string;
      idConnection: string;
      countryCode: string;
      mobile: string;
      attempt: number;
      maxAttempts: number;
      ivaltStatusCode: number;
      startedAt: number;
    }
  | {
      kind: 'authenticated';
      requestId: string;
      idConnection: string;
      durationMs: number;
      details?: Record<string, unknown> | null;
    }
  | { kind: 'failed'; requestId: string; ivaltStatusCode: number }
  | { kind: 'not_found'; ivaltStatusCode: number }
  | { kind: 'error'; message: string };

type Props = {
  state: VerificationState;
  onReset: () => void;
  onRetry: () => void;
};

export function VerificationStatus({ state, onReset, onRetry }: Props) {
  if (state.kind === 'idle') return null;

  if (state.kind === 'submitting') {
    return (
      <StatusShell
        eyebrow="Sending"
        title="Dispatching the request"
        description="Validating the IDCONNECTION code and sending a push to the iVALT app."
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
          Waiting for the mobile device…
        </div>
      </StatusShell>
    );
  }

  if (state.kind === 'pending') {
    return <PendingPanel state={state} onReset={onReset} />;
  }

  if (state.kind === 'authenticated') {
    return <AuthenticatedPanel state={state} onReset={onReset} />;
  }

  if (state.kind === 'failed') {
    return (
      <StatusShell
        tone="destructive"
        eyebrow="Denied"
        title="Verification denied"
        description="The user rejected the request, the token expired, or the five-minute window elapsed."
        footer={
          <Actions onReset={onReset} onRetry={onRetry} primaryLabel="Try again" />
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          No identity was confirmed. You can send the same request again, or
          start over with a different number.
        </p>
      </StatusShell>
    );
  }

  if (state.kind === 'not_found') {
    return (
      <StatusShell
        tone="warning"
        eyebrow="Not found"
        title="User or IDCONNECTION not found"
        description="The IDCONNECTION code is invalid or inactive, or this number is not registered with iVALT."
        footer={
          <Actions
            onReset={onReset}
            onRetry={onRetry}
            primaryLabel="Edit details"
          />
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Check the code and mobile number, then send the request again.
        </p>
      </StatusShell>
    );
  }

  if (state.kind === 'error') {
    return (
      <StatusShell
        tone="destructive"
        eyebrow="Error"
        title="Something went wrong"
        description={state.message}
        footer={
          <Actions onReset={onReset} onRetry={onRetry} primaryLabel="Retry" />
        }
      >
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          The request did not complete. Nothing was charged and no identity was
          recorded.
        </div>
      </StatusShell>
    );
  }

  return null;
}

function AuthenticatedPanel({
  state,
  onReset,
}: {
  state: Extract<VerificationState, { kind: 'authenticated' }>;
  onReset: () => void;
}) {
  const details = state.details ?? null;
  const name = pickString(details, ['name', 'full_name']);
  const email = pickString(details, ['email']);
  const mobile = pickString(details, ['mobile', 'phone']);
  const countryCode = pickString(details, ['country_code', 'countryCode']);
  const address = pickString(details, ['address', 'location']);
  const detailConnection = pickString(details, [
    'id_connection',
    'idConnection',
  ]);
  const phone = [countryCode, mobile].filter(Boolean).join(' ').trim();
  const seconds = (state.durationMs / 1000).toFixed(1);
  const showDetailConnection =
    !!detailConnection &&
    detailConnection.toUpperCase() !== state.idConnection.toUpperCase();

  const facts = [
    !phone && mobile
      ? { label: 'Mobile', value: mobile, mono: true }
      : null,
    email ? { label: 'Email', value: email, mono: false } : null,
    address ? { label: 'Location', value: address, mono: false } : null,
    {
      label: 'IDCONNECTION',
      value: state.idConnection,
      mono: true,
    },
    showDetailConnection
      ? { label: 'ID connection', value: detailConnection, mono: true }
      : null,
    state.requestId
      ? { label: 'Request', value: state.requestId, mono: true }
      : null,
  ].filter((row): row is { label: string; value: string; mono: boolean } =>
    Boolean(row)
  );

  return (
    <StatusShell
      eyebrow="Authenticated"
      title="Identity verified"
      description="On-device biometrics matched. This person is who they say they are."
      meta={
        <div className="shrink-0 rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Time
          </p>
          <p className="font-mono text-xl font-semibold leading-none tabular-nums text-foreground">
            {seconds}
            <span className="ml-0.5 text-xs font-medium text-muted-foreground">
              s
            </span>
          </p>
        </div>
      }
      footer={
        <Button onClick={onReset} size="lg" className="w-full">
          Verify another user
        </Button>
      }
    >
      <div
        role="status"
        className="anim-scale-in flex items-center gap-4 rounded-xl border border-primary/25 bg-primary/5 p-4"
      >
        <div
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary font-serif text-lg font-semibold text-primary-foreground"
        >
          {name ? initials(name) : <ScanFace className="size-6" />}
        </div>
        <div className="min-w-0">
          <p className="truncate font-serif text-xl font-semibold tracking-tight">
            {name ?? 'Verified user'}
          </p>
          {phone ? (
            <p className="mt-0.5 font-mono text-sm text-muted-foreground">
              {phone}
            </p>
          ) : null}
          <p
            className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-primary"
            style={{ fontFamily: 'Bespoke Stencil, sans-serif' }}
          >
            On-device match
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {facts.map(fact => (
          <div
            key={fact.label}
            className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5"
          >
            <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {fact.label}
            </dt>
            <dd
              className={cn(
                'mt-1 truncate text-sm font-semibold text-foreground',
                fact.mono && 'font-mono text-xs tracking-wide'
              )}
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </StatusShell>
  );
}

function PendingPanel({
  state,
  onReset,
}: {
  state: Extract<VerificationState, { kind: 'pending' }>;
  onReset: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(i);
  }, []);
  const elapsed = Math.max(0, now - state.startedAt);
  const seconds = Math.floor(elapsed / 1000);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const progress = Math.min(100, (state.attempt / state.maxAttempts) * 100);

  return (
    <StatusShell
      eyebrow="Awaiting response"
      title="Push notification delivered"
      description="The user is reviewing the request in the iVALT app. They approve with face or fingerprint."
      meta={
        <div className="shrink-0 rounded-md border border-border bg-secondary/40 px-2.5 py-1.5 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Elapsed
          </p>
          <p className="font-mono text-xl font-semibold leading-none tabular-nums">
            {mm}:{ss}
          </p>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Most users approve in under 10 seconds.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="ml-auto"
          >
            <XCircle className="mr-1 size-4" aria-hidden />
            Cancel request
          </Button>
        </div>
      }
    >
      <div className="relative mb-5 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <ScanFace className="size-6" aria-hidden />
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-lg bg-primary/15"
        />
      </div>

      <Progress value={progress} aria-label="Verification progress" />

      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Fact label="IDCONNECTION" value={state.idConnection} mono />
        <Fact
          label="Phone"
          value={`${state.countryCode} ${state.mobile}`}
          mono
        />
      </dl>
    </StatusShell>
  );
}

type Tone = 'primary' | 'warning' | 'destructive';

function StatusShell({
  tone = 'primary',
  eyebrow,
  title,
  description,
  meta,
  children,
  footer,
}: {
  tone?: Tone;
  eyebrow: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const eyebrowClass: Record<Tone, string> = {
    primary: 'text-primary',
    warning: 'text-accent',
    destructive: 'text-destructive',
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-border/70 px-6 pb-4 pt-6 md:px-8">
        <div className="flex items-center justify-between gap-3">
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.14em]',
              eyebrowClass[tone]
            )}
          >
            {eyebrow}
          </p>
          {meta}
        </div>
        <h2 className="mt-1.5 text-balance font-serif text-lg font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>
      <div className="flex flex-1 flex-col justify-center px-6 py-6 md:px-8">
        {children}
      </div>
      {footer ? (
        <footer className="border-t border-border/70 px-6 py-3.5 md:px-8">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}

function Fact({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 truncate text-sm font-semibold text-foreground',
          mono && 'font-mono text-xs tracking-wide'
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Actions({
  onReset,
  onRetry,
  primaryLabel,
}: {
  onReset: () => void;
  onRetry?: () => void;
  primaryLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button onClick={onReset} className="sm:flex-1">
        {primaryLabel}
      </Button>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry} className="sm:flex-1">
          <RefreshCcw className="mr-1 size-4" aria-hidden />
          Resend request
        </Button>
      ) : null}
    </div>
  );
}

function pickString(
  details: Record<string, unknown> | null,
  keys: string[]
): string | undefined {
  if (!details) return undefined;
  for (const key of keys) {
    const value = details[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}
