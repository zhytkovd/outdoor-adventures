
import { requireStaff } from "../../../../lib/staffAuth";
import { getGearById, updateGear, validateGearCategory } from "../../../../lib/gear/gear";
import { validateGearId, validateGearData } from "../../../../lib/gear/validation.js";


// GET ../gear/[id]
export async function GET(request, { params }){
    const { denied } = await requireStaff(request);
    if(denied) return denied;

    try{
        const { id } = await params;
        const gearId = validateGearId(id);

        if(gearId === null){
            return Response.json({error: "Invalid gear ID"}, {status: 400});
        }

        const data = await getGearById(gearId);

        if(data === null){
            return Response.json({error: "Gear doesn't exist"}, {status: 404});
        }

        return Response.json(data, {status: 200});

    }
    catch(error){
        console.error("Failed to retrieve gear:", error);
        return Response.json({error: "Failed to retrieve gear"}, {status: 500});
    }
}


// PUT ../gear/[id]
export async function PUT(request, { params }){
    const { denied } = await requireStaff(request);
    if(denied) return denied;

    try{
        const { id } = await params;
        const gearId = validateGearId(id);

        if(gearId === null){
            return Response.json({error: "Invalid gear ID"}, {status: 400});
        }

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

        // Update gear
        const affectedRows = await updateGear(gearId, body);

        if(affectedRows === 0){
            return Response.json({error: "Gear not found"}, {status: 404});
        }

        return Response.json({message: "Gear updated successfully"}, {status: 200});

    }
    catch(error){
        console.error("Failed to update gear:", error);
        return Response.json({error: "Failed to update gear"}, {status: 500});
    }
}
