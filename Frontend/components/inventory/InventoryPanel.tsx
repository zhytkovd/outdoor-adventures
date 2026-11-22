"use client";

import { useState, useEffect } from "react";
import {
  CategoriesPage,
  type NewCategoryInput,
  type UpdateCategoryInput,
} from "./categories/CategoriesPage";
import { DashboardPage } from "./dashboard/DashboardPage";
import { AddGearPage } from "./gear/AddGearPage";
import { EditGearPage } from "./gear/EditGearPage";
import { GearDetailsPage } from "./gear/GearDetailsPage";
import { GearPage } from "./gear/GearPage";
import { initialRentals, initialUsers } from "./mockData";
import { ReportsPage } from "./reports/ReportsPage";
import type { Gear, GearStatus, Category, InventoryPage } from "./types";

// Backend gear structure
type ApiGear = {
  gear_id: number;
  name: string;
  category_id: number;
  category_name: string;
  subcategory_id: number | null;
  subcategory: string | null;
  description?: string | null;
  size: string | null;
  purchase_date?: string | null;
  expiration_date: string | null;
  condition_status: "good" | "minor_wear" | "damaged";
  status: GearStatus;
  total_quantity: number;
  maintenance_count: number;
  unit_cost: string | number;
  faculty_only: number | boolean;
  needs_cleaning: number | boolean;
  delivery_allowed: number | boolean;
  is_high_risk: number | boolean;
};

// Backend category structure
type ApiCategory = {
  category_id: number;
  name: string;
  code: string | null;
  description: string | null;
  icon: string | null;
  item_count: number | string;
  subcategories: {
    subcategory_id: number;
    name: string;
  }[];
};

// Convert backend categories to frontend categories
function mapApiCategory(item: ApiCategory): Category {
  return {
    id: item.category_id,
    name: item.name,
    code: item.code,
    description: item.description ?? "",
    icon: item.icon ?? "",
    itemCount: Number(item.item_count),
    subcategories: item.subcategories.map((sub) => ({
      id: sub.subcategory_id,
      name: sub.name,
    })),
  };
}

// Retrieve categories from backend
async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const data: ApiCategory[] = await response.json();
  return data.map(mapApiCategory);
}

// Convert backend gear to frontend gear
function mapApiGear(item: ApiGear): Gear {
  return {
    id: item.gear_id,
    name: item.name,
    category: item.category_name,
    categoryId: item.category_id,
    subcategory: item.subcategory ?? "",
    subcategoryId: item.subcategory_id,
    size: item.size ?? "",
    purchaseDate: item.purchase_date?.slice(0, 10) ?? "",
    expirationDate: item.expiration_date?.slice(0, 10) ?? "",
    condition: item.condition_status,
    status: item.status,
    description: item.description ?? "",
    access: item.faculty_only ? "Faculty only" : "Everyone",
    totalQuantity: item.total_quantity,
    unitCost: Number(item.unit_cost),
    maintenanceCount: item.maintenance_count,
    needsCleaning: Boolean(item.needs_cleaning),
    deliveryAllowed: Boolean(item.delivery_allowed),
    isHighRisk: Boolean(item.is_high_risk),
  };
}

// Convert frontend gear to backend request body
function mapGearToApi(
  updated: Omit<Gear, "id">,
  categoryId: number,
  subcategoryId: number | null,
) {
  return {
    name: updated.name.trim(),
    category_id: categoryId,
    subcategory_id: subcategoryId,
    total_quantity: updated.totalQuantity,
    maintenance_count: updated.maintenanceCount,
    unit_cost: updated.unitCost,
    condition_status: updated.condition,
    purchase_date: updated.purchaseDate || null,
    expiration_date: updated.expirationDate || null,
    description: updated.description || null,
    size: updated.size || null,
    needs_cleaning: updated.needsCleaning,
    delivery_allowed: updated.deliveryAllowed,
    faculty_only: updated.access === "Faculty only",
    is_high_risk: updated.isHighRisk,
    is_active: updated.status !== "Inactive",
  };
}

