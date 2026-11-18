import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  clearFailedLogins,
  clientIp,
  isRateLimited,
  isStaffLoginConfigured,
  loginStaff,
  recordFailedLogin,
  sessionCookieOptions,
} from '../../../../lib/staffAuth';

// POST /api/staff/login  { "username": "...", "password": "..." }
// Correct -> 200 { account } and a session cookie (until the browser closes).
export async function POST(request) {
  if (!isStaffLoginConfigured()) {
    console.error('Staff login is not configured: run `npm run create-staff` in Backend.');
    return NextResponse.json({ error: 'Staff login is not set up on the server.' }, { status: 503 });
  }

  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again in 15 minutes.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === 'string' ? body.username : '';
  const password = typeof body.password === 'string' ? body.password : '';

  try {
    const result = username && password ? await loginStaff(username, password) : null;
    if (!result) {
      recordFailedLogin(ip);
      return NextResponse.json({ error: 'Incorrect username or password.' }, { status: 401 });
    }
    clearFailedLogins(ip);
    const response = NextResponse.json({ account: result.account });
    response.cookies.set(SESSION_COOKIE, result.token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error('POST /api/staff/login failed:', error);
    return NextResponse.json({ error: 'Sign-in failed. Try again.' }, { status: 500 });
  }
}
