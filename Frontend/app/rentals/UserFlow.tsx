'use client';

import { useState, useMemo } from 'react';
import type { UserInfo, CartItem, Reservation, GearItem } from './types';
import {
  addDays,
  todayISO,
  getNextReservationId,
  createReservation,
  updateReservationStatus,
} from './api';
import { GearIllustration } from '@/components/rentals/illustrations';
import {
  C, Btn, Field, TextInput, SelectInput, DateInput, Textarea, SearchField,
  Stepper, AlertBanner, Card, StatusBadge, EmptyState, XIcon, TrashIcon,
} from '@/components/rentals/ui';

// ── Props ────────────────────────────────────────────────────────────────────
interface UserFlowProps {
  gearItems: GearItem[];
  userScreen: number;
  setUserScreen: (n: number) => void;
  userInfo: UserInfo;
  setUserInfo: (u: UserInfo) => void;
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  reservations: Reservation[];
  setReservations: (r: Reservation[]) => void;
  nextResNum: number;
  setNextResNum: (n: number) => void;
  showToast: (msg: string) => void;
}

function isStaffOrFacultyRole(role: UserInfo['userType']): boolean {
  return role === 'staff' || role === 'faculty/staff' || role === 'OAP';
}

function summarizeFulfillment(
  items: { fulfillment: 'Pickup' | 'Delivery'; deliveryLocation?: string }[]
): string {
  if (!items.length) return 'Base Camp';
  const hasPickup = items.some(i => i.fulfillment === 'Pickup');
  const deliveries = items.filter(i => i.fulfillment === 'Delivery');
  if (deliveries.length === 0) return 'Base Camp Pickup';
  const uniqueLocs = Array.from(new Set(deliveries.map(d => d.deliveryLocation).filter(Boolean)));
  const locText = uniqueLocs.length > 0 ? `Delivery (${uniqueLocs.join(', ')})` : 'Campus Delivery';
  return hasPickup ? `Base Camp & ${locText}` : locText;
}

