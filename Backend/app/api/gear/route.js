
import { requireStaff } from "../../../lib/staffAuth";
import { listGear } from "../../../lib/gear/gear";

// GET ../gear
export async function GET(request) {
  const { denied } = await requireStaff(request);
  if (denied) return denied;

  try {
    const data = await listGear();
    return Response.json(data);
  } catch (error) {
    console.error("GET /api/gear failed:", error);

    return Response.json(
      { error: "Failed to load gear." },
      { status: 500 }
    );
  }
}

