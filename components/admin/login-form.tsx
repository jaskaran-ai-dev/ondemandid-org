'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ShieldCheck, Smartphone, Fingerprint, Lock } from 'lucide-react';
import { toast } from 'sonner';

type LoginPhase = 'idle' | 'sending' | 'polling' | 'success' | 'failed';

export function AdminLoginForm() {
  const router = useRouter();
  const [countryCode, setCountryCode] = useState('+91');
  const [mobile, setMobile] = useState('9530654704');
  const [phase, setPhase] = useState<LoginPhase>('idle');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initiateLogin = async () => {
    setPhase('sending');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode, mobile }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPhase('idle');
        setErrorMessage(data.error || 'Login failed');
        toast.error(data.error || 'Login failed');
        return;
      }

      setRequestId(data.requestId);
      setPhase('polling');
    } catch {
      setPhase('idle');
      setErrorMessage('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    }
  };

  const pollStatus = useCallback(async () => {
    if (!requestId) return;

    try {
      const res = await fetch(
        `/api/admin/login-status?requestId=${requestId}`
      );
      const data = await res.json();

      if (data.status === 'authenticated') {
        setPhase('success');
        toast.success('Authentication successful! Redirecting...');
        setTimeout(() => router.push('/admin'), 1000);
      } else if (data.status === 'failed' || data.status === 'not_found') {
        setPhase('failed');
        setErrorMessage(
          'Authentication failed or was denied. Please try again.'
        );
        toast.error('Authentication failed. Please try again.');
      }
      // pending: continue polling
    } catch {
      // Network error during polling, keep trying
    }
  }, [requestId, router]);

  useEffect(() => {
    if (phase !== 'polling' || !requestId) return;

    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [phase, requestId, pollStatus]);

  const resetLogin = () => {
    setPhase('idle');
    setRequestId(null);
    setErrorMessage(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldCheck className="size-7 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              iVALT OnDemand ID
            </p>
          </div>
        </div>

        <Card className="shadow-lg">
          {phase === 'idle' && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="size-5" />
                  Secure Admin Login
                </CardTitle>
                <CardDescription>
                  Enter your registered mobile number to receive a biometric
                  authentication request on your iVALT app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <div className="flex gap-2">
                    <Input
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                      className="w-20 text-center"
                      placeholder="+91"
                      disabled
                    />
                    <Input
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      placeholder="Mobile number"
                      inputMode="numeric"
                    />
                  </div>
                </div>
                {errorMessage && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errorMessage}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={initiateLogin}
                  disabled={!countryCode || !mobile}
                >
                  <Fingerprint className="size-4" />
                  Send Biometric Auth Request
                </Button>
              </CardFooter>
            </>
          )}

          {phase === 'sending' && (
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <Spinner className="size-8" />
                <div>
                  <p className="font-medium">Sending authentication request...</p>
                  <p className="text-sm text-muted-foreground">
                    Contacting iVALT servers
                  </p>
                </div>
              </div>
            </CardContent>
          )}

          {phase === 'polling' && (
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative flex size-20 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/10">
                    <Smartphone className="size-9 text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">
                    Check your iVALT app
                  </p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    A biometric authentication request has been sent to your
                    phone. Approve it with your fingerprint or face scan.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Spinner className="size-3" />
                  Waiting for approval...
                </div>
              </div>
            </CardContent>
          )}

          {phase === 'success' && (
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="size-10 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-lg">Authentication Successful</p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to dashboard...
                  </p>
                </div>
              </div>
            </CardContent>
          )}

          {phase === 'failed' && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <ShieldCheck className="size-5" />
                  Authentication Failed
                </CardTitle>
                <CardDescription>
                  {errorMessage ||
                    'The biometric authentication was denied or timed out.'}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={resetLogin}
                >
                  Try Again
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Authorized admin access only. All login attempts are logged.
        </p>
      </div>
    </div>
  );
}
