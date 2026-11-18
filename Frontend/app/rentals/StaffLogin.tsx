'use client';

import { useState } from 'react';
import Link from 'next/link';
import { staffLogin, type StaffAccount } from './staffApi';
import { C, Btn, Field, TextInput, Card } from '@/components/rentals/ui';

/** Staff portal sign-in: each staff member's own username and password. */
export function StaffLogin({ onLoggedIn }: { onLoggedIn: (account: StaffAccount) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const account = await staffLogin(username.trim(), password);
      setPassword('');
      onLoggedIn(account);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: C.tp, margin: 0, letterSpacing: '-0.02em' }}>
          Staff Sign In
        </h1>
        <p style={{ fontSize: 15, color: C.ts, marginTop: 8 }}>
          For Outdoor Adventure Program staff: manage reservations, check gear in and out, and manage users.
        </p>
      </div>

      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <Card style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Field label="Username">
              <TextInput
                autoComplete="username"
                value={username}
                onChange={v => { setUsername(v); setError(null); }}
                placeholder="Your username"
                error={!!error}
              />
            </Field>

            <Field label="Password" helper="Don't have an account? Ask an OAP staff member to create one for you.">
              <TextInput
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={v => { setPassword(v); setError(null); }}
                placeholder="Password"
                error={!!error}
              />
            </Field>

            {error && (
              <div role="alert" style={{ padding: '12px 14px', borderRadius: 8, backgroundColor: '#F8E7E3', color: '#A33B2A', fontSize: 13 }}>
                {error}
              </div>
            )}

            <Btn type="submit" variant="primary" fullWidth disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Btn>
          </form>
        </Card>

        <p style={{ textAlign: 'center', fontSize: 14, color: C.ts, marginTop: 20 }}>
          Want to reserve gear instead?{' '}
          <Link href="/rentals" style={{ color: C.pine, fontWeight: 600 }}>Go to Reservations</Link>
        </p>
      </div>
    </div>
  );
}
