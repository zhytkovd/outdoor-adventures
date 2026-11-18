import { requireStaff } from '../../../../lib/staffAuth';
import { listRenters } from '../../../../lib/staff/accounts';

export const dynamic = 'force-dynamic';

// GET /api/staff/renters: people who reserve gear (users table).
export async function GET(request) {
  const { denied } = await requireStaff(request);
  if (denied) return denied;
  try {
    return Response.json(await listRenters());
  } catch (error) {
    console.error('GET /api/staff/renters failed:', error);
    return Response.json({ error: 'Failed to load users.' }, { status: 500 });
  }
}
