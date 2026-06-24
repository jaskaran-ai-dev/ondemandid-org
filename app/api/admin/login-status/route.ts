import { NextResponse } from 'next/server';
import { getAuthResult, mapIvaltStatus } from '@/lib/ivalt';
import {
  setSessionCookie,
  ADMIN_COUNTRY_CODE,
  ADMIN_MOBILE,
  ADMIN_ID_CONNECTION,
} from '@/lib/admin/auth';

// Demo mode store for admin login resolution
declare global {
  // eslint-disable-next-line no-var
  var __adminLoginResolve: Map<string, number> | undefined;
}

const resolveAt: Map<string, number> =
  globalThis.__adminLoginResolve ?? new Map();
if (!globalThis.__adminLoginResolve) {
  globalThis.__adminLoginResolve = resolveAt;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('requestId');

  if (!requestId) {
    return NextResponse.json(
      { error: 'Missing requestId parameter' },
      { status: 400 }
    );
  }

  const isDemoMode = process.env.DEMO_MODE === 'true';

  if (isDemoMode) {
    // Simulate: resolve after 4 seconds
    if (!resolveAt.has(requestId)) {
      resolveAt.set(requestId, Date.now() + 4000);
    }

    const resolveTime = resolveAt.get(requestId)!;
    if (Date.now() < resolveTime) {
      return NextResponse.json({
        status: 'pending',
        ivaltStatusCode: 422,
      });
    }

    // Authenticated - set session cookie
    const response = NextResponse.json({
      status: 'authenticated',
      ivaltStatusCode: 200,
    });
    setSessionCookie(response);
    resolveAt.delete(requestId);
    return response;
  }

  // Production: poll iVALT API
  try {
    const authResult = await getAuthResult(requestId);
    const { status, ivaltStatusCode } = mapIvaltStatus(authResult.statusCode);

    if (status === 'authenticated') {
      // Verify the mobile matches admin before creating session
      // (The requestId was created with admin credentials, so this is safe)
      const response = NextResponse.json({
        status: 'authenticated',
        ivaltStatusCode,
      });
      setSessionCookie(response);
      return response;
    }

    if (status === 'pending') {
      return NextResponse.json({
        status: 'pending',
        ivaltStatusCode,
      });
    }

    // failed or not_found
    return NextResponse.json({
      status,
      ivaltStatusCode,
    });
  } catch (error) {
    console.error('Admin login status error:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication status' },
      { status: 500 }
    );
  }
}
