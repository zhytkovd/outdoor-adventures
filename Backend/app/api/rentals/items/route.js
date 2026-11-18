import { getAllItems } from '../../../../lib/rentals/items';

// Always read fresh data from the database; never cache this response.
export const dynamic = 'force-dynamic';

// GET /api/rentals/items: gear and sets for the catalog and the OAP
// Logistics table. Response format: Frontend/README.md §3.2.
export async function GET() {
  try {
    const items = await getAllItems();
    return Response.json(items);
  } catch (error) {
    console.error('GET /api/rentals/items failed:', error);
    return Response.json({ error: 'Failed to load items.' }, { status: 500 });
  }
}
