import { requireStaff } from "../../../../lib/staffAuth";
import {
  updateCategory,
  deleteCategory,
} from "../../../../lib/categories/categories";
import {
  validateCategoryID,
  validateCategoryData,
} from "../../../../lib/categories/validation.js";

// PUT ./api/categories/[id]
export async function PUT(request, { params }) {
  const { denied } = await requireStaff(request);
  if (denied) return denied;

  try {
    const { id } = await params;

    const categoryId = validateCategoryID(id);
    if (categoryId === null) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    const data = await request.json().catch(() => null);

    const validationError = validateCategoryData(data);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    await updateCategory(categoryId, data);

    return Response.json(
      { message: "Category updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to update category:", error);

    if (error.message === "Category not found") {
      return Response.json({ error: error.message }, { status: 404 });
    }

    if (error.message === "Cannot delete subcategory: gear is using it") {
      return Response.json({ error: error.message }, { status: 409 });
    }

    if (error.message === "Subcategory not found") {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

// DELETE ./api/categories/[id]
export async function DELETE(request, { params }) {
  const { denied } = await requireStaff(request);
  if (denied) return denied;

  try {
    const { id } = await params;

    const categoryId = validateCategoryID(id);
    if (categoryId === null) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    await deleteCategory(categoryId);

    return Response.json(
      { message: "Category deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete category:", error);

    if (error.message === "Category not found") {
      return Response.json({ error: error.message }, { status: 404 });
    }

    if (error.message === "Cannot delete category: gear is using it") {
      return Response.json({ error: error.message }, { status: 409 });
    }

    if (error.message === "Cannot delete category: gear set is using it") {
      return Response.json({ error: error.message }, { status: 409 });
    }

    return Response.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
