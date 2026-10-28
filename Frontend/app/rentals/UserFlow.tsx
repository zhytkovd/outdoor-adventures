'use client';

import { useState } from 'react';
import type { UserInfo, CartItem, Reservation, ItemCategory, GearItem } from './types';
import { createReservation } from './api';
import { GearIllustration } from '@/components/rentals/illustrations';
import {
  C, Btn, Field, TextInput, SelectInput, DateInput, Textarea, SearchField,
  Stepper, AlertBanner, Card, StatusBadge, XIcon, TrashIcon,
} from '@/components/rentals/ui';

// ── Props ────────────────────────────────────────────────────────────────────
interface UserFlowProps {
  gearItems: GearItem[];
  userScreen: number;
  setUserScreen: (n: number) => void;
  userInfo: UserInfo | null;
  setUserInfo: (u: UserInfo) => void;
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  reservations: Reservation[];
  setReservations: (r: Reservation[]) => void;
  nextResNum: number;
  setNextResNum: (n: number) => void;
  showToast: (msg: string) => void;
}

// ── Screen 1: User Information ────────────────────────────────────────────────
function Screen1({ onNext, setUserInfo }: { onNext: () => void; setUserInfo: (u: UserInfo) => void }) {
  const [bNumber, setBNumber] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!bNumber.match(/^B\d{6,7}$/i)) e.bNumber = 'Enter a valid B# (e.g. B001234)';
    if (!email.includes('@')) e.email = 'Enter a valid email address';
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!userType) e.userType = 'Please select your role';
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setUserInfo({ bNumber: bNumber.toUpperCase(), email, fullName, userType: userType as UserInfo['userType'] });
    onNext();
  };

  return (
    <div>
      <Stepper step={1} />
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: C.tp, margin: 0, letterSpacing: '-0.02em' }}>Reserve your gear.</h1>
        <p style={{ fontSize: 15, color: C.ts, marginTop: 8 }}>Fill in your information to get started with your reservation.</p>
      </div>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Card style={{ padding: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Field label="B#" error={errors.bNumber}>
              <TextInput value={bNumber} onChange={setBNumber} placeholder="B00XXXX" error={!!errors.bNumber} />
            </Field>
            <Field label="Email" error={errors.email}>
              <TextInput value={email} onChange={setEmail} placeholder="you@berea.edu" error={!!errors.email} />
            </Field>
            <Field label="Full name" error={errors.fullName}>
              <TextInput value={fullName} onChange={setFullName} placeholder="Your full name" error={!!errors.fullName} />
            </Field>
            <Field label="I am a" error={errors.userType}>
              <SelectInput
                value={userType}
                onChange={setUserType}
                placeholder="Select your role"
                options={[
                  { label: 'Student', value: 'Student' },
                  { label: 'Staff', value: 'Staff' },
                  { label: 'Faculty', value: 'Faculty' },
                ]}
              />
            </Field>
            <div style={{ marginTop: 8 }}>
              <Btn variant="primary" fullWidth onClick={submit}>Submit</Btn>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Item card ────────────────────────────────────────────────────────────────
function ItemCard({ item, onReserve }: { item: GearItem; onReserve: (item: GearItem) => void }) {
  return (
    <Card style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <GearIllustration type={item.illustrationType} />
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: C.tp }}>{item.name}</h3>
          <span style={{ fontSize: 12, backgroundColor: C.sage, color: C.ts, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0 }}>{item.category}</span>
        </div>
        <p style={{ fontSize: 13, color: item.availableQuantity > 0 ? C.moss : '#A33B2A', margin: 0 }}>
          {item.availableQuantity} of {item.totalQuantity} available
        </p>
        {item.deliveryAvailable && (
          <span style={{ fontSize: 12, backgroundColor: '#E4EEF5', color: '#2D5C7A', padding: '2px 8px', borderRadius: 999, display: 'inline-block', width: 'fit-content' }}>Delivery available</span>
        )}
        <div style={{ marginTop: 'auto', paddingTop: 10 }}>
          <Btn variant="primary" size="sm" onClick={() => onReserve(item)} disabled={item.availableQuantity === 0}>
            Reserve
          </Btn>
        </div>
      </div>
    </Card>
  );
}

// ── Screen 2: Item Catalog ─────────────────────────────────────────────────
function Screen2({
  gearItems,
  cart,
  onReserveItem,
  onGoToCart,
}: {
  gearItems: GearItem[];
  cart: CartItem[];
  onReserveItem: (item: GearItem) => void;
  onGoToCart: () => void;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ItemCategory>('All');

  const categories: ItemCategory[] = ['All', 'Camping', 'Water', 'Hiking', 'Climbing', 'Winter'];

  const filtered = gearItems.filter(item => {
    const matchCat = category === 'All' || item.category === category;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <Stepper step={2} />
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.tp, margin: '0 0 20px', letterSpacing: '-0.01em' }}>Browse equipment.</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search equipment…" />
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
            <ItemCard key={item.id} item={item} onReserve={onReserveItem} />
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
          {cart.length} item{cart.length !== 1 ? 's' : ''} in reservation →
        </button>
      )}
    </div>
  );
}

