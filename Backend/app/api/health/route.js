import pool from '../../../db';

// GET /api/health: confirms the server is up and can reach the database.
export async function GET() {
  try {
    await pool.query('SELECT 1');
    return Response.json({ ok: true, database: 'connected' });
  } catch (error) {
    return Response.json(
      { ok: false, database: 'unreachable', error: error.message },
      { status: 500 }
    );
  }
}