// Retrieve gear from backend
async function fetchGear(): Promise<Gear[]> {
  const response = await fetch("/api/gear", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch gear: ${response.status}`);
  }

  const data: ApiGear[] = await response.json();

  return data.map(mapApiGear);
}

export function InventoryPanel({
  page,
  selectedId,
  navigate,
}: {
  page: InventoryPage | null;
  selectedId: number | null;
  navigate: (page: InventoryPage, id?: number) => void;
}) {
  const [gear, setGear] = useState<Gear[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load gear when component mounts
  useEffect(() => {
    async function loadGear() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchGear();
        setGear(data);
      } catch (error) {
        console.error("Failed to fetch gear:", error);
        setError("Failed to load inventory. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadGear();
  }, []);

  // Load categories independently of gear
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
        setCategoriesError(null);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategoriesError("Failed to load categories. Please try again.");
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  const selectedGear = gear.find((g) => g.id === selectedId);

  // Refresh inventory after a successful database operation
  const refreshGear = async (): Promise<void> => {
    try {
      const data = await fetchGear();
      setGear(data);
      setError(null);
    } catch (error) {
      console.error("Failed to refresh inventory:", error);
      setError(
        "Changes were saved, but inventory could not be refreshed. Reload the page.",
      );
    }
  };

  // Refresh category counts after gear changes
  const refreshCategories = async (): Promise<void> => {
    try {
      const data = await fetchCategories();
      setCategories(data);
      setCategoriesError(null);
    } catch (error) {
      console.error("Failed to refresh categories:", error);
      setCategoriesError("Failed to refresh categories. Reload the page.");
    }
  };

  // CREATE CATEGORY — connected to backend
  const addCategory = async (newCategory: NewCategoryInput): Promise<void> => {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCategory),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || "Failed to create category");
    }

    // Reload categories from MySQL after creation
    await refreshCategories();
  };

  // EDIT CATEGORY — connected to backend
  const editCategory = async (
    categoryId: number,
    updated: UpdateCategoryInput,
  ): Promise<void> => {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updated),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || "Failed to update category");
    }

    // Category or subcategory names may also appear on gear records
    await Promise.all([refreshCategories(), refreshGear()]);
  };

  // DELETE CATEGORY — connected to backend
  const deleteCategory = async (categoryId: number): Promise<void> => {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || "Failed to delete category");
    }

    // Remove the deleted category immediately and refresh from MySQL
    setCategories((previous) =>
      previous.filter((category) => category.id !== categoryId),
    );
    await refreshCategories();
  };

  // ADD — use category IDs from the Categories API
  const addGear = async (newGear: Omit<Gear, "id">): Promise<void> => {
    const category = categories.find((c) => c.id === newGear.categoryId);

    if (!category) {
      throw new Error("Select a valid category");
    }

    if (
      newGear.subcategoryId != null &&
      !category.subcategories.some((sub) => sub.id === newGear.subcategoryId)
    ) {
      throw new Error("Select a valid subcategory");
    }

    const body = mapGearToApi(
      newGear,
      category.id,
      newGear.subcategoryId ?? null,
    );

    // Send POST request
    const response = await fetch("/api/gear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || "Failed to create gear");
    }

    await Promise.all([refreshGear(), refreshCategories()]);
  };

  // EDIT — connected to backend
  const saveGear = async (updated: Gear): Promise<void> => {
    const original = gear.find((g) => g.id === updated.id);

    if (!original) {
      throw new Error("Gear not found");
    }

    const category = categories.find((c) => c.id === updated.categoryId);

    if (!category) {
      throw new Error("Select a valid category");
    }

    if (
      updated.subcategoryId != null &&
      !category.subcategories.some((sub) => sub.id === updated.subcategoryId)
    ) {
      throw new Error("Select a valid subcategory");
    }

    // Allow category and subcategory reassignment
    const body = mapGearToApi(
      updated,
      category.id,
      updated.subcategoryId ?? null,
    );

    // Send PUT request
    const response = await fetch(`/api/gear/${updated.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || "Failed to update gear");
    }

    await Promise.all([refreshGear(), refreshCategories()]);
  };

  // Render selected inventory page
  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage rentals={initialRentals} />;

      case "gear":
        return <GearPage gear={gear} navigate={navigate} />;

      case "gear-details":
        return selectedGear ? (
          <GearDetailsPage gearItem={selectedGear} navigate={navigate} />
        ) : (
          <GearPage gear={gear} navigate={navigate} />
        );

      case "add-gear":
        return (
          <AddGearPage
            navigate={navigate}
            onAdd={addGear}
            categories={categories}
          />
        );

      case "edit-gear":
        return selectedGear ? (
          <EditGearPage
            gearItem={selectedGear}
            navigate={navigate}
            onSave={saveGear}
            categories={categories}
          />
        ) : (
          <GearPage gear={gear} navigate={navigate} />
        );

      case "categories":
        return (
          <CategoriesPage
            categories={categories}
            loading={categoriesLoading}
            error={categoriesError}
            onAdd={addCategory}
            onEdit={editCategory}
            onDelete={deleteCategory}
          />
        );

      case "reports":
        return (
          <ReportsPage
            rentals={initialRentals}
            gear={gear}
            users={initialUsers}
          />
        );

      case null:
        return null;
    }
  };

  if (page === null) return null;

  const isGearPage =
    page === "gear" ||
    page === "gear-details" ||
    page === "edit-gear" ||
    page === "add-gear";

  if (isGearPage && loading) {
    return (
      <div className="p-6 text-center text-text-s">Loading inventory...</div>
    );
  }

  if (isGearPage && error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (page === "add-gear" || page === "edit-gear") {
    if (categoriesLoading) {
      return (
        <div className="p-6 text-center text-text-s">Loading categories...</div>
      );
    }

    if (categoriesError) {
      return (
        <div className="p-6 text-center text-red-600">{categoriesError}</div>
      );
    }
  }

  return <div className="min-w-0">{renderPage()}</div>;
}