// ── Item card ────────────────────────────────────────────────────────────────
function ItemCard({
  item,
  inCartQty,
  userInfo,
  onReserve,
}: {
  item: GearItem;
  inCartQty: number;
  userInfo: UserInfo;
  onReserve: (item: GearItem) => void;
}) {
  const netAvailable = Math.max(0, item.availableQuantity - inCartQty);
  const canAccessFacultyGear = isStaffOrFacultyRole(userInfo.userType);
  const lockedForStudent = item.facultyOnly && !canAccessFacultyGear;
  const canDeliver = isStaffOrFacultyRole(userInfo.userType);

  return (
    <Card style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <GearIllustration type={item.illustrationType} />
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: C.tp }}>{item.name}</h3>
          <span style={{ fontSize: 11, backgroundColor: C.sage, color: C.ts, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {item.category}
          </span>
        </div>

        <p style={{ fontSize: 12, color: C.ts, margin: 0, lineHeight: 1.4 }}>{item.description}</p>

        {item.isSet && item.setItems && (
          <div style={{ fontSize: 11, color: C.pine, backgroundColor: '#E8F0E8', padding: '4px 8px', borderRadius: 6 }}>
            <strong>Set includes:</strong> {item.setItems.join(' · ')}
          </div>
        )}

        <div style={{ fontSize: 13, fontWeight: 500, color: netAvailable > 0 ? C.moss : '#A33B2A', margin: '2px 0 0' }}>
          {netAvailable} of {item.totalQuantity} available
          {inCartQty > 0 && <span style={{ color: C.pine, fontSize: 12 }}> ({inCartQty} in cart)</span>}
          {item.maintenanceCount > 0 && (
            <span style={{ color: '#B98A2E', fontSize: 11, display: 'block' }}>
              {item.maintenanceCount} unit{item.maintenanceCount !== 1 ? 's' : ''} in OAP cleaning/repair
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
          {item.facultyOnly && (
            <span style={{ fontSize: 11, backgroundColor: '#FBF3E0', color: '#B98A2E', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
              Faculty / Staff Only
            </span>
          )}
          {item.isHighRisk && (
            <span style={{ fontSize: 11, backgroundColor: '#F8E7E3', color: '#A33B2A', padding: '2px 8px', borderRadius: 999, fontWeight: 500 }}>
              High-Risk Gear
            </span>
          )}
          {canDeliver && (
            <span style={{ fontSize: 11, backgroundColor: '#E4EEF5', color: '#2D5C7A', padding: '2px 8px', borderRadius: 999 }}>
              Staff Delivery Eligible
            </span>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 10 }}>
          <Btn
            variant="primary"
            size="sm"
            onClick={() => onReserve(item)}
            disabled={netAvailable === 0 || lockedForStudent}
          >
            {lockedForStudent
              ? 'Faculty / Staff Only'
              : netAvailable === 0
              ? 'Unavailable'
              : 'Reserve'}
          </Btn>
        </div>
      </div>
    </Card>
  );
}

// ── My Reservations View ──────────────────────────────────────────────────────
function MyReservationsView({
  userInfo,
  reservations,
  onCancelReservation,
  onBackToCatalog,
}: {
  userInfo: UserInfo;
  reservations: Reservation[];
  onCancelReservation: (id: string) => void;
  onBackToCatalog: () => void;
}) {
  const myReservations = reservations.filter(
    r => r.user.bNumber.toUpperCase() === userInfo.bNumber.toUpperCase()
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.tp, margin: 0 }}>My Reservations</h2>
          <p style={{ fontSize: 13, color: C.ts, margin: '4px 0 0' }}>
            Showing reservations for {userInfo.fullName} ({userInfo.bNumber})
          </p>
        </div>
        <Btn variant="secondary" onClick={onBackToCatalog}>Back to Catalog</Btn>
      </div>

      {myReservations.length === 0 ? (
        <Card>
          <EmptyState
            message="You have no reservations yet"
            sub="Browse the equipment catalog to submit your first gear reservation."
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {myReservations.map(r => (
            <Card key={r.id} style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.tp }}>Reservation #{r.id}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div style={{ fontSize: 13, color: C.ts }}>
                    Submitted {r.submittedAt} · {summarizeFulfillment(r.items)}
                  </div>
                </div>
                {r.status === 'Pending' && (
                  <Btn variant="destructive" size="sm" onClick={() => onCancelReservation(r.id)}>
                    Cancel Pending Request
                  </Btn>
                )}
              </div>

              <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                {r.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: C.tp }}>
                    <span>
                      <strong>{item.itemName}</strong> × {item.quantity}
                    </span>
                    <span style={{ color: C.ts }}>
                      Pickup: {item.dateNeeded} → Due: {item.returnDate} ({item.fulfillment})
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Screen 2: Item Catalog ─────────────────────────────────────────────────
function Screen2({
  gearItems,
  cart,
  userInfo,
  myReservationCount,
  onOpenMyReservations,
  onReserveItem,
  onGoToCart,
}: {
  gearItems: GearItem[];
  cart: CartItem[];
  userInfo: UserInfo;
  myReservationCount: number;
  onOpenMyReservations: () => void;
  onReserveItem: (item: GearItem) => void;
  onGoToCart: () => void;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(gearItems.map(i => i.category)));
    return ['All', ...unique];
  }, [gearItems]);

  const inCartByItem = useMemo(() => {
    return cart.reduce((acc, c) => {
      acc[c.itemId] = (acc[c.itemId] ?? 0) + c.quantity;
      return acc;
    }, {} as Record<string, number>);
  }, [cart]);

  const filtered = gearItems.filter(item => {
    const matchCat = category === 'All' || item.category === category;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div>
      <Stepper step={2} />
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.tp, margin: 0, letterSpacing: '-0.01em' }}>
              Browse equipment.
            </h2>
            <p style={{ fontSize: 13, color: C.ts, margin: '4px 0 0' }}>
              Standard rental period is 2 weeks (14 days) by default, or shorter if needed.
              {isStaffOrFacultyRole(userInfo.userType)
                ? ' As Staff/Faculty, Campus Delivery and Faculty-Only items are unlocked.'
                : ' Student reservations are picked up at Base Camp.'}
            </p>
          </div>
          <Btn variant="secondary" size="sm" onClick={onOpenMyReservations}>
            My Reservations ({myReservationCount})
          </Btn>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search gear, sets, or description…" />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: `1px solid ${category === cat ? C.pine : C.border}`,
                  backgroundColor: category === cat ? C.pine : C.surface,
                  color: category === cat ? '#fff' : C.ts,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: C.ts }}>
          <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.3 }}>⊘</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>No items found</div>
          <div style={{ fontSize: 13, color: C.td, marginTop: 4 }}>Try adjusting your search or category filter</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              inCartQty={inCartByItem[item.id] ?? 0}
              userInfo={userInfo}
              onReserve={onReserveItem}
            />
          ))}
        </div>
      )}

      {/* Cart pill */}
      {cart.length > 0 && (
        <button
          className="slide-up"
          onClick={onGoToCart}
          style={{
            position: 'fixed', bottom: 32, right: 32,
            backgroundColor: C.pine, color: '#fff',
            border: 'none', borderRadius: 999, padding: '12px 22px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(47,93,63,0.35)',
            display: 'flex', alignItems: 'center', gap: 8,
            zIndex: 40, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.pineHov)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.pine)}
        >
          <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
            {cart.reduce((s, i) => s + i.quantity, 0)}
          </span>
          Review & confirm ({cart.length} item{cart.length !== 1 ? 's' : ''}) →
        </button>
      )}
    </div>
  );
}

