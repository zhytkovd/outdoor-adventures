'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { UserRole, UserInfo, CartItem, Reservation, GearItem } from './types';
import { roleLabel } from './types';
import {
  fetchGearItems,
  fetchReservations,
} from './api';
import { SignInGate, ReservationLookupModal } from './SignInGate';
import { StaffLogin } from './StaffLogin';
import { StaffUsers } from './StaffUsers';
import { InventoryPanel } from '@/components/inventory/InventoryPanel';
import type { InventoryPage } from '@/components/inventory/types';
import { getStaffSession, staffAccountToUser, staffLogout, type StaffAccount } from './staffApi';
import { UserFlow } from './UserFlow';
import { StaffDashboard } from './StaffDashboard';
import { C, Btn, ChevronDown, XIcon } from '@/components/rentals/ui';
import { MountainIcon } from '@/components/rentals/illustrations';

// 'renter': students, faculty and staff reserving gear (/rentals).
// 'staff':  OAP staff portal (/staff): each staff member signs in with their
//           own username and password (StaffLogin).
export type AppMode = 'renter' | 'staff';

const staffTabItems = [
  { key: 'dashboard', label: 'Dashboard', page: 'dashboard' },
  { key: 'staff', label: 'OAP Reservations' },
  { key: 'user', label: 'Reserve Gear' },
  { key: 'logistics', label: 'Gear & Logistics', page: 'gear' },
  { key: 'categories', label: 'Categories', page: 'categories' },
  { key: 'users', label: 'Users' },
  { key: 'reports', label: 'Reports', page: 'reports' },
] as const;

