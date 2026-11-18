'use client';

import Link from 'next/link';
import { C } from '@/components/rentals/ui';
import { MountainIcon } from '@/components/rentals/illustrations';

// Home screen: choose between reserving gear and the OAP staff portal.

function TentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 20 L12 4 L21 20 Z" />
      <path d="M12 4 L12 20" />
      <path d="M9 20 L12 14 L15 20" />
    </svg>
  );
}

function StaffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4 V3 H15 V4" />
      <path d="M9 10 H15" />
      <path d="M9 14 H15" />
      <path d="M9 18 H12" />
    </svg>
  );
}

function ChoiceCard({
  href,
  icon,
  title,
  body,
  cta,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <Link href={href} className="home-card">
      <div style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: C.sage, color: C.pine, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.tp, margin: '20px 0 8px', letterSpacing: '-0.01em' }}>{title}</h2>
      <p style={{ fontSize: 15, color: C.ts, margin: 0, lineHeight: 1.5, flex: 1 }}>{body}</p>
      <span style={{ marginTop: 24, fontSize: 15, fontWeight: 600, color: C.pine }}>{cta} →</span>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: C.sand }}>
      <header style={{ height: 64, backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: C.pine, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MountainIcon />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.tp, letterSpacing: '-0.01em' }}>Outdoor Adventure</span>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 880, margin: '0 auto', padding: '56px 16px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 700, color: C.tp, margin: 0, letterSpacing: '-0.02em' }}>
            Berea Outdoor Adventure
          </h1>
          <p style={{ fontSize: 16, color: C.ts, marginTop: 10 }}>
            Borrow tents, kayaks, packs, and more from Base Camp. Rentals are free.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          <ChoiceCard
            href="/rentals"
            icon={<TentIcon />}
            title="Reservations"
            body="Students, faculty, and staff: browse the gear catalog and reserve equipment for your trip."
            cta="Reserve gear"
          />
          <ChoiceCard
            href="/staff"
            icon={<StaffIcon />}
            title="Staff"
            body="Outdoor Adventure Program staff: sign in to manage reservations, check gear in and out, and update inventory."
            cta="Staff sign in"
          />
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '14px 16px', textAlign: 'center', fontSize: 13, color: C.td, backgroundColor: C.surface }}>
        Berea College Outdoor Adventure (OAP)&nbsp;&nbsp;|&nbsp;&nbsp;Base Camp pickup&nbsp;&nbsp;|&nbsp;&nbsp;Questions?&nbsp;
        <a href="mailto:outdoor@berea.edu" style={{ color: C.ts, textDecoration: 'none' }}>outdoor@berea.edu</a>
      </footer>
    </div>
  );
}
