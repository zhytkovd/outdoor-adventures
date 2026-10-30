'use client';

import { useState, useCallback, useEffect } from 'react';
import type { UserRole, UserInfo, CartItem, Reservation, GearItem } from './types';
import {
  FALLBACK_GEAR_ITEMS,
  FALLBACK_RESERVATIONS,
  fetchGearItems,
  fetchReservations,
} from './api';
import { UserFlow } from './UserFlow';
import { StaffDashboard } from './StaffDashboard';
import { C, ChevronDown, XIcon } from '@/components/rentals/ui';
import { MountainIcon } from '@/components/rentals/illustrations';

export default function RentalsPage() {
  const [role, setRole] = useState<UserRole>('user');
  const [userScreen, setUserScreen] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [gearItems, setGearItems] = useState<GearItem[]>(FALLBACK_GEAR_ITEMS);
  const [reservations, setReservations] = useState<Reservation[]>(FALLBACK_RESERVATIONS);
  const [nextResNum, setNextResNum] = useState(8);
  const [toast, setToast] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

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

  const switchRole = (r: UserRole) => {
    setRole(r);
    setShowDropdown(false);
  };

  const handleSignOut = () => {
    setUserInfo(null);
    setCart([]);
    setUserScreen(1);
    setShowDropdown(false);
    showToast('Signed out.');
  };

  const firstName = userInfo?.fullName.trim().split(/\s+/)[0] || '';
  const initial = firstName ? firstName[0].toUpperCase() : '';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: C.sand, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {/* Top bar */}
      <header style={{ height: 64, backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: C.pine, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MountainIcon />
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, color: C.tp, letterSpacing: '-0.01em' }}>Outdoor Adventure</span>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* View-as segmented control */}
            <div style={{ display: 'flex', backgroundColor: '#F2EFE7', borderRadius: 8, padding: 3, gap: 2 }}>
              {(['user', 'staff'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    backgroundColor: role === r ? C.surface : 'transparent',
                    color: role === r ? C.tp : C.ts,
                    boxShadow: role === r ? '0 1px 3px rgba(34,39,31,0.08)' : 'none',
                    transition: 'all 0.15s',
                    textTransform: 'capitalize',
                  }}
                >
                  {r === 'user' ? 'User' : 'Staff'}
                </button>
              ))}
            </div>

            {/* User chip — only shown after user enters their info on Screen 1 */}
            {userInfo && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(d => !d)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 6px', borderRadius: 8, border: `1px solid ${C.border}`, backgroundColor: C.surface, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: C.pine, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>{initial}</div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.tp }}>Hi, {firstName}</span>
                  <ChevronDown />
                </button>
                {showDropdown && (
                  <div className="fade-in" style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(34,39,31,0.10)', minWidth: 168, zIndex: 100, overflow: 'hidden' }}>
                    <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.ts }}>
                      <div style={{ fontWeight: 600, color: C.tp }}>{userInfo.fullName}</div>
                      <div>{userInfo.bNumber} · {userInfo.userType}</div>
                    </div>
                    <button
                      onClick={() => { setRole('user'); setUserScreen(1); setShowDropdown(false); }}
                      style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', fontSize: 14, color: C.tp, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.sand)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      Edit Info
                    </button>
                    <button
                      onClick={handleSignOut}
                      style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', fontSize: 14, color: '#A33B2A', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.sand)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '32px 32px 64px' }}>
        {role === 'user' ? (
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
        ) : (
          <StaffDashboard
            reservations={reservations}
            setReservations={setReservations}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '14px 32px', textAlign: 'center', fontSize: 13, color: C.td, backgroundColor: C.surface }}>
        Berea College Outdoor Adventure&nbsp;&nbsp;|&nbsp;&nbsp;Base Camp pickup&nbsp;&nbsp;|&nbsp;&nbsp;Questions?&nbsp;
        <a href="mailto:outdoor@berea.edu" style={{ color: C.ts, textDecoration: 'none' }}>outdoor@berea.edu</a>
      </footer>

      {/* Toast */}
      {toast && (
        <div
          className="slide-up"
          style={{ position: 'fixed', bottom: 24, right: 24, backgroundColor: '#22271F', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: '0 8px 24px rgba(34,39,31,0.25)', zIndex: 500, display: 'flex', alignItems: 'center', gap: 10, maxWidth: 340 }}
        >
          <span style={{ flex: 1 }}>{toast}</span>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 2, display: 'flex' }}><XIcon size={14} /></button>
        </div>
      )}

      {/* Click-away for dropdown */}
      {showDropdown && <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowDropdown(false)} />}
    </div>
  );
}
