
import { requireStaff } from "../../../lib/staffAuth";
import { listGear, createGear, validateGearCategory } from "../../../lib/gear/gear";
import { validateGearData } from "../../../lib/gear/validation.js";

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

// POST ../gear
export async function POST(request){
    const { denied } = await requireStaff(request);
    if(denied) return denied;

    try{
        const body = await request.json().catch(() => null);

        // Validate gear body
        const validationError = validateGearData(body);

        if(validationError){
            return Response.json({error: validationError}, {status: 400});
        }

        // Validate category and subcategory
        const validateGearCategoryError = await validateGearCategory(body.category_id, body.subcategory_id);

        if(validateGearCategoryError){
            return Response.json({error: validateGearCategoryError}, {status: 400});
        }

        // Create new gear
        const gearId = await createGear(body);

        return Response.json({message: "Gear created successfully", gear_id: gearId}, {status: 201});

    }
    catch(error){
        console.error("Failed to create gear:", error);
        return Response.json({error: "Failed to create gear"}, {status: 500});
    }
}