// ── Screen 3: Reserve Equipment (Add Item) ────────────────────────────────────
function Screen3({
  gearItems,
  cart,
  setCart,
  userInfo,
  preselectedItem,
  onBack,
  onGoToConfirm,
  showToast,
}: {
  gearItems: GearItem[];
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  userInfo: UserInfo;
  preselectedItem: GearItem | null;
  onBack: () => void;
  onGoToConfirm: () => void;
  showToast: (m: string) => void;
}) {
  const defaultPickup = todayISO();
  const [selectedItemId, setSelectedItemId] = useState(preselectedItem?.id ?? '');
  const [quantity, setQuantity] = useState('1');
  const [dateNeeded, setDateNeeded] = useState(defaultPickup);
  const [returnDate, setReturnDate] = useState(addDays(defaultPickup, 14));
  const [delivery, setDelivery] = useState(false);
  const [location, setLocation] = useState('');
  const [ackHighRisk, setAckHighRisk] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const staffOrFaculty = isStaffOrFacultyRole(userInfo.userType);

  // Eligible catalog items for this user role
  const selectableItems = useMemo(() => {
    return gearItems.filter(i => !i.facultyOnly || staffOrFaculty);
  }, [gearItems, staffOrFaculty]);

  const inCartQtyForSelected = useMemo(() => {
    return cart
      .filter(c => c.itemId === selectedItemId)
      .reduce((sum, c) => sum + c.quantity, 0);
  }, [cart, selectedItemId]);

  const selectedItem = gearItems.find(i => i.id === selectedItemId) ?? null;
  const netAvailable = selectedItem
    ? Math.max(0, selectedItem.availableQuantity - inCartQtyForSelected)
    : 0;
  const maxQty = Math.min(netAvailable, 10);
  const maxReturnDate = dateNeeded ? addDays(dateNeeded, 14) : undefined;

  const handlePickupDateChange = (newPickup: string) => {
    setDateNeeded(newPickup);
    if (newPickup) {
      // Default to 2 weeks (+14 days) whenever pickup date changes
      setReturnDate(addDays(newPickup, 14));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedItemId) e.item = 'Please select an item';
    if (selectedItem && netAvailable <= 0) {
      e.item = 'All available units of this item are already in your reservation cart';
    }
    if (!dateNeeded) e.dateNeeded = 'Please select a pickup date';
    if (!returnDate) {
      e.returnDate = 'Please select a return date';
    } else if (dateNeeded && returnDate < dateNeeded) {
      e.returnDate = 'Return date cannot be before pickup date';
    } else if (maxReturnDate && returnDate > maxReturnDate) {
      e.returnDate = 'Maximum rental period is 2 weeks (14 days)';
    }
    if (delivery && !staffOrFaculty) {
      e.location = 'Delivery is available for Staff and Faculty only';
    }
    if (delivery && !location.trim()) {
      e.location = 'Campus building and room number are required for delivery';
    }
    if (selectedItem?.isHighRisk && !ackHighRisk) {
      e.highRisk = 'Please acknowledge safety guidelines for high-risk gear';
    }
    return e;
  };

  const addToCart = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const item = gearItems.find(i => i.id === selectedItemId)!;
    const qtyNum = parseInt(quantity, 10);
    const fulfillment = delivery && staffOrFaculty ? 'Delivery' : 'Pickup';
    const deliveryLoc = fulfillment === 'Delivery' ? location.trim() : undefined;

    // Merge if identical item + dates + fulfillment already exists in cart
    const existingIdx = cart.findIndex(
      c =>
        c.itemId === selectedItemId &&
        c.dateNeeded === dateNeeded &&
        c.returnDate === returnDate &&
        c.fulfillment === fulfillment &&
        c.deliveryLocation === deliveryLoc
    );

    if (existingIdx >= 0) {
      const updated = [...cart];
      updated[existingIdx] = {
        ...updated[existingIdx],
        quantity: updated[existingIdx].quantity + qtyNum,
      };
      setCart(updated);
    } else {
      const newItem: CartItem = {
        cartId: `cart-${Date.now()}`,
        itemId: selectedItemId,
        itemName: item.name,
        isSet: item.isSet,
        quantity: qtyNum,
        dateNeeded,
        returnDate,
        fulfillment,
        deliveryLocation: deliveryLoc,
      };
      setCart([...cart, newItem]);
    }

    showToast(`${item.name} (×${qtyNum}) added to your reservation.`);
    setQuantity('1');
    setAckHighRisk(false);
    setErrors({});
  };

  const removeFromCart = (cartId: string) => setCart(cart.filter(c => c.cartId !== cartId));

  const qtyOptions = Array.from({ length: Math.max(1, maxQty) }, (_, i) => ({
    label: String(i + 1),
    value: String(i + 1),
  }));

  return (
    <div>
      <Stepper step={2} />
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Card style={{ padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.tp, margin: '0 0 24px', letterSpacing: '-0.01em' }}>
            Add an item to reservation
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Field label="Select item" error={errors.item}>
              <SelectInput
                value={selectedItemId}
                onChange={v => {
                  setSelectedItemId(v);
                  setQuantity('1');
                  setAckHighRisk(false);
                  setErrors({});
                }}
                placeholder="Choose equipment or set…"
                options={selectableItems.map(i => {
                  const inCart = cart.filter(c => c.itemId === i.id).reduce((s, c) => s + c.quantity, 0);
                  const rem = Math.max(0, i.availableQuantity - inCart);
                  return {
                    label: `${i.name}${i.facultyOnly ? ' [Faculty/Staff]' : ''} (${rem} available)`,
                    value: i.id,
                  };
                })}
              />
            </Field>

            {selectedItem && (
              <div style={{ fontSize: 12, color: C.ts, backgroundColor: C.sand, padding: '10px 12px', borderRadius: 8 }}>
                <div><strong>Description:</strong> {selectedItem.description}</div>
                {selectedItem.isSet && selectedItem.setItems && (
                  <div style={{ marginTop: 4 }}><strong>Included in Set:</strong> {selectedItem.setItems.join(', ')}</div>
                )}
                {selectedItem.expirationDate && (
                  <div style={{ marginTop: 4 }}><strong>Safety Cert Expiration:</strong> {selectedItem.expirationDate}</div>
                )}
              </div>
            )}

            <Field
              label="Select quantity"
              helper={
                selectedItem
                  ? `${netAvailable} of ${selectedItem.totalQuantity} remaining (${inCartQtyForSelected} in your cart)`
                  : undefined
              }
            >
              <SelectInput value={quantity} onChange={setQuantity} options={qtyOptions} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Pickup / Start date" error={errors.dateNeeded}>
                <DateInput value={dateNeeded} onChange={handlePickupDateChange} min={todayISO()} />
              </Field>
              <Field
                label="Return / Due date"
                helper="2 weeks default (can be shorter)"
                error={errors.returnDate}
              >
                <DateInput
                  value={returnDate}
                  onChange={setReturnDate}
                  min={dateNeeded || todayISO()}
                  max={maxReturnDate}
                />
              </Field>
            </div>

            {selectedItem?.isHighRisk && (
              <Field label="High-Risk Equipment Safety Check" error={errors.highRisk}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: C.tp }}>
                  <input
                    type="checkbox"
                    checked={ackHighRisk}
                    onChange={e => setAckHighRisk(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: C.pine, cursor: 'pointer' }}
                  />
                  I understand this is high-risk gear and agree to follow OAP safety & inspection rules.
                </label>
              </Field>
            )}

            {/* Delivery rule: Staff / Faculty / OAP can request delivery for any item; Students are Base Camp pickup only */}
            {staffOrFaculty ? (
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: C.tp, fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={delivery}
                    onChange={e => setDelivery(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: C.pine, cursor: 'pointer' }}
                  />
                  Staff/Faculty Delivery to campus location instead of Base Camp pickup
                </label>
                {delivery && (
                  <div style={{ marginTop: 12 }}>
                    <Field label="Campus Delivery Location *" error={errors.location}>
                      <TextInput
                        value={location}
                        onChange={setLocation}
                        placeholder="Building and room number (e.g. Science Building 204)"
                        error={!!errors.location}
                      />
                    </Field>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: C.td, margin: 0 }}>
                Fulfillment: <strong>Base Camp Pickup</strong> (Campus delivery is restricted to Staff & Faculty).
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              <Btn variant="primary" onClick={addToCart} disabled={!selectedItem || netAvailable === 0}>
                Add to Reservation
              </Btn>
              {cart.length > 0 && (
                <Btn variant="secondary" onClick={onGoToConfirm}>
                  Review & Confirm ({cart.reduce((s, i) => s + i.quantity, 0)})
                </Btn>
              )}
              <Btn variant="ghost" onClick={onBack}>Back to catalog</Btn>
            </div>
          </div>
        </Card>

        {/* Running cart list */}
        {cart.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: C.tp, marginBottom: 12 }}>Items in your reservation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cart.map(item => (
                <div key={item.cartId} style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.tp }}>{item.itemName}</div>
                    <div style={{ fontSize: 12, color: C.ts, marginTop: 2 }}>
                      Qty {item.quantity} · Pickup {item.dateNeeded} → Return {item.returnDate} · {item.fulfillment}
                      {item.deliveryLocation && ` (${item.deliveryLocation})`}
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.cartId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A33B2A', display: 'flex', padding: 4, borderRadius: 4 }}>
                    <XIcon size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Screen 4: Confirm Reservation ─────────────────────────────────────────────
function Screen4({
  cart,
  setCart,
  userInfo,
  submitting,
  onBack,
  onSubmit,
  onAddItem,
}: {
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  userInfo: UserInfo;
  submitting: boolean;
  onBack: () => void;
  onSubmit: (notes: string) => void;
  onAddItem: () => void;
}) {
  const [notes, setNotes] = useState('');

  const removeItem = (cartId: string) => setCart(cart.filter(c => c.cartId !== cartId));

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const earliestPickup = cart.length > 0 ? cart.map(i => i.dateNeeded).sort()[0] : '—';
  const latestReturn = cart.length > 0 ? cart.map(i => i.returnDate).sort().reverse()[0] : '—';
  const fulfillmentSummary = summarizeFulfillment(cart);

  return (
    <div>
      <Stepper step={3} />
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.tp, margin: '0 0 24px', letterSpacing: '-0.01em' }}>
        Confirm your reservation.
      </h2>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Left column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: C.tableHd }}>
                    {['Item', 'Qty', 'Pickup Date', 'Return Date', 'Fulfillment', ''].map((h, i) => (
                      <th key={i} style={{ padding: '10px 16px', textAlign: i === 5 ? 'right' : 'left', fontSize: 12, fontWeight: 600, color: C.ts, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={item.cartId} style={{ backgroundColor: idx % 2 === 0 ? C.surface : 'transparent', borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500, color: C.tp }}>{item.itemName}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: C.tp }}>{item.quantity}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: C.ts }}>{item.dateNeeded}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: C.ts }}>{item.returnDate}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: C.ts }}>
                        {item.fulfillment}
                        {item.deliveryLocation && <div style={{ fontSize: 12, color: C.td }}>{item.deliveryLocation}</div>}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button onClick={() => removeItem(item.cartId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A33B2A', display: 'flex', marginLeft: 'auto', padding: 4 }} title="Remove">
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div style={{ marginTop: 20 }}>
            <Field label="Additional notes">
              <Textarea value={notes} onChange={setNotes} placeholder="Any special requests or trip details for OAP staff…" />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn variant="secondary" onClick={onAddItem} disabled={submitting}>Add another item</Btn>
            <Btn variant="primary" onClick={() => onSubmit(notes)} disabled={cart.length === 0 || submitting}>
              {submitting ? 'Submitting…' : 'Submit Reservation'}
            </Btn>
            <Btn variant="ghost" onClick={onBack} disabled={submitting}>Back to catalog</Btn>
          </div>
        </div>

        {/* Right summary card */}
        <div style={{ width: 320, flexShrink: 0, position: 'sticky', top: 88 }}>
          <Card style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.tp, margin: '0 0 16px' }}>Reservation summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['Total Gear Units', `${totalItems} unit${totalItems !== 1 ? 's' : ''}`],
                ['Pickup Date', earliestPickup],
                ['Return / Due Date', latestReturn],
                ['Fulfillment', fulfillmentSummary],
                ['Requester', userInfo.fullName],
                ['B#', userInfo.bNumber],
                ['Role', userInfo.userType],
              ].map(([label, value], i, arr) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', gap: 8 }}>
                  <span style={{ fontSize: 13, color: C.ts }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.tp, textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Screen 5: Reservation Submitted ───────────────────────────────────────────
function Screen5({
  reservation,
  onMakeAnother,
  showToast,
}: {
  reservation: Reservation;
  onMakeAnother: () => void;
  showToast: (msg: string) => void;
}) {
  const fulfillmentSummary = summarizeFulfillment(reservation.items);
  const pickupDate = reservation.items.map(i => i.dateNeeded).sort()[0] ?? '—';
  const returnDate = reservation.items.map(i => i.returnDate).sort().reverse()[0] ?? '—';

  const handleEmailReceipt = () => {
    const subject = encodeURIComponent(`Berea Outdoor Adventure Reservation #${reservation.id}`);
    const itemLines = reservation.items
      .map(i => `- ${i.itemName} x${i.quantity} (Pickup: ${i.dateNeeded}, Return: ${i.returnDate}, ${i.fulfillment})`)
      .join('\n');
    const body = encodeURIComponent(
      `Reservation #${reservation.id}\nStatus: ${reservation.status}\nFulfillment: ${fulfillmentSummary}\n\nItems:\n${itemLines}\n`
    );
    window.location.href = `mailto:${reservation.user.email}?subject=${subject}&body=${body}`;
    showToast(`Receipt prepared for ${reservation.user.email}.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <Stepper step={4} />
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <AlertBanner
          variant="success"
          title="Reservation submitted."
          body={`We received reservation #${reservation.id}. Save your Reservation ID to check ticket status anytime.`}
        />

        <Card style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.tp, margin: '0 0 16px' }}>Reservation details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {([
              ['Reservation ID', reservation.id],
              ['Fulfillment', fulfillmentSummary],
              ['Pickup Date', pickupDate],
              ['Return / Due Date', returnDate],
              ['Ticket Status', null],
            ] as [string, string | null][]).map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}`, gap: 8 }}>
                <span style={{ fontSize: 13, color: C.ts }}>{label}</span>
                {value === null ? <StatusBadge status={reservation.status} /> : <span style={{ fontSize: 13, fontWeight: 500, color: C.tp }}>{value}</span>}
              </div>
            ))}
            <div style={{ paddingTop: 10 }}>
              <div style={{ fontSize: 13, color: C.ts, marginBottom: 8 }}>Items Reserved</div>
              {reservation.items.map((item, idx) => (
                <div key={`${item.itemId}-${idx}`} style={{ fontSize: 13, color: C.tp, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{item.itemName} ({item.dateNeeded} → {item.returnDate})</span>
                  <span style={{ color: C.ts, fontWeight: 600 }}>× {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <AlertBanner
          variant="info"
          title="What's next?"
          body="OAP staff will review your request and mark it Approved once your equipment is staged."
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="secondary" onClick={handleEmailReceipt}>Email details</Btn>
          <Btn variant="secondary" onClick={handlePrint}>Print receipt</Btn>
          <Btn variant="ghost" onClick={onMakeAnother}>Make another reservation</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function UserFlow({
  gearItems,
  userScreen,
  setUserScreen,
  userInfo,
  cart,
  setCart,
  reservations,
  setReservations,
  showToast,
}: UserFlowProps) {
  const [preselectedItem, setPreselectedItem] = useState<GearItem | null>(null);
  const [lastReservation, setLastReservation] = useState<Reservation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showMyReservations, setShowMyReservations] = useState(false);

  const myReservationCount = useMemo(() => {
    return reservations.filter(
      r => r.user.bNumber.toUpperCase() === userInfo.bNumber.toUpperCase()
    ).length;
  }, [reservations, userInfo.bNumber]);

  const handleReserveFromCatalog = (item: GearItem) => {
    setPreselectedItem(item);
    setUserScreen(3);
  };

  const handleCancelMyReservation = async (id: string) => {
    try {
      const res = await updateReservationStatus(id, 'Denied', userInfo.bNumber, userInfo.fullName);
      setReservations(
        reservations.map(r =>
          r.id === id
            ? {
                ...r,
                status: res.status ?? 'Denied',
                editHistory: [...r.editHistory, res.historyEntry],
              }
            : r
        )
      );
      showToast(`Reservation #${id} cancelled.`);
    } catch {
      showToast(`Could not cancel reservation #${id}.`);
    }
  };

  const handleSubmit = async (notes: string) => {
    if (submitting || cart.length === 0) return;
    setSubmitting(true);
    try {
      const nextId = getNextReservationId(reservations);
      const created = await createReservation(
        {
          user: {
            userId: userInfo.userId,
            name: userInfo.fullName,
            bNumber: userInfo.bNumber,
            email: userInfo.email,
            userType: userInfo.userType,
          },
          items: cart.map(c => ({
            itemId: c.itemId,
            itemName: c.itemName,
            isSet: c.isSet,
            quantity: c.quantity,
            dateNeeded: c.dateNeeded,
            returnDate: c.returnDate,
            fulfillment: c.fulfillment,
            deliveryLocation: c.deliveryLocation,
          })),
          notes,
        },
        nextId
      );

      setReservations([created, ...reservations]);
      setLastReservation(created);
      setCart([]);
      setUserScreen(5);
    } catch {
      showToast('Failed to submit reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (showMyReservations) {
    return (
      <MyReservationsView
        userInfo={userInfo}
        reservations={reservations}
        onCancelReservation={handleCancelMyReservation}
        onBackToCatalog={() => setShowMyReservations(false)}
      />
    );
  }

  if (userScreen <= 2) {
    return (
      <Screen2
        gearItems={gearItems}
        cart={cart}
        userInfo={userInfo}
        myReservationCount={myReservationCount}
        onOpenMyReservations={() => setShowMyReservations(true)}
        onReserveItem={handleReserveFromCatalog}
        onGoToCart={() => setUserScreen(4)}
      />
    );
  }

  if (userScreen === 3) {
    return (
      <Screen3
        gearItems={gearItems}
        cart={cart}
        setCart={setCart}
        userInfo={userInfo}
        preselectedItem={preselectedItem}
        onBack={() => setUserScreen(2)}
        onGoToConfirm={() => setUserScreen(4)}
        showToast={showToast}
      />
    );
  }

  if (userScreen === 4) {
    return (
      <Screen4
        cart={cart}
        setCart={setCart}
        userInfo={userInfo}
        submitting={submitting}
        onBack={() => setUserScreen(2)}
        onSubmit={handleSubmit}
        onAddItem={() => setUserScreen(3)}
      />
    );
  }

  if (userScreen === 5 && lastReservation) {
    return (
      <Screen5
        reservation={lastReservation}
        onMakeAnother={() => {
          setUserScreen(2);
          setPreselectedItem(null);
        }}
        showToast={showToast}
      />
    );
  }

  return null;
}
