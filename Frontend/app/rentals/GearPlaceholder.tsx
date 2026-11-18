'use client';

import { C, Card } from '@/components/rentals/ui';

// Gear & Logistics tab: intentionally empty for now.
// The Inventory team owns gear management. The previous version of this
// screen is still in LogisticsDashboard.tsx if they want to reuse parts of it.
export function GearPlaceholder() {
  return (
    <Card style={{ padding: '48px 24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: C.tp, margin: 0 }}>Gear &amp; Logistics</h1>
      <p style={{ fontSize: 15, color: C.ts, margin: '10px auto 0', maxWidth: 460, lineHeight: 1.5 }}>
        Coming soon. The Inventory team is building gear management here.
      </p>
    </Card>
  );
}
