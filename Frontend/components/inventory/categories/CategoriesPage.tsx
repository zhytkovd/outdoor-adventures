import { useRef, useState } from "react";
import { Btn, Card, Modal } from "@/components/rentals/ui";
import { headingStyle } from "../InventoryUi";
import type { Category } from "../types";
import {
  Tent,
  Mountain,
  Footprints,
  Package,
  Waves,
  Snowflake,
  Bike,
  Compass,
  CookingPot,
  Backpack,
  Sailboat,
  Shield,
  Map as MapIcon,
  Trees,
  Anchor,
  Flame,
  Binoculars,
  Fish,
  TreePine,
  Sunrise,
  Sunset,
  CloudSun,
  Bird,
  Leaf,
  Route,
  LifeBuoy,
} from "lucide-react";

// These 25 icons are available in the Add and Edit Category dropdowns.
const iconOptions = [
  { value: "tent", label: "Tent / Camping" },
  { value: "mountain", label: "Mountain / Climbing" },
  { value: "footprints", label: "Footprints / Hiking" },
  { value: "waves", label: "Waves / Water" },
  { value: "snowflake", label: "Snowflake / Winter" },
  { value: "bike", label: "Bike / Cycling" },
  { value: "compass", label: "Compass / Navigation" },
  { value: "cooking-pot", label: "Cooking Pot" },
  { value: "backpack", label: "Backpack" },
  { value: "sailboat", label: "Sailboat" },
  { value: "shield", label: "Shield / Safety" },
  { value: "map", label: "Trail Map" },
  { value: "trees", label: "Forest / Trees" },
  { value: "anchor", label: "Anchor" },
  { value: "flame", label: "Campfire / Flame" },
  { value: "binoculars", label: "Binoculars / Wildlife" },
  { value: "fish", label: "Fish / Fishing" },
  { value: "tree-pine", label: "Pine Tree" },
  { value: "sunrise", label: "Sunrise" },
  { value: "sunset", label: "Sunset" },
  { value: "cloud-sun", label: "Cloud & Sun / Weather" },
  { value: "bird", label: "Bird / Birdwatching" },
  { value: "leaf", label: "Leaf / Nature" },
  { value: "route", label: "Trail Route" },
  { value: "life-buoy", label: "Life Buoy / Water Safety" },
] as const;

// Database stores icon names; render their corresponding Lucide icons.
const categoryIcons = {
  tent: Tent,
  mountain: Mountain,
  footprints: Footprints,
  waves: Waves,
  snowflake: Snowflake,
  bike: Bike,
  compass: Compass,
  "cooking-pot": CookingPot,
  backpack: Backpack,
  sailboat: Sailboat,
  shield: Shield,
  map: MapIcon,
  trees: Trees,
  anchor: Anchor,
  flame: Flame,
  binoculars: Binoculars,
  fish: Fish,
  "tree-pine": TreePine,
  sunrise: Sunrise,
  sunset: Sunset,
  "cloud-sun": CloudSun,
  bird: Bird,
  leaf: Leaf,
  route: Route,
  "life-buoy": LifeBuoy,
  package: Package,
};

// Keep previously stored icon aliases working for older categories.
const iconAliases: Record<string, string> = {
  camping: "tent",
  climbing: "mountain",
  hiking: "footprints",
  water: "waves",
  winter: "snowflake",
  cycling: "bike",
  cooking: "cooking-pot",
  navigation: "compass",
  sets: "package",
};

function normalizeIconName(value: string | null): string {
  const name = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
  return iconAliases[name] ?? name;
}

function CategoryIcon({ icon }: { icon: string | null }) {
  const name = normalizeIconName(icon);
  const Icon = categoryIcons[name as keyof typeof categoryIcons] ?? Package;

  return <Icon size={24} strokeWidth={1.8} aria-hidden="true" />;
}

type DraftSubcategory = {
  key: number;
  name: string;
  subcategoryId?: number;
};

export type NewCategoryInput = {
  name: string;
  description: string | null;
  icon: string | null;
  subcategories: { name: string }[];
};

export type UpdateCategoryInput = {
  name: string;
  description: string | null;
  icon: string | null;
  subcategories: { subcategory_id?: number; name: string }[];
};

