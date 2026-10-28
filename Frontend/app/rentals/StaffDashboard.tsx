'use client';

import { useState } from 'react';
import type { Reservation, ReservationStatus } from './types';
import {
  updateReservationStatus,
  checkInReservation,
  updateReservationNotes,
} from './api';
import {
  C, Btn, IconBtn, SearchField, StatusBadge, EmptyState, Modal,
  Textarea, Field, AlertBanner, Card, EyeIcon, EditIcon,
} from '@/components/rentals/ui';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d: string) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.ts, marginBottom: 10 }}>Requester</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 14 }}>
            {[['Name', res.user.name], ['B#', res.user.bNumber], ['Email', res.user.email], ['Role', res.user.userType]].map(([k, v]) => (
              <div key={k}>
                <div style={{ color: C.ts, fontSize: 12, marginBottom: 2 }}>{k}</div>
                <div style={{ color: C.tp, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ borderTop: `1px solid ${C.border}` }} />

        {/* Items */}
        <section>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.ts, marginBottom: 10 }}>Items</div>
          {res.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '6px 0', borderBottom: i < res.items.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <span style={{ color: C.tp, fontWeight: 500 }}>{item.itemName}</span>
              <div style={{ textAlign: 'right', color: C.ts }}>
                <span>× {item.quantity}</span>
                <span style={{ marginLeft: 12 }}>{formatDate(item.dateNeeded)}</span>
                <span style={{ marginLeft: 12, fontSize: 12, backgroundColor: C.sage, padding: '2px 8px', borderRadius: 999 }}>{item.fulfillment}</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 13, color: C.ts }}>
            Pickup location: <span style={{ fontWeight: 500, color: C.tp }}>Base Camp</span>
          </div>
        </section>

        <div style={{ borderTop: `1px solid ${C.border}` }} />

        {/* Status timeline */}
        <section>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.ts, marginBottom: 12 }}>Status</div>
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
        </section>

        {/* User notes */}
        {(res.notes || editMode) && (
          <>
            <div style={{ borderTop: `1px solid ${C.border}` }} />
            <section>
              <Field label="User notes">
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
          <Field label="Condition notes (staff only)">
            {editMode ? (
              <Textarea
                value={conditionNotes}
                onChange={setConditionNotes}
                placeholder="Note any damage or wear on return…"
              />
            ) : (
              <p style={{ fontSize: 14, color: conditionNotes ? C.tp : C.td, margin: 0, fontStyle: conditionNotes ? 'normal' : 'italic' }}>
                {conditionNotes || 'No condition notes yet.'}
              </p>
            )}
          </Field>
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
  onConfirm: (condition: string, notes: string) => void;
}) {
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const options = ['Good', 'Minor wear', 'Damaged'];

  return (
    <Modal
      title="Confirm check in"
      onClose={onClose}
      footer={
        <>
          <Btn variant="primary" onClick={() => { if (condition) onConfirm(condition, notes); }} disabled={!condition}>Confirm check in</Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <AlertBanner variant="info" title="Record item condition" body={`Returning: ${res.items.map(i => `${i.itemName} ×${i.quantity}`).join(', ')}`} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.tp, marginBottom: 10 }}>Item condition</div>
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
              </label>
            ))}
          </div>
        </div>
        <Field label="Condition notes">
          <Textarea value={notes} onChange={setNotes} placeholder="Describe any damage, missing parts, or notable wear…" />
        </Field>
      </div>
    </Modal>
  );
}

// ── Status tabs ──────────────────────────────────────────────────────────────
type TabFilter = ReservationStatus | 'All';
const TABS: TabFilter[] = ['Pending', 'Approved', 'Checked Out', 'Returned', 'All'];

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
  reservations: Reservation[];
  setReservations: (r: Reservation[]) => void;
  showToast: (msg: string) => void;
}

