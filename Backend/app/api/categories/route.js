import { requireStaff } from "../../../lib/staffAuth";
import {
  listCategories,
  createCategory,
} from "../../../lib/categories/categories";
import { validateCategoryData } from "../../../lib/categories/validation.js";

// GET ./api/categories
export async function GET(request) {
  const { denied } = await requireStaff(request);
  if (denied) return denied;

  try {
    const data = await listCategories();

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve categories:", error);
    return Response.json(
      { error: "Failed to retrieve categories" },
      { status: 500 },
    );
  }
}

// POST ./api/categories
export async function POST(request) {
  const { denied } = await requireStaff(request);
  if (denied) return denied;

  try {
    const body = await request.json().catch(() => null);

    // Validate category data
    const validationError = validateCategoryData(body);

    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    // Create category and subcategories
    const categoryId = await createCategory(body);

    return Response.json(
      { message: "Category created successfully", category_id: categoryId },
      { status: 201 },
    );
    
  } catch (error) {
    console.error("Failed to create category:", error);
    return Response.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
