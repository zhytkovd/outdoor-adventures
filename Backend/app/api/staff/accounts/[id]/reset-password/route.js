import { requireStaff } from '../../../../../../lib/staffAuth';
import { resetStaffPassword, StaffAdminError } from '../../../../../../lib/staff/accounts';

// POST /api/staff/accounts/:id/reset-password -> { account, password }
// Generates a new password (shown once) and logs out that account's sessions.
export async function POST(request, { params }) {
  const { account: actor, denied } = await requireStaff(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const result = await resetStaffPassword(Number(id), actor);
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof StaffAdminError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error('POST /api/staff/accounts/:id/reset-password failed:', error);
    return Response.json({ error: 'Failed to reset the password.' }, { status: 500 });
  }
}
