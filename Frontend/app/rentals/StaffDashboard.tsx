'use client';

import { useState } from 'react';
import type {
  UserInfo,
  GearItem,
  GearCondition,
  Reservation,
  ReservationStatus,
} from './types';
import {
  todayISO,
  updateReservationStatus,
  checkInReservation,
  updateReservationNotes,
  markGearReadyInDb,
} from './api';
import {
  C, Btn, IconBtn, SearchField, StatusBadge, EmptyState, Modal,
  Textarea, Field, AlertBanner, Card, EyeIcon, EditIcon,
} from '@/components/rentals/ui';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d?: string) {
  if (!d) return '—';
  const dt = new Date(`${d}T00:00:00`);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function summarizeFulfillment(
  items: { fulfillment: 'Pickup' | 'Delivery'; deliveryLocation?: string }[]
): string {
  if (!items.length) return 'Base Camp Pickup';
  const hasPickup = items.some(i => i.fulfillment === 'Pickup');
  const deliveries = items.filter(i => i.fulfillment === 'Delivery');
  if (deliveries.length === 0) return 'Base Camp Pickup';
  const uniqueLocs = Array.from(new Set(deliveries.map(d => d.deliveryLocation).filter(Boolean)));
  const locText = uniqueLocs.length > 0 ? `Delivery (${uniqueLocs.join(', ')})` : 'Campus Delivery';
  return hasPickup ? `Base Camp & ${locText}` : locText;
}

// ── Reservation detail / edit modal ──────────────────────────────────────────
function ReservationModal({
  res,
  onClose,
  onSave,
  editMode,
}: {
  res: Reservation;
  onClose: () => void;
  onSave: (updated: Reservation) => void;
  editMode: boolean;
}) {
  const [conditionNotes, setConditionNotes] = useState(res.conditionNotes);
  const [staffNotes, setStaffNotes] = useState(res.notes);

  const timeline: ReservationStatus[] = ['Pending', 'Approved', 'Checked Out', 'Returned'];
  const currentIdx = timeline.indexOf(res.status as ReservationStatus);

  const save = () => {
    onSave({ ...res, conditionNotes, notes: staffNotes });
    onClose();
  };

  return (
    <Modal
      title={`Reservation ${res.id}${editMode ? ' — Edit' : ''}`}
      onClose={onClose}
      footer={
        <>
          {editMode && <Btn variant="primary" onClick={save}>Save changes</Btn>}
          <Btn variant={editMode ? 'ghost' : 'secondary'} onClick={onClose}>Close</Btn>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Requester */}
        <section>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.ts, marginBottom: 10 }}>
            Requester & Ticket Metadata
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 13 }}>
            {[
              ['Name', res.user.name],
              ['B# / User ID', `${res.user.bNumber} (${res.userId})`],
              ['Email', res.user.email],
              ['Role', res.user.userType],
              ['Reservation Date', res.submittedAt],
              ['Processed By (Staff ID)', res.staffId || 'Unassigned'],
              ...(res.checkoutDate ? [['Checkout Date', res.checkoutDate]] : []),
              ...(res.checkinDate ? [['Check-In Date', res.checkinDate]] : []),
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ color: C.ts, fontSize: 11, marginBottom: 2 }}>{k}</div>
                <div style={{ color: C.tp, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ borderTop: `1px solid ${C.border}` }} />

        {/* Items */}
        <section>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.ts, marginBottom: 10 }}>
            Reserved Gear / Sets
          </div>
          {res.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: i < res.items.length - 1 ? `1px solid ${C.border}` : 'none', gap: 8 }}>
              <div>
                <span style={{ color: C.tp, fontWeight: 600 }}>{item.itemName}</span>
                <span style={{ color: C.td, fontSize: 11, marginLeft: 6 }}>({item.itemId})</span>
              </div>
              <div style={{ textAlign: 'right', color: C.ts }}>
                <span style={{ fontWeight: 600, color: C.tp }}>× {item.quantity}</span>
                <span style={{ marginLeft: 10 }}>{formatDate(item.dateNeeded)} → {formatDate(item.returnDate)}</span>
                <span style={{ marginLeft: 10, fontSize: 11, backgroundColor: C.sage, padding: '2px 8px', borderRadius: 999 }}>
                  {item.fulfillment}{item.deliveryLocation ? `: ${item.deliveryLocation}` : ''}
                </span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 13, color: C.ts }}>
            Fulfillment: <span style={{ fontWeight: 500, color: C.tp }}>{summarizeFulfillment(res.items)}</span>
          </div>
        </section>

        <div style={{ borderTop: `1px solid ${C.border}` }} />

        {/* Status timeline */}
        <section>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.ts, marginBottom: 12 }}>
            Ticket Status
          </div>
          {res.status === 'Denied' ? (
            <StatusBadge status="Denied" />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {timeline.map((s, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < timeline.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: done ? C.pine : C.surface, border: `2px solid ${done ? C.pine : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? '#fff' : C.td, fontSize: 11, fontWeight: 700 }}>
                        {done && i < currentIdx ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: 11, color: active ? C.pine : C.ts, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>{s}</span>
                    </div>
                    {i < timeline.length - 1 && (
                      <div style={{ flex: 1, height: 2, backgroundColor: i < currentIdx ? C.pine : C.border, margin: '0 4px', marginBottom: 16 }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* User notes */}
        {(res.notes || editMode) && (
          <>
            <div style={{ borderTop: `1px solid ${C.border}` }} />
            <section>
              <Field label="Reservation notes">
                {editMode ? (
                  <Textarea
                    value={staffNotes}
                    onChange={setStaffNotes}
                    placeholder="Additional reservation notes…"
                  />
                ) : (
                  <p style={{ fontSize: 14, color: C.tp, margin: 0, lineHeight: 1.5 }}>{res.notes}</p>
                )}
              </Field>
            </section>
          </>
        )}

        {/* Staff condition notes */}
        <div style={{ borderTop: `1px solid ${C.border}` }} />
        <section>
          <Field label="Condition & cleaning notes (OAP staff)">
            {editMode ? (
              <Textarea
                value={conditionNotes}
                onChange={setConditionNotes}
                placeholder="Note any damage, cleaning required, or wear on return…"
              />
            ) : (
              <p style={{ fontSize: 14, color: conditionNotes ? C.tp : C.td, margin: 0, fontStyle: conditionNotes ? 'normal' : 'italic' }}>
                {conditionNotes || 'No condition notes yet.'}
              </p>
            )}
          </Field>
        </section>

        {/* Edit History Log */}
        <div style={{ borderTop: `1px solid ${C.border}` }} />
        <section>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.ts, marginBottom: 8 }}>
            Edit History Log
          </div>
          {res.editHistory && res.editHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, backgroundColor: C.sand, padding: 12, borderRadius: 8 }}>
              {res.editHistory.map((h, i) => (
                <div key={i} style={{ fontSize: 12, color: C.ts, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>
                    <strong style={{ color: C.tp }}>{h.action}</strong> — by {h.staffName} ({h.staffId})
                  </span>
                  <span style={{ color: C.td, whiteSpace: 'nowrap' }}>{h.timestamp}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: C.td }}>No history entries recorded.</div>
          )}
        </section>
      </div>
    </Modal>
  );
}

// ── Check-in modal ─────────────────────────────────────────────────────────────
function CheckInModal({
  res,
  onClose,
  onConfirm,
}: {
  res: Reservation;
  onClose: () => void;
  onConfirm: (condition: GearCondition, needsCleaning: boolean, notes: string) => void;
}) {
  const [condition, setCondition] = useState<GearCondition | ''>('');
  const [needsCleaning, setNeedsCleaning] = useState(false);
  const [notes, setNotes] = useState('');
  const options: GearCondition[] = ['Good', 'Minor wear', 'Damaged'];

  return (
    <Modal
      title={`Check In Reservation #${res.id}`}
      onClose={onClose}
      footer={
        <>
          <Btn
            variant="primary"
            onClick={() => { if (condition) onConfirm(condition, needsCleaning, notes); }}
            disabled={!condition}
          >
            Confirm check in
          </Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <AlertBanner
          variant="info"
          title="Inspect returned equipment"
          body={`Returning: ${res.items.map(i => `${i.itemName} ×${i.quantity}`).join(', ')}. Items marked Damaged or Needs Cleaning are held out of available stock until cleared by OAP staff.`}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.tp, marginBottom: 10 }}>Item condition *</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {options.map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: C.tp }}>
                <input
                  type="radio"
                  name="condition"
                  value={opt}
                  checked={condition === opt}
                  onChange={() => setCondition(opt)}
                  style={{ accentColor: C.pine, width: 16, height: 16 }}
                />
                {opt}
                {opt === 'Damaged' && (
                  <span style={{ fontSize: 12, color: '#A33B2A' }}>(Holds units from availability for repair)</span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: C.tp, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={needsCleaning}
              onChange={e => setNeedsCleaning(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: C.pine, cursor: 'pointer' }}
            />
            Needs cleaning / sanitization before returning to available stock
          </label>
        </div>

        <Field label="Condition / inspection notes">
          <Textarea value={notes} onChange={setNotes} placeholder="Describe any damage, missing parts, cleaning needed, or notable wear…" />
        </Field>
      </div>
    </Modal>
  );
}

// ── Status tabs ──────────────────────────────────────────────────────────────
type TabFilter = ReservationStatus | 'All';
const TABS: TabFilter[] = ['Pending', 'Approved', 'Checked Out', 'Returned', 'Denied', 'All'];

function StatusTabs({
  active,
  counts,
  onChange,
}: {
  active: TabFilter;
  counts: Record<string, number>;
  onChange: (t: TabFilter) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {TABS.map(tab => {
        const count = tab === 'All' ? counts.__all : counts[tab] ?? 0;
        const sel = active === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: `1px solid ${sel ? C.pine : C.border}`,
              backgroundColor: sel ? C.pine : C.surface,
              color: sel ? '#fff' : C.ts,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
          >
            {tab}
            {count > 0 && (
              <span style={{
                backgroundColor: sel ? 'rgba(255,255,255,0.25)' : C.sage,
                color: sel ? '#fff' : C.ts,
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 999,
                padding: '1px 6px',
                minWidth: 20,
                textAlign: 'center',
              }}>
                {String(count).padStart(2, '0')}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
interface Props {
  staffUser: UserInfo;
  gearItems: GearItem[];
  setGearItems: (items: GearItem[]) => void;
  reservations: Reservation[];
  setReservations: (r: Reservation[]) => void;
  showToast: (msg: string) => void;
}

export function StaffDashboard({
  staffUser,
  gearItems,
  setGearItems,
  reservations,
  setReservations,
  showToast,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabFilter>('Pending');
  const [search, setSearch] = useState('');
  const [viewRes, setViewRes] = useState<Reservation | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [checkInRes, setCheckInRes] = useState<Reservation | null>(null);

  const flaggedGear = gearItems.filter(g => g.maintenanceCount > 0 || g.needsCleaning || g.condition === 'Damaged');

  const handleMarkGearReady = async (gear: GearItem) => {
    try {
      await markGearReadyInDb(gear.id, staffUser.bNumber);
      setGearItems(
        gearItems.map(item =>
          item.id === gear.id
            ? {
                ...item,
                condition: 'Good',
                needsCleaning: false,
                availableQuantity: Math.min(item.totalQuantity, item.availableQuantity + item.maintenanceCount),
                maintenanceCount: 0,
              }
            : item
        )
      );
      showToast(`${gear.name} marked cleaned/repaired and restored to available stock.`);
    } catch {
      showToast(`Failed to update ${gear.name}.`);
    }
  };

  const handleSaveNotes = async (updated: Reservation) => {
    try {
      const result = await updateReservationNotes(
        updated.id,
        updated.notes,
        updated.conditionNotes,
        staffUser.bNumber,
        staffUser.fullName
      );
      setReservations(
        reservations.map(r =>
          r.id === updated.id
            ? {
                ...r,
                staffId: staffUser.bNumber,
                notes: result.notes ?? updated.notes,
                conditionNotes: result.conditionNotes ?? updated.conditionNotes,
                editHistory: [...(r.editHistory || []), result.historyEntry],
              }
            : r
        )
      );
      showToast(`Reservation ${updated.id} saved.`);
    } catch {
      showToast(`Failed to save reservation ${updated.id}.`);
    }
  };

  const handleStatusChange = async (resObj: Reservation, status: ReservationStatus) => {
    try {
      const result = await updateReservationStatus(
        resObj.id,
        status,
        staffUser.bNumber,
        staffUser.fullName
      );

      // Subtract inventory on Check Out
      if (status === 'Checked Out') {
        const qtyByItem: Record<string, number> = {};
        resObj.items.forEach(i => {
          qtyByItem[i.itemId] = (qtyByItem[i.itemId] ?? 0) + i.quantity;
        });
        setGearItems(
          gearItems.map(g =>
            qtyByItem[g.id]
              ? { ...g, availableQuantity: Math.max(0, g.availableQuantity - qtyByItem[g.id]) }
              : g
          )
        );
      }

      setReservations(
        reservations.map(r =>
          r.id === resObj.id
            ? {
                ...r,
                status: result.status ?? status,
                staffId: staffUser.bNumber,
                checkoutDate: result.checkoutDate ?? r.checkoutDate,
                editHistory: [...(r.editHistory || []), result.historyEntry],
              }
            : r
        )
      );
      showToast(`Reservation ${resObj.id} marked as ${status}.`);
    } catch {
      showToast(`Failed to update status for ${resObj.id}.`);
    }
  };

  const handleCheckIn = async (
    resObj: Reservation,
    condition: GearCondition,
    needsCleaning: boolean,
    notes: string
  ) => {
    try {
      const result = await checkInReservation(
        resObj.id,
        condition,
        needsCleaning,
        notes,
        staffUser.bNumber,
        staffUser.fullName
      );

      const holdFromStock = condition === 'Damaged' || needsCleaning;
      const qtyByItem: Record<string, number> = {};
      resObj.items.forEach(i => {
        qtyByItem[i.itemId] = (qtyByItem[i.itemId] ?? 0) + i.quantity;
      });

      setGearItems(
        gearItems.map(g => {
          const returnedQty = qtyByItem[g.id];
          if (!returnedQty) return g;
          if (holdFromStock) {
            return {
              ...g,
              condition: condition === 'Damaged' ? 'Damaged' : g.condition,
              needsCleaning: g.needsCleaning || needsCleaning,
              maintenanceCount: g.maintenanceCount + returnedQty,
            };
          }
          return {
            ...g,
            availableQuantity: Math.min(g.totalQuantity, g.availableQuantity + returnedQty),
          };
        })
      );

      setReservations(
        reservations.map(r =>
          r.id === resObj.id
            ? {
                ...r,
                status: result.status ?? 'Returned',
                staffId: staffUser.bNumber,
                checkinDate: result.checkinDate,
                returnCondition: result.returnCondition,
                needsCleaning: result.needsCleaning,
                conditionNotes: result.conditionNotes,
                editHistory: [...(r.editHistory || []), result.historyEntry],
              }
            : r
        )
      );
      setCheckInRes(null);
      showToast(
        holdFromStock
          ? `Reservation ${resObj.id} checked in and added to OAP cleaning/repair queue.`
          : `Reservation ${resObj.id} checked in and returned to available stock.`
      );
    } catch {
      showToast(`Failed to check in reservation ${resObj.id}.`);
    }
  };

  // Counts for tabs
  const counts = reservations.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    acc.__all = (acc.__all ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filtered rows
  const filtered = reservations.filter(r => {
    const matchTab = activeTab === 'All' || r.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !search || (
      r.user.name.toLowerCase().includes(q) ||
      r.user.bNumber.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.items.some(i => i.itemName.toLowerCase().includes(q))
    );
    return matchTab && matchSearch;
  });

  const itemSummary = (items: Reservation['items']) => {
    if (!items.length) return '—';
    const first = `${items[0].itemName} (${items[0].quantity})`;
    if (items.length === 1) return first;
    if (items.length === 2) return `${first}, ${items[1].itemName} (${items[1].quantity})`;
    return `${first}, ${items[1].itemName} (${items[1].quantity}), +${items.length - 2} more`;
  };

  const openView = (r: Reservation, edit = false) => {
    setViewRes(r);
    setEditMode(edit);
  };

  const today = todayISO();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.tp, margin: 0, letterSpacing: '-0.01em' }}>
            Manage Reservations (OAP Admin)
          </h2>
          <p style={{ fontSize: 13, color: C.ts, margin: '4px 0 0' }}>
            Signed in as OAP Staff: <strong>{staffUser.fullName}</strong> ({staffUser.bNumber})
          </p>
        </div>
        <SearchField value={search} onChange={setSearch} placeholder="Search by name, B#, Item, Res ID…" />
      </div>

      {/* OAP Cleaning & Damage Maintenance Queue */}
      {flaggedGear.length > 0 && (
        <Card style={{ padding: 18, marginBottom: 24, backgroundColor: '#FBF3E0', borderColor: '#E5CFA0' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.tp, marginBottom: 8 }}>
            OAP Cleaning & Damage Hold Queue ({flaggedGear.length} item type{flaggedGear.length !== 1 ? 's' : ''})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {flaggedGear.map(g => (
              <div
                key={g.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: C.surface,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ fontSize: 13 }}>
                  <strong style={{ color: C.tp }}>{g.name}</strong> ({g.id}) —{' '}
                  <span style={{ color: '#A33B2A', fontWeight: 600 }}>
                    {g.maintenanceCount} unit{g.maintenanceCount !== 1 ? 's' : ''} held
                  </span>{' '}
                  <span style={{ color: C.ts }}>
                    ({[g.condition === 'Damaged' ? 'Damaged' : null, g.needsCleaning ? 'Needs Cleaning' : null].filter(Boolean).join(' · ') || 'Inspection Hold'})
                  </span>
                </div>
                <Btn variant="primary" size="sm" onClick={() => handleMarkGearReady(g)}>
                  Mark Cleaned & Restore to Stock
                </Btn>
              </div>
            ))}
          </div>
        </Card>
      )}

      <StatusTabs active={activeTab} counts={counts} onChange={setActiveTab} />

      <Card style={{ marginTop: 20, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <EmptyState message={`No ${activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}reservations`} sub={search ? 'Try adjusting your search' : 'Nothing here yet'} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: C.tableHd }}>
                  {['Reservation #', 'User', 'Gear / Set(s)', 'Pickup → Due', 'Fulfillment', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: i === 6 ? 'right' : 'left', fontSize: 12, fontWeight: 600, color: C.ts, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const pickup = r.items[0]?.dateNeeded;
                  const due = r.items[0]?.returnDate;
                  const isOverdue = r.status === 'Checked Out' && due && due < today;

                  return (
                    <tr
                      key={r.id}
                      style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAFAF8')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: C.tp, whiteSpace: 'nowrap' }}>{r.id}</td>
                      <td style={{ padding: '14px 16px', minWidth: 140 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: C.tp }}>{r.user.name}</div>
                        <div style={{ fontSize: 12, color: C.td, marginTop: 1 }}>
                          {r.user.bNumber} · {r.user.userType}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: C.ts, maxWidth: 200 }}>
                        <div style={{ lineHeight: 1.4 }}>{itemSummary(r.items)}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: C.ts, whiteSpace: 'nowrap' }}>
                        <div>{formatDate(pickup)} → {formatDate(due)}</div>
                        {isOverdue && (
                          <span style={{ fontSize: 11, color: '#A33B2A', fontWeight: 700 }}>OVERDUE</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: C.ts }}>
                        {summarizeFulfillment(r.items)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={r.status} />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                          {r.status === 'Pending' && (
                            <>
                              <Btn variant="primary" size="sm" onClick={() => handleStatusChange(r, 'Approved')}>Approve</Btn>
                              <Btn variant="destructive" size="sm" onClick={() => handleStatusChange(r, 'Denied')}>Deny</Btn>
                            </>
                          )}
                          {r.status === 'Approved' && (
                            <Btn variant="primary" size="sm" onClick={() => handleStatusChange(r, 'Checked Out')}>Check Out</Btn>
                          )}
                          {r.status === 'Checked Out' && (
                            <Btn variant="primary" size="sm" onClick={() => setCheckInRes(r)}>Check In</Btn>
                          )}
                          <IconBtn onClick={() => openView(r, false)} title="View"><EyeIcon /></IconBtn>
                          <IconBtn onClick={() => openView(r, true)} title="Edit"><EditIcon /></IconBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View/Edit modal */}
      {viewRes && (
        <ReservationModal
          res={viewRes}
          onClose={() => setViewRes(null)}
          onSave={handleSaveNotes}
          editMode={editMode}
        />
      )}

      {/* Check-in modal */}
      {checkInRes && (
        <CheckInModal
          res={checkInRes}
          onClose={() => setCheckInRes(null)}
          onConfirm={(condition, needsCleaning, notes) =>
            handleCheckIn(checkInRes, condition, needsCleaning, notes)
          }
        />
      )}
    </div>
  );
}
