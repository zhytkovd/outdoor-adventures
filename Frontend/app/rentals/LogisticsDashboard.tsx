'use client';

import { useState, useMemo } from 'react';
import type {
  UserInfo,
  GearItem,
  GearCondition,
  Reservation,
} from './types';
import {
  DEFAULT_CATEGORIES,
  todayISO,
  nowTimestamp,
  getNextGearId,
  createGearItemInDb,
  updateGearItemInDb,
  deleteGearItemFromDb,
} from './api';
import { GearIllustration } from '@/components/rentals/illustrations';
import {
  C, Btn, IconBtn, SearchField, EmptyState, Modal,
  Field, TextInput, SelectInput, DateInput, Textarea, Card, StatusBadge, EyeIcon, EditIcon, TrashIcon,
} from '@/components/rentals/ui';

const ILLUSTRATION_OPTIONS = [
  { label: 'Kayak', value: 'kayak' },
  { label: 'Tent', value: 'tent' },
  { label: 'Backpack', value: 'backpack' },
  { label: 'Sleeping Bag', value: 'sleeping-bag' },
  { label: 'Headlamp', value: 'headlamp' },
  { label: 'Trekking Poles', value: 'trekking-poles' },
  { label: 'Cooler', value: 'cooler' },
  { label: 'Life Vest (PFD)', value: 'life-vest' },
  { label: 'Camp Stove', value: 'camp-stove' },
  { label: 'Paddle', value: 'paddle' },
  { label: 'Climbing Harness', value: 'harness' },
  { label: 'Snowshoes', value: 'snowshoes' },
];