type Props = {
  categories: Category[];
  loading: boolean;
  error: string | null;
  onAdd: (category: NewCategoryInput) => Promise<void>;
  onEdit: (categoryId: number, category: UpdateCategoryInput) => Promise<void>;
  onDelete: (categoryId: number) => Promise<void>;
};

export function CategoriesPage({
  categories,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [subcategories, setSubcategories] = useState<DraftSubcategory[]>([]);
  const nextSubcategoryKey = useRef(1);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const modalOpen = showAdd || editingCategoryId !== null;
  const isEditing = editingCategoryId !== null;

  const openAdd = () => {
    setEditingCategoryId(null);
    setName("");
    setDescription("");
    setIcon("");
    setSubcategories([]);
    nextSubcategoryKey.current = 1;
    setFormError("");
    setShowAdd(true);
  };

  const openEdit = (category: Category) => {
    setShowAdd(false);
    setEditingCategoryId(category.id);
    setName(category.name);
    setDescription(category.description);
    setIcon(normalizeIconName(category.icon));
    setSubcategories(
      category.subcategories.map((sub, index) => ({
        key: index + 1,
        subcategoryId: sub.id,
        name: sub.name,
      })),
    );
    nextSubcategoryKey.current = category.subcategories.length + 1;
    setFormError("");
  };

  const closeModal = () => {
    if (saving) return;
    setShowAdd(false);
    setEditingCategoryId(null);
    setFormError("");
  };

  const openDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setCategoryToDelete(null);
    setDeleteError("");
  };

  const handleDelete = async () => {
    if (deleting || !categoryToDelete) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await onDelete(categoryToDelete.id);
      setCategoryToDelete(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete category",
      );
    } finally {
      setDeleting(false);
    }
  };

  const addSubcategory = () => {
    const key = nextSubcategoryKey.current++;
    setSubcategories((previous) => [...previous, { key, name: "" }]);
  };

  const updateSubcategory = (key: number, name: string) => {
    setSubcategories((previous) =>
      previous.map((sub) => (sub.key === key ? { ...sub, name } : sub)),
    );
  };

  const removeSubcategory = (key: number) => {
    setSubcategories((previous) => previous.filter((sub) => sub.key !== key));
  };

  const handleSubmit = async () => {
    if (saving) return;

    const subcategoryNames = subcategories.map((sub) => sub.name.trim());

    if (!name.trim() || name.length > 100) {
      setFormError("Category name must be between 1 and 100 characters");
      return;
    }

    if (icon.length > 50) {
      setFormError("Icon name cannot exceed 50 characters");
      return;
    }

    if (subcategoryNames.some((value) => value === "" || value.length > 100)) {
      setFormError(
        "Each subcategory must have a name between 1 and 100 characters",
      );
      return;
    }

    if (
      new Set(subcategoryNames.map((value) => value.toLowerCase())).size !==
      subcategoryNames.length
    ) {
      setFormError("Duplicate subcategory name");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const categoryData = {
        name: name.trim(),
        description: description.trim() || null,
        icon: icon.trim() || null,
      };

      if (editingCategoryId !== null) {
        await onEdit(editingCategoryId, {
          ...categoryData,
          subcategories: subcategories.map((sub) => ({
            ...(sub.subcategoryId !== undefined
              ? { subcategory_id: sub.subcategoryId }
              : {}),
            name: sub.name.trim(),
          })),
        });
      } else {
        await onAdd({
          ...categoryData,
          subcategories: subcategories.map((sub) => ({
            name: sub.name.trim(),
          })),
        });
      }

      setShowAdd(false);
      setEditingCategoryId(null);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to save category",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 style={headingStyle}>Categories</h1>
        <Btn onClick={openAdd} variant="primary">
          + Add Category
        </Btn>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="p-6 text-center text-text-s">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="p-6 text-center text-text-s">No categories found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="px-5 py-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-sage rounded-lg flex items-center justify-center text-pine shrink-0">
                <CategoryIcon icon={cat.icon} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-text-p">{cat.name}</div>
                <div className="text-sm text-text-s truncate">
                  {cat.description || "No description"}
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {cat.subcategories.map((sub) => (
                    <span
                      key={sub.id}
                      className="text-xs bg-table-hd text-text-s px-2 py-0.5 rounded"
                    >
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center shrink-0">
                <div className="text-xl font-bold text-pine">
                  {cat.itemCount}
                </div>
                <div className="text-xs text-text-dis">items</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(cat)}
                  className="cursor-pointer rounded-lg border border-border-col px-3 py-2 text-sm text-text-s hover:bg-sage"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => openDelete(cat)}
                  className="cursor-pointer rounded-lg px-3 py-2 bg-red-600 text-white text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {categoryToDelete && (
        <Modal
          title="Delete Category?"
          onClose={closeDeleteModal}
          footer={
            <>
              <Btn onClick={closeDeleteModal} variant="secondary">
                Cancel
              </Btn>
              <Btn onClick={handleDelete} variant="destructive">
                {deleting ? "Deleting..." : "Delete Category"}
              </Btn>
            </>
          }
        >
          <p className="text-sm text-text-s">
            Permanently delete <strong>{categoryToDelete.name}</strong> and all
            of its subcategories? This cannot be undone.
          </p>
          <p className="mt-3 text-sm text-text-s">
            Categories referenced by gear or gear sets cannot be deleted.
          </p>
          {deleteError && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {deleteError}
            </p>
          )}
        </Modal>
      )}

      {modalOpen && (
        <Modal
          title={isEditing ? "Edit Category" : "Add Category"}
          onClose={closeModal}
          footer={
            <>
              <Btn onClick={closeModal} variant="secondary">
                Cancel
              </Btn>
              <Btn onClick={handleSubmit} variant="primary">
                {saving
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Add Category"}
              </Btn>
            </>
          }
        >
          <div
            className={
              saving ? "space-y-4 pointer-events-none opacity-70" : "space-y-4"
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,240px)_1fr] gap-3">
              <div>
                <label
                  htmlFor="category-icon"
                  className="block text-sm text-text-p"
                >
                  Icon
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <div
                    className="w-11 h-11 bg-sage rounded-lg flex items-center justify-center text-pine shrink-0"
                    aria-label="Selected icon preview"
                  >
                    <CategoryIcon icon={icon} />
                  </div>
                  <select
                    id="category-icon"
                    value={icon}
                    onChange={(event) => setIcon(event.target.value)}
                    className="cursor-pointer min-w-0 flex-1 rounded-lg border border-border-col bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Default (Package)</option>
                    {icon !== "" &&
                      !iconOptions.some((option) => option.value === icon) && (
                        <option value={icon}>Existing: {icon}</option>
                      )}
                    {iconOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="block text-sm text-text-p">
                Name *
                <input
                  type="text"
                  value={name}
                  maxLength={100}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g., Cycling"
                  className="mt-1 w-full rounded-lg border border-border-col bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="block text-sm text-text-p">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Brief description of what goes in this category..."
                rows={3}
                className="mt-1 w-full rounded-lg border border-border-col bg-white px-3 py-2 text-sm resize-y"
              />
            </label>

            <div>
              <label className="block text-sm text-text-p mb-2">
                Subcategories
              </label>
              <div className="space-y-2">
                {subcategories.map((sub, index) => (
                  <div key={sub.key} className="flex items-center gap-2">
                    <input
                      type="text"
                      aria-label={`Subcategory ${index + 1}`}
                      value={sub.name}
                      maxLength={100}
                      onChange={(event) =>
                        updateSubcategory(sub.key, event.target.value)
                      }
                      placeholder="e.g., Bicycles"
                      className="min-w-0 flex-1 rounded-lg border border-border-col bg-white px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeSubcategory(sub.key)}
                      aria-label={`Remove subcategory ${index + 1}`}
                      className="cursor-pointer rounded-lg border border-red-400 text-red-600 px-3 py-2 text-sm hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSubcategory}
                className="cursor-pointer mt-3 rounded-lg border border-pine text-pine px-3 py-2 text-sm hover:bg-sage"
              >
                + Add Subcategory
              </button>
              <p className="mt-1 text-xs text-text-s">
                {isEditing
                  ? "Removing a subcategory used by gear will be blocked."
                  : "Optional. Add each subcategory separately."}
              </p>
            </div>
          </div>

          {formError && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {formError}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