// ── Screen 3: Reserve Equipment ───────────────────────────────────────────────
function Screen3({
  gearItems,
  cart,
  setCart,
  preselectedItem,
  onBack,
  showToast,
}: {
  gearItems: GearItem[];
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  preselectedItem: GearItem | null;
  onBack: () => void;
  showToast: (m: string) => void;
}) {
  const [selectedItemId, setSelectedItemId] = useState(preselectedItem?.id ?? '');
  const [quantity, setQuantity] = useState('1');
  const [date, setDate] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedItem = gearItems.find(i => i.id === selectedItemId) ?? null;
  const maxQty = selectedItem ? Math.min(selectedItem.availableQuantity, 10) : 10;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedItemId) e.item = 'Please select an item';
    if (!date) e.date = 'Please select a date';
    if (delivery && !location.trim()) e.location = 'Delivery location is required';
    return e;
  };

  const addToCart = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const item = gearItems.find(i => i.id === selectedItemId)!;
    const newItem: CartItem = {
      cartId: `cart-${Date.now()}`,
      itemId: selectedItemId,
      itemName: item.name,
      quantity: parseInt(quantity, 10),
      dateNeeded: date,
      fulfillment: delivery ? 'Delivery' : 'Pickup',
      deliveryLocation: delivery ? location : undefined,
    };
    setCart([...cart, newItem]);
    showToast(`${item.name} added to your reservation.`);
    // Reset for another item
    setSelectedItemId('');
    setQuantity('1');
    setDate('');
    setDelivery(false);
    setLocation('');
    setErrors({});
  };

  const removeFromCart = (cartId: string) => setCart(cart.filter(c => c.cartId !== cartId));

  const qtyOptions = Array.from({ length: maxQty || 1 }, (_, i) => ({ label: String(i + 1), value: String(i + 1) }));

  return (
    <div>
      <Stepper step={2} />
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Card style={{ padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.tp, margin: '0 0 24px', letterSpacing: '-0.01em' }}>Add an item</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Field label="Select item" error={errors.item}>
              <SelectInput
                value={selectedItemId}
                onChange={v => { setSelectedItemId(v); setDelivery(false); }}
                placeholder="Choose equipment…"
                options={gearItems.map(i => ({ label: `${i.name} (${i.availableQuantity} available)`, value: i.id }))}
              />
            </Field>
            <Field label="Select quantity" helper={selectedItem ? `of ${selectedItem.availableQuantity} available` : undefined}>
              <SelectInput value={quantity} onChange={setQuantity} options={qtyOptions} />
            </Field>
            <Field label="Date you need the item" error={errors.date}>
              <DateInput value={date} onChange={setDate} />
            </Field>
            {selectedItem?.deliveryAvailable && (
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: C.tp, fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={delivery}
                    onChange={e => setDelivery(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: C.pine, cursor: 'pointer' }}
                  />
                  Delivery to location instead of Base Camp pickup
                </label>
                {delivery && (
                  <div style={{ marginTop: 12 }}>
                    <Field label="Delivery location" error={errors.location}>
                      <TextInput value={location} onChange={setLocation} placeholder="Building and room number" error={!!errors.location} />
                    </Field>
                  </div>
                )}
              </div>
            )}
            {!selectedItem?.deliveryAvailable && selectedItem && (
              <p style={{ fontSize: 13, color: C.td, margin: 0 }}>This item is pickup only — collect at Base Camp.</p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Btn variant="primary" onClick={addToCart}>Add to Reservation</Btn>
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
                      Qty {item.quantity} · {item.dateNeeded} · {item.fulfillment}
                      {item.deliveryLocation && ` → ${item.deliveryLocation}`}
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
  const earliestDate = cart.length > 0 ? cart.map(i => i.dateNeeded).sort()[0] : '—';

  return (
    <div>
      <Stepper step={3} />
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.tp, margin: '0 0 24px', letterSpacing: '-0.01em' }}>Confirm your reservation.</h2>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Left column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: C.tableHd }}>
                    {['Item', 'Qty', 'Date needed', 'Fulfillment', ''].map((h, i) => (
                      <th key={i} style={{ padding: '10px 16px', textAlign: i === 4 ? 'right' : 'left', fontSize: 12, fontWeight: 600, color: C.ts, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={item.cartId} style={{ backgroundColor: idx % 2 === 0 ? C.surface : 'transparent', borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500, color: C.tp }}>{item.itemName}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: C.tp }}>{item.quantity}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: C.ts }}>{item.dateNeeded}</td>
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
              <Textarea value={notes} onChange={setNotes} placeholder="Any special requests or details for staff…" />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn variant="secondary" onClick={onAddItem} disabled={submitting}>Add item</Btn>
            <Btn variant="primary" onClick={() => onSubmit(notes)} disabled={cart.length === 0 || submitting}>
              {submitting ? 'Submitting…' : 'Submit'}
            </Btn>
            <Btn variant="ghost" onClick={onBack} disabled={submitting}>Cancel</Btn>
          </div>
        </div>

        {/* Right summary card */}
        <div style={{ width: 300, flexShrink: 0, position: 'sticky', top: 88 }}>
          <Card style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.tp, margin: '0 0 16px' }}>Reservation summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['Items', `${totalItems} item${totalItems !== 1 ? 's' : ''}`],
                ['Earliest date', earliestDate],
                ['Pickup location', 'Base Camp'],
                ['Name', userInfo.fullName],
                ['B#', userInfo.bNumber],
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
function Screen5({ reservation, onMakeAnother }: { reservation: Reservation; onMakeAnother: () => void }) {
  return (
    <div>
      <Stepper step={4} />
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <AlertBanner
          variant="success"
          title="Reservation submitted."
          body={`We received reservation #${reservation.id}. You will get an email when it is ready for pickup.`}
        />

        <Card style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.tp, margin: '0 0 16px' }}>Reservation details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {([
              ['Reservation ID', reservation.id],
              ['Pickup location', 'Base Camp'],
              ['Pickup date', reservation.items[0]?.dateNeeded ?? '—'],
              ['Status', null],
            ] as [string, string | null][]).map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}`, gap: 8 }}>
                <span style={{ fontSize: 13, color: C.ts }}>{label}</span>
                {value === null ? <StatusBadge status={reservation.status} /> : <span style={{ fontSize: 13, fontWeight: 500, color: C.tp }}>{value}</span>}
              </div>
            ))}
            <div style={{ paddingTop: 10 }}>
              <div style={{ fontSize: 13, color: C.ts, marginBottom: 8 }}>Items</div>
              {reservation.items.map(item => (
                <div key={item.itemId} style={{ fontSize: 13, color: C.tp, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{item.itemName}</span>
                  <span style={{ color: C.ts }}>× {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <AlertBanner
          variant="info"
          title="What's next?"
          body="Our staff is getting your items ready. We will notify you when your order is ready."
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="secondary" onClick={() => {}}>Email details</Btn>
          <Btn variant="secondary" onClick={() => {}}>Print</Btn>
          <Btn variant="ghost" onClick={onMakeAnother}>Make another reservation</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function UserFlow({
  gearItems,
  userScreen, setUserScreen,
  userInfo, setUserInfo,
  cart, setCart,
  reservations, setReservations,
  nextResNum, setNextResNum,
  showToast,
}: UserFlowProps) {
  const [preselectedItem, setPreselectedItem] = useState<GearItem | null>(null);
  const [lastReservation, setLastReservation] = useState<Reservation | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleReserveFromCatalog = (item: GearItem) => {
    setPreselectedItem(item);
    setUserScreen(3);
  };

  const handleSubmit = async (notes: string) => {
    if (!userInfo || submitting) return;
    setSubmitting(true);
    try {
      const fallbackId = `R${String(nextResNum).padStart(4, '0')}`;
      const created = await createReservation(
        {
          user: {
            name: userInfo.fullName,
            bNumber: userInfo.bNumber,
            email: userInfo.email,
            userType: userInfo.userType,
          },
          items: cart.map(c => ({
            itemId: c.itemId,
            itemName: c.itemName,
            quantity: c.quantity,
            dateNeeded: c.dateNeeded,
            fulfillment: c.fulfillment,
            deliveryLocation: c.deliveryLocation,
          })),
          notes,
        },
        fallbackId
      );

      setReservations([...reservations, created]);
      setNextResNum(nextResNum + 1);
      setLastReservation(created);
      setCart([]);
      setUserScreen(5);
    } catch {
      showToast('Failed to submit reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (userScreen === 1) return <Screen1 onNext={() => setUserScreen(2)} setUserInfo={setUserInfo} />;
  if (userScreen === 2) {
    return (
      <Screen2
        gearItems={gearItems}
        cart={cart}
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
        preselectedItem={preselectedItem}
        onBack={() => setUserScreen(2)}
        showToast={showToast}
      />
    );
  }
  if (userScreen === 4) {
    return (
      <Screen4
        cart={cart}
        setCart={setCart}
        userInfo={userInfo!}
        submitting={submitting}
        onBack={() => setUserScreen(1)}
        onSubmit={handleSubmit}
        onAddItem={() => setUserScreen(3)}
      />
    );
  }
  if (userScreen === 5 && lastReservation) {
    return (
      <Screen5
        reservation={lastReservation}
        onMakeAnother={() => { setUserScreen(2); setPreselectedItem(null); }}
      />
    );
  }

  return null;
}
