import { Check, ScanFace, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VerificationState } from '@/components/verification/verification-status';

type Phase = 'idle' | 'send' | 'wait' | 'result';

const STEPS = [
  {
    id: '1',
    title: 'You send the request',
    body: "Enter your IDCONNECTION code and the user's mobile number.",
    visual: 'code' as const,
  },
  {
    id: '2',
    title: 'A secure push is delivered',
    body: 'iVALT notifies the enrolled phone. No password or SMS code.',
    visual: 'phone' as const,
  },
  {
    id: '3',
    title: 'They approve with biometrics',
    body: 'Face or fingerprint, on the device. Biometrics never leave the phone.',
    visual: 'scan' as const,
  },
  {
    id: '4',
    title: 'The result lands here',
    body: 'Verified, denied, or not found — typically in under five seconds.',
    visual: 'result' as const,
  },
];

export function HowVerificationWorks({
  stateKind,
  className,
}: {
  stateKind: VerificationState['kind'];
  className?: string;
}) {
  const phase = phaseFromState(stateKind);

  return (
    <section
      aria-labelledby="how-verify-heading"
      data-phase={phase}
      className={cn(
        'how-verify relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />

      <header className="border-b border-border/70 px-6 pb-4 pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          Request path
        </p>
        <h2
          id="how-verify-heading"
          className="mt-1.5 font-serif text-lg font-semibold tracking-tight"
        >
          How verification works
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Four steps from this form to a biometric decision.
        </p>
      </header>

      <div className="relative flex-1 px-6 py-5">
        <div
          aria-hidden
          className="absolute bottom-8 left-[2.625rem] top-8 w-px bg-border"
        >
          <span className="anim-verify-signal absolute left-1/2 block h-10 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary to-transparent" />
        </div>

        <ol className="flex flex-col gap-0">
          {STEPS.map((step, i) => (
            <li
              key={step.id}
              data-step={step.id}
              className="anim-fade-up relative grid grid-cols-[2.25rem_1fr] gap-3 py-2.5"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <StepVisual kind={step.visual} index={i} />
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-medium leading-snug text-foreground">
                  {step.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-border/70 px-6 py-3.5">
        <span className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
          </span>
          On-device biometrics
        </span>
        <span className="font-mono text-[11px] font-semibold tabular-nums text-foreground">
          Typical · &lt;5s
        </span>
      </footer>
    </section>
  );
}

function phaseFromState(kind: VerificationState['kind']): Phase {
  if (kind === 'submitting') return 'send';
  if (kind === 'pending') return 'wait';
  if (
    kind === 'authenticated' ||
    kind === 'failed' ||
    kind === 'not_found' ||
    kind === 'error'
  ) {
    return 'result';
  }
  return 'idle';
}

function StepVisual({
  kind,
  index,
}: {
  kind: (typeof STEPS)[number]['visual'];
  index: number;
}) {
  return (
    <div
      aria-hidden
      className="anim-verify-node relative z-10 flex size-9 items-center justify-center rounded-lg border border-border bg-background"
      style={{ animationDelay: `${index * 2}s` }}
    >
      {kind === 'code' ? (
        <span className="font-mono text-[8px] font-semibold tracking-wide text-foreground">
          ID
          <span className="anim-verify-caret ml-px inline-block h-2 w-px translate-y-px bg-primary align-middle" />
        </span>
      ) : null}

      {kind === 'phone' ? (
        <span className="relative flex size-full items-center justify-center">
          <Smartphone className="size-3.5 text-foreground" />
          <span className="absolute right-1 top-1.5 size-1.5 rounded-full bg-primary">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary" />
          </span>
        </span>
      ) : null}

      {kind === 'scan' ? (
        <span className="relative flex size-full items-center justify-center overflow-hidden rounded-[inherit]">
          <ScanFace className="size-3.5 text-foreground" />
          <span className="anim-verify-scan absolute inset-x-1.5 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        </span>
      ) : null}

      {kind === 'result' ? (
        <Check
          className="anim-verify-check size-3.5 text-primary"
          strokeWidth={2.5}
        />
      ) : null}
    </div>
  );
}
