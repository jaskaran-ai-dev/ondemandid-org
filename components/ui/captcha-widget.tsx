'use client';

import { Turnstile } from '@/components/ui/turnstile';
import { ReCaptcha } from '@/components/ui/recaptcha';

type CaptchaWidgetProps = {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
};

function getClientProvider(): 'turnstile' | 'recaptcha' {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER === 'recaptcha')
      return 'recaptcha';
  }
  return 'turnstile';
}

export function CaptchaWidget({
  onVerify,
  onError,
  onExpire,
  className,
}: CaptchaWidgetProps) {
  const provider = getClientProvider();

  if (provider === 'recaptcha') {
    return (
      <ReCaptcha
        onVerify={onVerify}
        onError={onError}
        onExpire={onExpire}
        className={className}
      />
    );
  }

  return (
    <Turnstile
      onVerify={onVerify}
      onError={onError}
      onExpire={onExpire}
      className={className}
    />
  );
}
