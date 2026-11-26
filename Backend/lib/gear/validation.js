function validateGearId(id) {
  const gearId = Number(id);

  if (!Number.isInteger(gearId) || gearId <= 0) {
    return null;
  }

  return gearId;
}

function validateGearData(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Invalid request body";
  }
  

  const {
    name,
    category_id,
    subcategory_id,
    total_quantity,
    maintenance_count,
    unit_cost,
    condition_status,
    purchase_date,
    expiration_date,
    description,
    size,
  } = body;

  if (typeof name !== "string" || name.trim() === "" || name.length > 150) {
    return "Invalid gear name";
  }

  if (!Number.isInteger(category_id) || category_id <= 0) {
    return "Invalid categoryId";
  }
  if (
    subcategory_id !== null &&
    (!Number.isInteger(subcategory_id) || subcategory_id <= 0)
  ) {
    return "Invalid subcategory";
  }

  const MAX_QUANTITY = 2147483647;

  if (
    !Number.isInteger(total_quantity) ||
    total_quantity <= 0 ||
    total_quantity > MAX_QUANTITY
  ) {
    return "Quantity must be a positive integer no greater than 2147483647";
  }
  if (!Number.isInteger(maintenance_count) || maintenance_count < 0) {
    return "Invalid maintenance_count";
  }
  if (maintenance_count > total_quantity) {
    return "Maintanance count must be no greater than total quantity";
  }

  if (
    typeof unit_cost !== "number" ||
    unit_cost < 0 ||
    unit_cost > 99999999.99 ||
    !Number.isFinite(unit_cost) ||
    Number(unit_cost.toFixed(2)) !== unit_cost
  ) {
    return "Invalid unit cost";
  }

  if (!["good", "minor_wear", "damaged"].includes(condition_status)) {
    return "Invalid gear condition";
  }

  if (!isValidDate(purchase_date)) {
    return "Invalid purchase date";
  }

  if (!isValidDate(expiration_date)) {
    return "Invalid expiration date";
  }

  if (typeof description !== "string" && description !== null) {
    return "Invalid description";
  }

  if (size !== null && (typeof size !== "string" || size.length > 50)) {
    return "Invalid size";
  }

  const booleanFields = [
    "needs_cleaning",
    "delivery_allowed",
    "faculty_only",
    "is_high_risk",
    "is_active",
  ];

  for (const field of booleanFields) {
    if (typeof body[field] !== "boolean") {
      return `Invalid ${field}`;
    }
  }
  return null;
}

function isValidDate(value) {
  if (value === null) return true;

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

module.exports = { validateGearId, validateGearData };
