import { getStaffAccount } from '../../../../lib/staffAuth';

export const dynamic = 'force-dynamic';

// GET /api/staff/session -> { authenticated, account }
export async function GET(request) {
  try {
    const account = await getStaffAccount(request);
    return Response.json({ authenticated: Boolean(account), account });
  } catch (error) {
    console.error('GET /api/staff/session failed:', error);
    return Response.json({ error: 'Could not check the session.' }, { status: 500 });
  }
}
