function validateCategoryID(id) {
  const categoryId = Number(id);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return null;
  }
  return categoryId;
}

function validateCategoryData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Invalid request body";
  }

  const { name, description, icon, subcategories } = data;

  if (typeof name != "string" || name.length > 100 || name.trim() === "") {
    return "Invalid category name";
  }
  if (typeof description != "string" && description !== null) {
    return "Invalid description";
  }
  if (icon !== null && (typeof icon != "string" || icon.length > 50)) {
    return "Invalid icon";
  }
  if (!Array.isArray(subcategories)) {
    return "Invalid subcategories";
  }

  const names = new Set();

  const ids = new Set();

  for (const subcategory of subcategories) {
    if (
      !subcategory ||
      typeof subcategory !== "object" ||
      Array.isArray(subcategory)
    ) {
      return "Invalid subcategory";
    }
    // validate subcategory name
    if (
      typeof subcategory.name != "string" ||
      subcategory.name.trim() === "" ||
      subcategory.name.length > 100
    ) {
      return "Invalid subcategory name";
    }

    const normalizedName = subcategory.name.trim().toLowerCase();

    if (names.has(normalizedName)) {
      return "Duplicate subcategory name";
    }
    names.add(normalizedName);

    // validate subcategory id, if provided
    if (subcategory.subcategory_id !== undefined) {
      if (
        !Number.isInteger(subcategory.subcategory_id) ||
        subcategory.subcategory_id <= 0
      ) {
        return "SubcategoryID is invalid";
      }

      if (ids.has(subcategory.subcategory_id)) {
        return "Duplicate subcategory ID";
      }
      ids.add(subcategory.subcategory_id);
    }
  }

  return null;
}

export { validateCategoryData, validateCategoryID };
