'use client';

import { useState } from 'react';
import type { UserInfo, BereaRole, Reservation, PublicReservationLookup } from './types';
import { lookupReservationPublic } from './api';
import {
  C, Btn, Field, TextInput, SelectInput, Card, StatusBadge, Modal, AlertBanner,
} from '@/components/rentals/ui';

const ROLE_OPTIONS: { label: string; value: BereaRole }[] = [
  { label: 'Student (Base Camp Pickup)', value: 'student' },
  { label: 'Faculty / Staff (Delivery & Faculty Gear Eligible)', value: 'faculty/staff' },
  { label: 'Staff (Delivery & Faculty Gear Eligible)', value: 'staff' },
  { label: 'OAP Staff (Admin & Reservation Management)', value: 'OAP' },
];

export function ReservationLookupModal({
  reservations,
  onClose,
}: {
  reservations: Reservation[];
  onClose: () => void;
}) {
  const [queryId, setQueryId] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<PublicReservationLookup | null>(null);

  const handleLookup = () => {
    if (!queryId.trim()) return;
    const found = lookupReservationPublic(queryId, reservations);
    setResult(found);
    setSearched(true);
  };

  return (
    <Modal
      title="Check Reservation Status by #"
      onClose={onClose}
      footer={<Btn variant="secondary" onClick={onClose}>Close</Btn>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <AlertBanner
          variant="info"
          title="Privacy-safe status lookup"
          body="Enter a Reservation ID (e.g. R101) to view ticket status and dates. Personal requester information (name, B#, email, and room number) is hidden for privacy."
        />

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Field label="Reservation #">
              <TextInput
                value={queryId}
                onChange={v => { setQueryId(v); setSearched(false); }}
                placeholder="e.g. R101"
              />
            </Field>
          </div>
          <Btn variant="primary" onClick={handleLookup} disabled={!queryId.trim()}>
            Look up
          </Btn>
        </div>

        {searched && !result && (
          <div style={{ padding: '16px', borderRadius: 10, backgroundColor: '#F8E7E3', color: '#A33B2A', fontSize: 13 }}>
            No reservation found matching <strong>{queryId.trim().toUpperCase()}</strong>. Please check the Reservation ID on your confirmation receipt.
          </div>
        )}

        {result && (
          <Card style={{ padding: 20, backgroundColor: C.sand }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.tp }}>Ticket #{result.id}</span>
              <StatusBadge status={result.status} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['Submitted Date', result.submittedAt],
                ['Pickup / Start Date', result.pickupDate],
                ['Return / Due Date', result.returnDate],
                ...(result.checkoutDate ? [['Checked Out Date', result.checkoutDate]] : []),
                ...(result.checkinDate ? [['Checked In Date', result.checkinDate]] : []),
                ['Fulfillment Method', result.fulfillment === 'Delivery' ? 'Campus Delivery (Location Protected)' : 'Base Camp Pickup'],
                ['Gear Reserved', result.itemSummaryText],
              ].map(([label, val], idx, arr) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: idx < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: C.ts }}>{label}</span>
                  <span style={{ color: C.tp, fontWeight: 500 }}>{val}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
}

export function SignInGate({
  reservations,
  onSignIn,
}: {
  reservations: Reservation[];
  onSignIn: (user: UserInfo) => void;
}) {
  const [bNumber, setBNumber] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLookup, setShowLookup] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!bNumber.trim().match(/^B\d{8}$/i)) {
      e.bNumber = 'B# must be B followed by 8 digits (e.g. B01234567)';
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@berea.edu') || cleanEmail.length <= '@berea.edu'.length) {
      e.email = 'Enter a valid Berea College email address (e.g. you@berea.edu)';
    }
    if (!fullName.trim()) {
      e.fullName = 'Full name is required';
    }
    if (!userType) {
      e.userType = 'Please select your Berea role';
    }
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const normalizedBNum = bNumber.trim().toUpperCase();
    onSignIn({
      userId: `U-${normalizedBNum.slice(1)}`,
      bNumber: normalizedBNum,
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      userType: userType as BereaRole,
    });
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: C.tp, margin: 0, letterSpacing: '-0.02em' }}>
          Berea Outdoor Adventure
        </h1>
        <p style={{ fontSize: 15, color: C.ts, marginTop: 8 }}>
          Sign in with your Berea College credentials to reserve equipment or manage Base Camp rentals.
        </p>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Card style={{ padding: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Field label="B# *" helper="Format: B followed by 8 digits (e.g. B01234567)" error={errors.bNumber}>
              <TextInput value={bNumber} onChange={setBNumber} placeholder="B01234567" error={!!errors.bNumber} />
            </Field>

            <Field label="Email *" helper="Must be your @berea.edu email address" error={errors.email}>
              <TextInput value={email} onChange={setEmail} placeholder="you@berea.edu" error={!!errors.email} />
            </Field>

            <Field label="Full Name *" error={errors.fullName}>
              <TextInput value={fullName} onChange={setFullName} placeholder="Your full name" error={!!errors.fullName} />
            </Field>

            <Field label="Role *" error={errors.userType}>
              <SelectInput
                value={userType}
                onChange={setUserType}
                placeholder="Select your role (student, OAP, staff, faculty/staff)"
                options={ROLE_OPTIONS}
              />
            </Field>

            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Btn variant="primary" fullWidth onClick={handleSubmit}>
                Continue to Outdoor Adventure
              </Btn>
              <Btn variant="secondary" fullWidth onClick={() => setShowLookup(true)}>
                Look up reservation status by #
              </Btn>
            </div>
          </div>
        </Card>
      </div>

      {showLookup && (
        <ReservationLookupModal
          reservations={reservations}
          onClose={() => setShowLookup(false)}
        />
      )}
    </div>
  );
}