export function RentalsApp({ mode }: { mode: AppMode }) {
  const homeRole: UserRole = mode === 'staff' ? 'staff' : 'user';
  const [role, setRole] = useState<UserRole>(homeRole);
  const [inventory, setInventory] = useState<{ page: InventoryPage; id: number | null } | null>(null);
  const [userScreen, setUserScreen] = useState(2);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [gearItems, setGearItems] = useState<GearItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [nextResNum, setNextResNum] = useState(101);
  const [toast, setToast] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLookupModal, setShowLookupModal] = useState(false);
  // Staff portal: checking for an existing session on page load.
  const [checkingSession, setCheckingSession] = useState(mode === 'staff');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    let active = true;
    async function loadInitialData() {
      const [itemsData, reservationsData] = await Promise.all([
        fetchGearItems(),
        fetchReservations(),
      ]);
      if (!active) return;
      setGearItems(itemsData);
      setReservations(reservationsData);
    }
    loadInitialData();
    return () => {
      active = false;
    };
  }, []);

  // Staff portal: stay signed in after a page refresh.
  useEffect(() => {
    if (mode !== 'staff') return;
    let active = true;
    getStaffSession()
      .catch(() => null)
      .then(account => {
        if (!active) return;
        if (account) {
          setUserInfo(staffAccountToUser(account));
          setRole('staff');
        }
        setCheckingSession(false);
      });
    return () => {
      active = false;
    };
  }, [mode]);

  // Staff dashboards are only reachable from the staff portal.
  const isOAPStaff = mode === 'staff' && userInfo?.userType === 'oap';

  const handleSignIn = (user: UserInfo) => {
    setUserInfo(user);
    if (mode === 'staff' && user.userType === 'oap') {
      setRole('staff');
    } else {
      setRole('user');
      setUserScreen(2);
    }
    showToast(`Signed in as ${user.fullName} (${roleLabel(user.userType)}).`);
  };

  const handleStaffLoggedIn = (account: StaffAccount) => handleSignIn(staffAccountToUser(account));

  const switchRole = (r: UserRole) => {
    if ((r === 'staff' || r === 'logistics' || r === 'users') && !isOAPStaff) return;
    setRole(r);
    setInventory(null);
    if (r === 'user' && userScreen === 1) {
      setUserScreen(2);
    }
    setShowDropdown(false);
  };

  const navigateInventory = useCallback((page: InventoryPage, id?: number) => {
    setInventory({ page, id: id ?? null });
    setShowDropdown(false);
  }, []);

  const handleSignOut = async () => {
    if (mode === 'staff') await staffLogout();
    setUserInfo(null);
    setRole(homeRole);
    setInventory(null);
    setCart([]);
    setUserScreen(2);
    setShowDropdown(false);
    showToast(mode === 'staff' ? 'Logged out of the staff portal.' : 'Signed out.');
  };

  const firstName = userInfo?.fullName.trim().split(/\s+/)[0] || '';
  const initial = firstName ? firstName[0].toUpperCase() : '';

  const inventoryPage = isOAPStaff ? inventory?.page : undefined;
  const activeTab = inventoryPage === 'gear' || inventoryPage === 'gear-details' || inventoryPage === 'add-gear' || inventoryPage === 'edit-gear' ? 'logistics'
    : inventoryPage ?? role;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: C.sand, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {/* Top bar */}
      <header style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '0 16px' }}>
          {/* Logo: back to the home screen */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: C.pine, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MountainIcon />
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, color: C.tp, letterSpacing: '-0.01em' }}>Outdoor Adventure</span>
            {mode === 'staff' && (
              <span style={{ fontSize: 11, backgroundColor: C.sage, color: C.pine, padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                Staff Portal
              </span>
            )}
          </Link>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Btn variant="ghost" size="sm" onClick={() => setShowLookupModal(true)}>
              Lookup by #
            </Btn>

            {/* User chip — only shown after user signs in */}
            {userInfo && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(d => !d)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 6px', borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: C.surface, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: C.pine, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>{initial}</div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.tp }}>Hi, {firstName}</span>
                  <span style={{ fontSize: 11, backgroundColor: C.sage, color: C.pine, padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>
                    {roleLabel(userInfo.userType)}
                  </span>
                  <ChevronDown />
                </button>
                {showDropdown && (
                  <div className="fade-in" style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(34,39,31,0.10)', minWidth: 190, zIndex: 100, overflow: 'hidden' }}>
                    <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.ts }}>
                      <div style={{ fontWeight: 600, color: C.tp }}>{userInfo.fullName}</div>
                      {mode === 'staff' ? (
                        <div>OAP staff account</div>
                      ) : (
                        <>
                          <div>{userInfo.bNumber} · {roleLabel(userInfo.userType)}</div>
                          <div style={{ fontSize: 11, color: C.td, marginTop: 2 }}>{userInfo.email}</div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', fontSize: 14, color: '#A33B2A', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.sand)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {mode === 'staff' ? 'Log out' : 'Sign out / Switch user'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Staff portal tabs: their own row, so more tabs fit */}
        {userInfo && isOAPStaff && (
          <nav aria-label="Staff portal" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="tab-row" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
              {staffTabItems.map(t => (
                <button
                  key={t.key}
                  onClick={() => 'page' in t ? navigateInventory(t.page) : switchRole(t.key)}
                  className="tab-link"
                  data-active={activeTab === t.key}
                  aria-current={activeTab === t.key ? 'page' : undefined}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Main content */}
      <main style={{ flex: 1, maxWidth: inventoryPage ? undefined : 1200, minWidth: 0, width: '100%', margin: '0 auto', padding: '32px 16px 64px' }}>
        {isOAPStaff && (
          <InventoryPanel page={inventoryPage ?? null} selectedId={inventory?.id ?? null} navigate={navigateInventory} />
        )}
        {inventoryPage ? null : !userInfo ? (
          mode === 'staff' ? (
            checkingSession ? (
              <p style={{ textAlign: 'center', color: C.ts, fontSize: 14 }}>Loading…</p>
            ) : (
              <StaffLogin onLoggedIn={handleStaffLoggedIn} />
            )
          ) : (
            <SignInGate
              reservations={reservations}
              onSignIn={handleSignIn}
            />
          )
        ) : role === 'staff' && isOAPStaff ? (
          <StaffDashboard
            staffUser={userInfo}
            gearItems={gearItems}
            setGearItems={setGearItems}
            reservations={reservations}
            setReservations={setReservations}
            showToast={showToast}
          />
        ) : role === 'users' && isOAPStaff ? (
          <StaffUsers me={userInfo.bNumber} showToast={showToast} />
        ) : (
          <UserFlow
            gearItems={gearItems}
            userScreen={userScreen}
            setUserScreen={setUserScreen}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            cart={cart}
            setCart={setCart}
            reservations={reservations}
            setReservations={setReservations}
            nextResNum={nextResNum}
            setNextResNum={setNextResNum}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '14px 32px', textAlign: 'center', fontSize: 13, color: C.td, backgroundColor: C.surface }}>
        Berea College Outdoor Adventure (OAP)&nbsp;&nbsp;|&nbsp;&nbsp;Base Camp pickup&nbsp;&nbsp;|&nbsp;&nbsp;Questions?&nbsp;
        <a href="mailto:outdoor@berea.edu" style={{ color: C.ts, textDecoration: 'none' }}>outdoor@berea.edu</a>
      </footer>

      {/* Toast */}
      {toast && (
        <div
          className="slide-up"
          style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#22271F', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: '0 8px 24px rgba(34,39,31,0.25)', zIndex: 500, display: 'flex', alignItems: 'center', gap: 10, maxWidth: 360 }}
        >
          <span style={{ flex: 1 }}>{toast}</span>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 2, display: 'flex' }}><XIcon size={14} /></button>
        </div>
      )}

      {/* Privacy-safe Reservation # lookup modal */}
      {showLookupModal && (
        <ReservationLookupModal
          reservations={reservations}
          onClose={() => setShowLookupModal(false)}
        />
      )}

      {/* Click-away for dropdown */}
      {showDropdown && <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowDropdown(false)} />}
    </div>
  );
}