function formatCurrency(val: number): string {
  return `$${(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Add New Gear / Set Modal ─────────────────────────────────────────────────
function AddGearModal({
  gearItems,
  staffUser,
  onClose,
  onAdd,
}: {
  gearItems: GearItem[];
  staffUser: UserInfo;
  onClose: () => void;
  onAdd: (newItem: GearItem) => void;
}) {
  const [isSet, setIsSet] = useState(false);
  const [customId, setCustomId] = useState(getNextGearId(gearItems, false));
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryName, setCategoryName] = useState('Camping');
  const [totalQty, setTotalQty] = useState('1');
  const [unitCost, setUnitCost] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(todayISO());
  const [expirationDate, setExpirationDate] = useState('');
  const [illustrationType, setIllustrationType] = useState('tent');
  const [deliveryAllowed, setDeliveryAllowed] = useState(true);
  const [facultyOnly, setFacultyOnly] = useState(false);
  const [isHighRisk, setIsHighRisk] = useState(false);
  const [setItemsText, setSetItemsText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleToggleIsSet = (checked: boolean) => {
    setIsSet(checked);
    setCustomId(getNextGearId(gearItems, checked));
    if (checked) setCategoryName('Sets');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!customId.trim()) e.id = 'Item ID is required';
    if (gearItems.some(g => g.id.toUpperCase() === customId.trim().toUpperCase())) {
      e.id = 'An item with this ID already exists';
    }
    if (!name.trim()) e.name = 'Item name is required';
    if (!description.trim()) e.description = 'Description is required for logistics tracking';
    const qty = parseInt(totalQty, 10);
    if (isNaN(qty) || qty < 1) e.totalQty = 'Enter a valid quantity (1 or more)';
    const cost = parseFloat(unitCost || '0');
    if (isNaN(cost) || cost < 0) e.unitCost = 'Enter a valid unit cost (e.g. 125.00)';
    if (!purchaseDate) e.purchaseDate = 'Purchase date is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const qty = parseInt(totalQty, 10);
    const cost = parseFloat(unitCost || '0');
    const matchedCat = DEFAULT_CATEGORIES.find(c => c.name === categoryName);
    const cleanId = customId.trim().toUpperCase();

    const newItem: GearItem = {
      id: cleanId,
      name: name.trim(),
      description: description.trim(),
      categoryId: matchedCat?.categoryId ?? 'CAT-CUSTOM',
      category: categoryName,
      totalQuantity: qty,
      availableQuantity: qty,
      unitCost: cost,
      purchaseDate,
      expirationDate: expirationDate || undefined,
      deliveryAllowed,
      facultyOnly,
      isHighRisk,
      isSet,
      setItems: isSet
        ? setItemsText.split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
      condition: 'Good',
      needsCleaning: false,
      maintenanceCount: 0,
      gearHistory: [
        {
          date: nowTimestamp(),
          event: `Purchased & added to inventory (${formatCurrency(cost)}/unit, bought ${purchaseDate})`,
          amount: qty,
          staffId: staffUser.bNumber,
        },
      ],
      illustrationType,
    };

    onAdd(newItem);
    onClose();
  };

  return (
    <Modal
      title="Add Gear Item or Set to Inventory"
      onClose={onClose}
      footer={
        <>
          <Btn variant="primary" onClick={handleSubmit}>Add Item to Inventory</Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
          <Field label="Gear / Set ID *" error={errors.id}>
            <TextInput value={customId} onChange={setCustomId} placeholder="G01" error={!!errors.id} />
          </Field>
          <Field label="Item Name *" error={errors.name}>
            <TextInput value={name} onChange={setName} placeholder="e.g. 3-Person Dome Tent" error={!!errors.name} />
          </Field>
        </div>

        <Field label="Description & Specs *" helper="Tied to item ID for catalog & logistics lookup" error={errors.description}>
          <Textarea
            value={description}
            onChange={setDescription}
            placeholder="Brand, model, sizing, weight, or special care instructions…"
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Category">
            <SelectInput
              value={categoryName}
              onChange={setCategoryName}
              options={DEFAULT_CATEGORIES.map(c => ({ label: c.name, value: c.name }))}
            />
          </Field>
          <Field label="Catalog Illustration">
            <SelectInput
              value={illustrationType}
              onChange={setIllustrationType}
              options={ILLUSTRATION_OPTIONS}
            />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Total Quantity *" error={errors.totalQty}>
            <TextInput value={totalQty} onChange={setTotalQty} placeholder="10" error={!!errors.totalQty} />
          </Field>
          <Field label="Unit Cost ($) *" helper="Cost per single unit" error={errors.unitCost}>
            <TextInput value={unitCost} onChange={setUnitCost} placeholder="149.99" error={!!errors.unitCost} />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Date Purchased *" error={errors.purchaseDate}>
            <DateInput value={purchaseDate} onChange={setPurchaseDate} min="2000-01-01" />
          </Field>
          <Field label="Expiration / Inspection Date" helper="Optional (for safety/climbing gear)">
            <DateInput value={expirationDate} onChange={setExpirationDate} min={todayISO()} />
          </Field>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, backgroundColor: C.sand, padding: 14, borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.ts, textTransform: 'uppercase' }}>
            Logistics & Access Tags
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: C.tp }}>
            <input
              type="checkbox"
              checked={facultyOnly}
              onChange={e => setFacultyOnly(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: C.pine }}
            />
            <strong>Faculty / Staff Only</strong> — Restrict students from reserving this item
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: C.tp }}>
            <input
              type="checkbox"
              checked={isHighRisk}
              onChange={e => setIsHighRisk(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: C.pine }}
            />
            <strong>High-Risk Gear</strong> — Requires safety acknowledgement before reserving
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: C.tp }}>
            <input
              type="checkbox"
              checked={deliveryAllowed}
              onChange={e => setDeliveryAllowed(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: C.pine }}
            />
            <strong>Delivery Allowed</strong> — Eligible for campus delivery
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: C.tp }}>
            <input
              type="checkbox"
              checked={isSet}
              onChange={e => handleToggleIsSet(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: C.pine }}
            />
            <strong>Gear Set / Bundle</strong> — Bundles multiple pieces of gear under one Set ID
          </label>
          {isSet && (
            <div style={{ marginTop: 6 }}>
              <Field label="Included Gear in Set (comma-separated)">
                <TextInput
                  value={setItemsText}
                  onChange={setSetItemsText}
                  placeholder="e.g. Kayak, Paddle, Life Vest"
                />
              </Field>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── Item Logistics & Lifecycle Detail/Edit Modal ─────────────────────────────
function ItemLogisticsModal({
  item,
  reservations,
  staffUser,
  editMode,
  onClose,
  onSave,
}: {
  item: GearItem;
  reservations: Reservation[];
  staffUser: UserInfo;
  editMode: boolean;
  onClose: () => void;
  onSave: (updated: GearItem) => void;
}) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [category, setCategory] = useState(item.category);
  const [totalQty, setTotalQty] = useState(String(item.totalQuantity));
  const [availableQty, setAvailableQty] = useState(String(item.availableQuantity));
  const [maintenanceQty, setMaintenanceQty] = useState(String(item.maintenanceCount));
  const [unitCost, setUnitCost] = useState(String(item.unitCost ?? 0));
  const [purchaseDate, setPurchaseDate] = useState(item.purchaseDate || '');
  const [expirationDate, setExpirationDate] = useState(item.expirationDate || '');
  const [condition, setCondition] = useState<GearCondition>(item.condition);
  const [needsCleaning, setNeedsCleaning] = useState(item.needsCleaning);
  const [facultyOnly, setFacultyOnly] = useState(item.facultyOnly);
  const [isHighRisk, setIsHighRisk] = useState(item.isHighRisk);

  // All reservations tied to this item's ID
  const itemReservations = useMemo(() => {
    return reservations.filter(r => r.items.some(i => i.itemId === item.id));
  }, [reservations, item.id]);

  const handleSave = () => {
    const newTotal = Math.max(0, parseInt(totalQty, 10) || 0);
    const newAvail = Math.min(newTotal, Math.max(0, parseInt(availableQty, 10) || 0));
    const newMaint = Math.max(0, parseInt(maintenanceQty, 10) || 0);
    const newCost = Math.max(0, parseFloat(unitCost) || 0);

    const updated: GearItem = {
      ...item,
      name: name.trim() || item.name,
      description: description.trim(),
      category,
      totalQuantity: newTotal,
      availableQuantity: newAvail,
      maintenanceCount: newMaint,
      unitCost: newCost,
      purchaseDate,
      expirationDate: expirationDate || undefined,
      condition,
      needsCleaning,
      facultyOnly,
      isHighRisk,
      gearHistory: [
        ...(item.gearHistory || []),
        {
          date: nowTimestamp(),
          event: `Logistics updated (Total: ${newTotal}, Avail: ${newAvail}, Held: ${newMaint}, Cost: ${formatCurrency(newCost)}, Condition: ${condition}${needsCleaning ? ', Needs Cleaning' : ''})`,
          amount: newTotal,
          staffId: staffUser.bNumber,
        },
      ],
    };
    onSave(updated);
    onClose();
  };

  return (
    <Modal
      title={`Item Logistics — ${item.id}: ${item.name}`}
      onClose={onClose}
      footer={
        <>
          {editMode && <Btn variant="primary" onClick={handleSave}>Save Logistics Changes</Btn>}
          <Btn variant={editMode ? 'ghost' : 'secondary'} onClick={onClose}>Close</Btn>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Overview / Edit Fields */}
        {editMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Item Name">
                <TextInput value={name} onChange={setName} />
              </Field>
              <Field label="Category">
                <SelectInput
                  value={category}
                  onChange={setCategory}
                  options={DEFAULT_CATEGORIES.map(c => ({ label: c.name, value: c.name }))}
                />
              </Field>
            </div>

            <Field label="Description & Specifications">
              <Textarea value={description} onChange={setDescription} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Field label="Total Stock">
                <TextInput value={totalQty} onChange={setTotalQty} />
              </Field>
              <Field label="Available Now">
                <TextInput value={availableQty} onChange={setAvailableQty} />
              </Field>
              <Field label="Held (Repair/Clean)">
                <TextInput value={maintenanceQty} onChange={setMaintenanceQty} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Field label="Unit Cost ($)">
                <TextInput value={unitCost} onChange={setUnitCost} />
              </Field>
              <Field label="Purchase Date">
                <DateInput value={purchaseDate} onChange={setPurchaseDate} min="2000-01-01" />
              </Field>
              <Field label="Expiration Date">
                <DateInput value={expirationDate} onChange={setExpirationDate} min="2000-01-01" />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Condition">
                <SelectInput
                  value={condition}
                  onChange={v => setCondition(v as GearCondition)}
                  options={[
                    { label: 'Good', value: 'Good' },
                    { label: 'Minor wear', value: 'Minor wear' },
                    { label: 'Damaged', value: 'Damaged' },
                  ]}
                />
              </Field>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, paddingTop: 18 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={needsCleaning}
                    onChange={e => setNeedsCleaning(e.target.checked)}
                    style={{ width: 15, height: 15, accentColor: C.pine }}
                  />
                  Needs Cleaning
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={facultyOnly}
                    onChange={e => setFacultyOnly(e.target.checked)}
                    style={{ width: 15, height: 15, accentColor: C.pine }}
                  />
                  Faculty / Staff Only
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isHighRisk}
                    onChange={e => setIsHighRisk(e.target.checked)}
                    style={{ width: 15, height: 15, accentColor: C.pine }}
                  />
                  High-Risk Gear
                </label>
              </div>
            </div>
          </div>
        ) : (
          <section>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.ts, marginBottom: 10 }}>
              Item Identification & Acquisition Details
            </div>
            <div style={{ backgroundColor: C.sand, padding: 14, borderRadius: 8, marginBottom: 14, fontSize: 13, color: C.tp }}>
              <strong>Description:</strong> {item.description || '—'}
              {item.isSet && item.setItems && (
                <div style={{ marginTop: 6, color: C.pine }}>
                  <strong>Bundled Set Items:</strong> {item.setItems.join(' · ')}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: 13 }}>
              {[
                ['Gear / Set ID', item.id],
                ['Category', `${item.category} (${item.categoryId})`],
                ['Unit Cost', formatCurrency(item.unitCost)],
                ['Total Asset Value', formatCurrency((item.unitCost || 0) * item.totalQuantity)],
                ['Date Purchased', item.purchaseDate || 'Not recorded'],
                ['Expiration / Cert Date', item.expirationDate || 'N/A'],
                ['Stock Breakdown', `${item.availableQuantity} available / ${item.totalQuantity} total (${item.maintenanceCount} held)`],
                ['Condition & Cleaning', `${item.condition}${item.needsCleaning ? ' · Needs Cleaning' : ' · Clean'}`],
                ['Access Policy', item.facultyOnly ? 'Faculty / Staff Only' : 'All Users (Students, Staff, Faculty)'],
                ['Risk Classification', item.isHighRisk ? 'High-Risk Gear (Safety Check Required)' : 'Standard Gear'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ color: C.ts, fontSize: 11, marginBottom: 2 }}>{k}</div>
                  <div style={{ color: C.tp, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div style={{ borderTop: `1px solid ${C.border}` }} />

        {/* Reservations tied to this Item ID */}
        <section>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.ts, marginBottom: 8 }}>
            Reservations Tied to {item.id} ({itemReservations.length})
          </div>
          {itemReservations.length === 0 ? (
            <div style={{ fontSize: 13, color: C.td }}>No reservations recorded for this item ID yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {itemReservations.map(r => {
                const line = r.items.find(i => i.itemId === item.id);
                return (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: C.sand,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <strong style={{ color: C.tp }}>#{r.id}</strong> · {r.user.name} ({r.user.bNumber}) — Qty {line?.quantity ?? 1}
                      <div style={{ color: C.ts, fontSize: 11 }}>
                        Pickup {line?.dateNeeded} → Due {line?.returnDate}
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div style={{ borderTop: `1px solid ${C.border}` }} />

        {/* Lifecycle / Purchase & Maintenance History */}
        <section>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.ts, marginBottom: 8 }}>
            Gear Lifecycle & Audit History
          </div>
          {item.gearHistory && item.gearHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, backgroundColor: C.sand, padding: 12, borderRadius: 8 }}>
              {item.gearHistory.map((h, idx) => (
                <div key={idx} style={{ fontSize: 12, color: C.ts, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>
                    <strong style={{ color: C.tp }}>{h.event}</strong> (Qty: {h.amount})
                    {h.staffId && ` — Staff ${h.staffId}`}
                  </span>
                  <span style={{ color: C.td, whiteSpace: 'nowrap' }}>{h.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: C.td }}>No lifecycle history recorded yet.</div>
          )}
        </section>
      </div>
    </Modal>
  );
}

// ── Main Logistics Dashboard ─────────────────────────────────────────────────
export function LogisticsDashboard({
  staffUser,
  gearItems,
  setGearItems,
  reservations,
  showToast,
}: {
  staffUser: UserInfo;
  gearItems: GearItem[];
  setGearItems: (items: GearItem[]) => void;
  reservations: Reservation[];
  showToast: (msg: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGear, setSelectedGear] = useState<GearItem | null>(null);
  const [editMode, setEditMode] = useState(false);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(gearItems.map(i => i.category)));
    return ['All', ...unique];
  }, [gearItems]);

  const filtered = useMemo(() => {
    return gearItems.filter(item => {
      const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [gearItems, categoryFilter, search]);

  // Fleet KPIs
  const totalModels = gearItems.length;
  const totalUnits = gearItems.reduce((s, i) => s + i.totalQuantity, 0);
  const totalAvailable = gearItems.reduce((s, i) => s + i.availableQuantity, 0);
  const totalHeld = gearItems.reduce((s, i) => s + i.maintenanceCount, 0);
  const totalFleetValue = gearItems.reduce((s, i) => s + (i.unitCost || 0) * i.totalQuantity, 0);

  const handleAddGear = async (newItem: GearItem) => {
    try {
      const created = await createGearItemInDb(newItem, staffUser.bNumber);
      setGearItems([...gearItems, created]);
      showToast(`Added ${created.name} (${created.id}) to inventory.`);
    } catch {
      showToast('Failed to add gear item.');
    }
  };

  const handleUpdateGear = async (updated: GearItem) => {
    try {
      const saved = await updateGearItemInDb(updated, staffUser.bNumber);
      setGearItems(gearItems.map(g => (g.id === saved.id ? saved : g)));
      showToast(`Updated logistics for ${saved.id} (${saved.name}).`);
    } catch {
      showToast(`Failed to update ${updated.id}.`);
    }
  };

  const handleDeleteGear = async (item: GearItem) => {
    try {
      await deleteGearItemFromDb(item.id, staffUser.bNumber);
      setGearItems(gearItems.filter(g => g.id !== item.id));
      showToast(`Removed ${item.name} (${item.id}) from inventory.`);
    } catch {
      showToast(`Failed to remove ${item.id}.`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.tp, margin: 0, letterSpacing: '-0.01em' }}>
            Gear & Fleet Logistics (OAP Admin)
          </h2>
          <p style={{ fontSize: 13, color: C.ts, margin: '4px 0 0' }}>
            Track equipment IDs, descriptions, purchase dates, unit costs, lifecycle history, and maintenance status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search by Item ID, description, name…" />
          <Btn variant="primary" onClick={() => setShowAddModal(true)}>
            + Add Gear / Set
          </Btn>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          ['Gear Models / Sets', `${totalModels} item types`],
          ['Fleet Availability', `${totalAvailable} / ${totalUnits} units ready`],
          ['Total Fleet Value', formatCurrency(totalFleetValue)],
          ['Cleaning / Repair Hold', `${totalHeld} unit${totalHeld !== 1 ? 's' : ''}`],
        ].map(([label, val]) => (
          <Card key={label} style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: C.ts, fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.tp, marginTop: 4 }}>{val}</div>
          </Card>
        ))}
      </div>

      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: `1px solid ${categoryFilter === cat ? C.pine : C.border}`,
                backgroundColor: categoryFilter === cat ? C.pine : C.surface,
                color: categoryFilter === cat ? '#fff' : C.ts,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Logistics Table */}
      <Card style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '20px 0' }}>
            <EmptyState
              message={gearItems.length === 0 ? 'No equipment in inventory yet' : 'No matching gear items'}
              sub={
                gearItems.length === 0
                  ? 'Click "+ Add Gear / Set" in the top right to add equipment with its ID, description, purchase date, and unit cost.'
                  : 'Try searching by a different Item ID or keyword.'
              }
            />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: C.tableHd }}>
                  {['Item ID', 'Gear & Description', 'Category', 'Avail / Total', 'Unit Cost / Total', 'Purchased / Exp', 'Condition & Tags', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: i === 7 ? 'right' : 'left', fontSize: 12, fontWeight: 600, color: C.ts, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAFAF8')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: C.pine, whiteSpace: 'nowrap' }}>
                      {item.id}
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: 280 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 42, height: 32, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                          <GearIllustration type={item.illustrationType} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.tp }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: C.ts, marginTop: 2, lineHeight: 1.35 }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: C.ts, whiteSpace: 'nowrap' }}>
                      {item.category}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, color: item.availableQuantity > 0 ? C.tp : '#A33B2A' }}>
                        {item.availableQuantity}
                      </span>{' '}
                      <span style={{ color: C.ts }}>/ {item.totalQuantity}</span>
                      {item.maintenanceCount > 0 && (
                        <div style={{ fontSize: 11, color: '#B98A2E' }}>{item.maintenanceCount} held</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: C.tp }}>{formatCurrency(item.unitCost)}</div>
                      <div style={{ fontSize: 11, color: C.td }}>
                        Total: {formatCurrency((item.unitCost || 0) * item.totalQuantity)}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: C.ts, whiteSpace: 'nowrap' }}>
                      <div>Bought: {item.purchaseDate || '—'}</div>
                      {item.expirationDate && (
                        <div style={{ color: C.td }}>Exp: {item.expirationDate}</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontWeight: 500,
                          backgroundColor: item.condition === 'Damaged' ? '#F8E7E3' : item.condition === 'Minor wear' ? '#FBF3E0' : '#E8F0E8',
                          color: item.condition === 'Damaged' ? '#A33B2A' : item.condition === 'Minor wear' ? '#B98A2E' : C.pine,
                        }}>
                          {item.condition}
                        </span>
                        {item.needsCleaning && (
                          <span style={{ padding: '2px 8px', borderRadius: 999, backgroundColor: '#FBF3E0', color: '#B98A2E', fontWeight: 600 }}>
                            Needs Cleaning
                          </span>
                        )}
                        {item.facultyOnly && (
                          <span style={{ padding: '2px 8px', borderRadius: 999, backgroundColor: C.sage, color: C.ts }}>
                            Faculty Only
                          </span>
                        )}
                        {item.isHighRisk && (
                          <span style={{ padding: '2px 8px', borderRadius: 999, backgroundColor: '#F8E7E3', color: '#A33B2A' }}>
                            High-Risk
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                        <IconBtn onClick={() => { setSelectedGear(item); setEditMode(false); }} title="View Logistics & History">
                          <EyeIcon />
                        </IconBtn>
                        <IconBtn onClick={() => { setSelectedGear(item); setEditMode(true); }} title="Edit Logistics">
                          <EditIcon />
                        </IconBtn>
                        <IconBtn onClick={() => handleDeleteGear(item)} title="Remove Item">
                          <TrashIcon />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showAddModal && (
        <AddGearModal
          gearItems={gearItems}
          staffUser={staffUser}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddGear}
        />
      )}

      {selectedGear && (
        <ItemLogisticsModal
          item={selectedGear}
          reservations={reservations}
          staffUser={staffUser}
          editMode={editMode}
          onClose={() => setSelectedGear(null)}
          onSave={handleUpdateGear}
        />
      )}
    </div>
  );
}
