import { requireStaff } from '../../../../../lib/staffAuth';
import { setRenterActive, StaffAdminError } from '../../../../../lib/staff/accounts';

// PATCH /api/staff/renters/:bnumber  { "isActive": false | true }
export async function PATCH(request, { params }) {
  const { account: actor, denied } = await requireStaff(request);
  if (denied) return denied;
  try {
    const { bnumber } = await params;
    const body = await request.json().catch(() => ({}));
    if (typeof body.isActive !== 'boolean') {
      return Response.json({ error: 'isActive must be true or false.' }, { status: 400 });
    }
    return Response.json(await setRenterActive(String(bnumber).toUpperCase(), body.isActive, actor));
  } catch (error) {
    if (error instanceof StaffAdminError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error('PATCH /api/staff/renters/:bnumber failed:', error);
    return Response.json({ error: 'Failed to update the user.' }, { status: 500 });
  }
}
