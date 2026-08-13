'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { HowVerificationWorks } from '@/components/verification/how-verification-works';
import { VerificationForm } from '@/components/verification/verification-form';
import {
  VerificationStatus,
  type VerificationState,
} from '@/components/verification/verification-status';
import { useVerify, useStatus } from '@/hooks/use-api';
import type { VerifyValues } from '@/lib/validation';

const MAX_ATTEMPTS = 60; // 2 minutes (2s polling x 60)

export function VerificationClient({
  demoMode = false,
}: {
  demoMode?: boolean;
}) {
  const [state, setState] = useState<VerificationState>({ kind: 'idle' });
  const [lastValues, setLastValues] = useState<VerifyValues | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(1);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const verifyMutation = useVerify();
  const statusQuery = useStatus(requestId ?? '', state.kind === 'pending');

  // Handle status changes
  useEffect(() => {
    if (statusQuery.data && state.kind === 'pending') {
      const statusData = statusQuery.data;

      if (statusData.status === 'authenticated') {
        setRequestId(null);
        setState({
          kind: 'authenticated',
          requestId: requestId!,
          idConnection: lastValues?.idConnection ?? '',
          durationMs: startedAt ? Date.now() - startedAt : 0,
          details: statusData.details,
        });
        toast.success('Identity verified');
      } else if (statusData.status === 'failed') {
        setRequestId(null);
        setState({
          kind: 'failed',
          requestId: requestId!,
          ivaltStatusCode: statusData.ivaltStatusCode ?? 403,
        });
        toast.error('Verification denied');
      } else if (statusData.status === 'not_found') {
        setRequestId(null);
        setState({
          kind: 'not_found',
          ivaltStatusCode: statusData.ivaltStatusCode ?? 404,
        });
      } else {
        // Still pending: bump attempt counter
        setAttempt(prev => {
          const newAttempt = prev + 1;
          if (newAttempt >= MAX_ATTEMPTS) {
            setRequestId(null);
            setState({
              kind: 'failed',
              requestId: requestId!,
              ivaltStatusCode: 403,
            });
            toast.error('Verification timed out');
          } else {
            setState(prev =>
              prev.kind === 'pending'
                ? {
                    ...prev,
                    attempt: newAttempt,
                    ivaltStatusCode: statusData.ivaltStatusCode ?? 422,
                  }
                : prev
            );
          }
          return newAttempt;
        });
      }
    }
  }, [statusQuery.data?.status, state.kind, requestId, lastValues, startedAt]);

  async function startVerification(values: VerifyValues) {
    setLastValues(values);
    setState({ kind: 'submitting' });

    try {
      const result = await verifyMutation.mutateAsync(values);

      if (result.ivaltStatusCode === 404) {
        setState({ kind: 'not_found', ivaltStatusCode: 404 });
        return;
      }

      if (result.ok && result.id) {
        setRequestId(result.id);
        setAttempt(1);
        setStartedAt(Date.now());
        setState({
          kind: 'pending',
          requestId: result.id,
          idConnection: values.idConnection,
          countryCode: values.countryCode,
          mobile: values.mobile,
          attempt: 1,
          maxAttempts: MAX_ATTEMPTS,
          ivaltStatusCode: result.ivaltStatusCode ?? 422,
          startedAt: Date.now(),
        });
      }
    } catch {
      // Error handling is done in the mutation
    }
  }

  function handleReset() {
    setRequestId(null);
    setAttempt(1);
    setStartedAt(null);
    setState({ kind: 'idle' });
  }

  function handleRetry() {
    if (lastValues) {
      void startVerification(lastValues);
    } else {
      handleReset();
    }
  }

  const showForm = state.kind === 'idle' || state.kind === 'submitting';

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        {showForm ? (
          <VerificationForm
            onSubmit={startVerification}
            submitting={verifyMutation.isPending}
          />
        ) : (
          <VerificationStatus
            state={state}
            onReset={handleReset}
            onRetry={handleRetry}
          />
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <HowVerificationWorks stateKind={state.kind} />

        {demoMode && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold">Demo IDCONNECTION codes</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Try these codes to see different states. Any 4–12 alphanumeric
              code is accepted in the demo.
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-xs">
              <DemoCode code="ACME7421" hint="Approved by user" />
              <DemoCode code="DEMO1234" hint="Approved by user" />
              <DemoCode
                code="MISSING01"
                hint="Returns not_found (user not registered)"
              />
              <DemoCode
                code="ACME7421"
                hint="With mobile ending 0000 → user denies"
              />
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

function DemoCode({ code, hint }: { code: string; hint: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2">
      <code className="font-mono text-xs font-semibold">{code}</code>
      <span className="text-muted-foreground">{hint}</span>
    </li>
  );
}
