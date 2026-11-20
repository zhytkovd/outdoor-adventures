import { requireStaff } from "../../../../lib/staffAuth";
import { getGearById } from "../../../../lib/gear/gear";


// GET ../gear/[id]
export async function GET(request, { params }) {
  const { denied } = await requireStaff(request);
  if (denied) return denied;

  try {
    const { id } = await params;
    const gearId = Number(id);

    if (!Number.isInteger(gearId) || gearId <= 0){ // autoincrement starts at 1
        return Response.json(
            {error:"Id is invalid"},
            {status:400}
        )
    }

    const data = await getGearById(gearId)

    if(data === null){
        return Response.json({error:"Gear doesn't exist"}, {status: 404})
    }

    return Response.json(data)

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to retrieve gear." },
      { status: 500 }
    );
  }
}


export async function PUT(request, { params }) {

    const { denied } = await requireStaff(request);
  if (denied) return denied;
    try{
        

    }
    catch{

    }
  const { id } = await params;

  // Read JSON request body
  const gearData = 

  // Later: validate and call updateGear()

}