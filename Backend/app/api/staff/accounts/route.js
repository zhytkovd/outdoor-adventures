import { requireStaff } from '../../../../lib/staffAuth';
import { createStaffAccount, listStaffAccounts, StaffAdminError } from '../../../../lib/staff/accounts';

export const dynamic = 'force-dynamic';

// GET /api/staff/accounts: all OAP staff accounts.
export async function GET(request) {
  const { denied } = await requireStaff(request);
  if (denied) return denied;
  try {
    return Response.json(await listStaffAccounts());
  } catch (error) {
    console.error('GET /api/staff/accounts failed:', error);
    return Response.json({ error: 'Failed to load staff accounts.' }, { status: 500 });
  }
}

// POST /api/staff/accounts  { "username": "..." }
// -> 201 { account, password }. The generated password is only returned here.
export async function POST(request) {
  const { account: actor, denied } = await requireStaff(request);
  if (denied) return denied;
  try {
    const body = await request.json().catch(() => ({}));
    const result = await createStaffAccount(body.username, actor);
    return Response.json(result, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof StaffAdminError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error('POST /api/staff/accounts failed:', error);
    return Response.json({ error: 'Failed to create the account.' }, { status: 500 });
  }
}