export function StaffDashboard({ reservations, setReservations, showToast }: Props) {
  const [activeTab, setActiveTab] = useState<TabFilter>('Pending');
  const [search, setSearch] = useState('');
  const [viewRes, setViewRes] = useState<Reservation | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [checkInRes, setCheckInRes] = useState<Reservation | null>(null);

  const handleSaveNotes = async (updated: Reservation) => {
    try {
      const result = await updateReservationNotes(updated.id, updated.notes, updated.conditionNotes);
      setReservations(
        reservations.map(r =>
          r.id === updated.id
            ? { ...r, notes: result.notes ?? updated.notes, conditionNotes: result.conditionNotes ?? updated.conditionNotes }
            : r
        )
      );
      showToast(`Reservation ${updated.id} saved.`);
    } catch {
      showToast(`Failed to save reservation ${updated.id}.`);
    }
  };

  const handleStatusChange = async (id: string, status: ReservationStatus) => {
    try {
      const result = await updateReservationStatus(id, status);
      setReservations(reservations.map(r => r.id === id ? { ...r, status: result.status ?? status } : r));
      showToast(`Reservation ${id} marked as ${status}.`);
    } catch {
      showToast(`Failed to update status for ${id}.`);
    }
  };

  const handleCheckIn = async (id: string, condition: string, notes: string) => {
    try {
      const result = await checkInReservation(id, condition, notes);
      setReservations(
        reservations.map(r =>
          r.id === id
            ? { ...r, status: result.status ?? 'Returned', conditionNotes: result.conditionNotes }
            : r
        )
      );
      setCheckInRes(null);
      showToast(`Reservation ${id} checked in successfully.`);
    } catch {
      showToast(`Failed to check in reservation ${id}.`);
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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.tp, margin: 0, letterSpacing: '-0.01em' }}>Manage Reservations</h2>
        <SearchField value={search} onChange={setSearch} placeholder="Search by name, Item, Res ID…" />
      </div>

      <StatusTabs active={activeTab} counts={counts} onChange={setActiveTab} />

      <Card style={{ marginTop: 20, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <EmptyState message={`No ${activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}reservations`} sub={search ? 'Try adjusting your search' : 'Nothing here yet'} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: C.tableHd }}>
                  {['Reservation #', 'User', 'Item(s)', 'Pickup date', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: i === 5 ? 'right' : 'left', fontSize: 12, fontWeight: 600, color: C.ts, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr
                    key={r.id}
                    style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAFAF8')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: C.tp, whiteSpace: 'nowrap' }}>{r.id}</td>
                    <td style={{ padding: '14px 16px', minWidth: 140 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.tp }}>{r.user.name}</div>
                      <div style={{ fontSize: 12, color: C.td, marginTop: 1 }}>{r.user.bNumber}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: C.ts, maxWidth: 200 }}>
                      <div style={{ lineHeight: 1.4 }}>{itemSummary(r.items)}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: C.ts, whiteSpace: 'nowrap' }}>
                      {formatDate(r.items[0]?.dateNeeded)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={r.status} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                        {r.status === 'Pending' && (
                          <>
                            <Btn variant="primary" size="sm" onClick={() => handleStatusChange(r.id, 'Approved')}>Approve</Btn>
                            <Btn variant="destructive" size="sm" onClick={() => handleStatusChange(r.id, 'Declined')}>Decline</Btn>
                          </>
                        )}
                        {r.status === 'Approved' && (
                          <Btn variant="primary" size="sm" onClick={() => handleStatusChange(r.id, 'Checked Out')}>Check Out</Btn>
                        )}
                        {r.status === 'Checked Out' && (
                          <Btn variant="primary" size="sm" onClick={() => setCheckInRes(r)}>Check In</Btn>
                        )}
                        <IconBtn onClick={() => openView(r, false)} title="View"><EyeIcon /></IconBtn>
                        <IconBtn onClick={() => openView(r, true)} title="Edit"><EditIcon /></IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
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
          onConfirm={(condition, notes) => handleCheckIn(checkInRes.id, condition, notes)}
        />
      )}
    </div>
  );
}
