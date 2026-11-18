'use client';

import { useEffect, useMemo, useState } from 'react';
import { roleLabel } from './types';
import {
  createStaffAccount,
  fetchRenters,
  fetchStaffAccounts,
  resetStaffPassword,
  setRenterActive,
  setStaffAccountActive,
  type AccountWithPassword,
  type Renter,
  type StaffAccount,
} from './staffApi';
import { C, Btn, Field, TextInput, Card, EmptyState, Modal, SearchField } from '@/components/rentals/ui';

// Users tab of the staff portal. Two clearly separate kinds of people:
//   • OAP staff accounts: sign in to this portal (username + password)
//   • Renters: students, faculty and staff who reserve gear

type Section = 'staff' | 'renters';

function ErrorBox({ message }: { message: string }) {
  return (
    <div role="alert" style={{ padding: '12px 14px', borderRadius: 8, backgroundColor: '#F8E7E3', color: '#A33B2A', fontSize: 13 }}>
      {message}
    </div>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: 'green' | 'grey' | 'clay' }) {
  const styles = {
    green: { backgroundColor: C.sage, color: C.pine },
    grey: { backgroundColor: '#EFEDE8', color: C.ts },
    clay: { backgroundColor: '#F6E6DC', color: '#8F4521' },
  }[tone];
  return (
    <span style={{ ...styles, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

function formatDay(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Shows a generated password once, with a copy button. */
function PasswordReveal({ result, onDone }: { result: AccountWithPassword; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div style={{ padding: 20, borderRadius: 12, backgroundColor: C.sage, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 14, color: C.tp }}>
        Password for <strong>{result.account.username}</strong>. Copy it now and give it to them privately. It won&apos;t be shown again.
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <code style={{ fontSize: 18, fontWeight: 600, letterSpacing: '0.04em', padding: '8px 14px', backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.tp, userSelect: 'all' }}>
          {result.password}
        </code>
        <Btn variant="secondary" size="sm" onClick={copy}>{copied ? 'Copied ✓' : 'Copy'}</Btn>
        <Btn variant="primary" size="sm" onClick={onDone}>Done</Btn>
      </div>
    </div>
  );
}

// ── OAP staff accounts ───────────────────────────────────────────────────────

function StaffAccountsSection({ me, showToast }: { me: string; showToast: (msg: string) => void }) {
  const [accounts, setAccounts] = useState<StaffAccount[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<AccountWithPassword | null>(null);
  const [confirm, setConfirm] = useState<{ kind: 'deactivate' | 'reset'; account: StaffAccount } | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchStaffAccounts()
      .then(list => { if (active) setAccounts(list); })
      .catch(err => { if (active) setLoadError(err instanceof Error ? err.message : 'Could not load staff accounts.'); });
    return () => { active = false; };
  }, []);

  const replace = (updated: StaffAccount) =>
    setAccounts(prev => (prev || []).map(a => (a.id === updated.id ? { ...a, ...updated } : a)));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setCreateError('Enter a username.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const result = await createStaffAccount(username.trim());
      setAccounts(prev => [...(prev || []), result.account]);
      setRevealed(result);
      setUsername('');
      showToast(`Staff account "${result.account.username}" created.`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not create the account.');
    } finally {
      setCreating(false);
    }
  };

  const reactivate = async (account: StaffAccount) => {
    setActionError(null);
    try {
      replace(await setStaffAccountActive(account.id, true));
      showToast(`${account.username} can sign in again.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update the account.');
    }
  };

  const runConfirmed = async () => {
    if (!confirm) return;
    setBusy(true);
    setActionError(null);
    try {
      if (confirm.kind === 'deactivate') {
        replace(await setStaffAccountActive(confirm.account.id, false));
        showToast(`${confirm.account.username} can no longer sign in.`);
      } else {
        setRevealed(await resetStaffPassword(confirm.account.id));
      }
      setConfirm(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.');
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card style={{ padding: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: C.tp, margin: '0 0 4px' }}>Create a staff account</h2>
        <p style={{ fontSize: 13, color: C.ts, margin: '0 0 16px' }}>
          Choose a username. The system generates a password, which you give to the new staff member.
        </p>
        {revealed ? (
          <PasswordReveal result={revealed} onDone={() => setRevealed(null)} />
        ) : (
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 220px' }}>
              <Field label="Username" helper="3–30 characters: lowercase letters, numbers, _ or -" error={createError || undefined}>
                <TextInput value={username} onChange={v => { setUsername(v); setCreateError(null); }} placeholder="e.g. jsmith" error={!!createError} />
              </Field>
            </div>
            <div style={{ paddingTop: 26 }}>
              <Btn type="submit" variant="primary" disabled={creating}>{creating ? 'Creating…' : 'Create account'}</Btn>
            </div>
          </form>
        )}
      </Card>

      <Card style={{ padding: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: C.tp, margin: '0 0 16px' }}>Staff accounts</h2>
        {actionError && <div style={{ marginBottom: 12 }}><ErrorBox message={actionError} /></div>}
        {loadError ? (
          <ErrorBox message={loadError} />
        ) : accounts === null ? (
          <p style={{ color: C.ts, fontSize: 14, margin: 0 }}>Loading…</p>
        ) : accounts.length === 0 ? (
          <EmptyState message="No staff accounts yet" />
        ) : (
          <div>
            {accounts.map((a, i) => {
              const isMe = a.username === me;
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${C.border}` : 'none', flexWrap: 'wrap', opacity: a.isActive ? 1 : 0.65 }}>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.tp }}>{a.username}</span>
                      {isMe && <Pill tone="green">You</Pill>}
                      {a.isActive ? <Pill tone="green">Active</Pill> : <Pill tone="grey">Deactivated</Pill>}
                    </div>
                    <div style={{ fontSize: 12, color: C.ts, marginTop: 2 }}>
                      {a.createdBy ? `Created by ${a.createdBy}` : 'Created during setup'}
                      {a.createdAt ? ` · ${formatDay(a.createdAt)}` : ''}
                    </div>
                  </div>
                  {!isMe && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {a.isActive ? (
                        <>
                          <Btn variant="secondary" size="sm" onClick={() => setConfirm({ kind: 'reset', account: a })}>Reset password</Btn>
                          <Btn variant="secondary" size="sm" onClick={() => setConfirm({ kind: 'deactivate', account: a })}>Deactivate</Btn>
                        </>
                      ) : (
                        <Btn variant="secondary" size="sm" onClick={() => reactivate(a)}>Reactivate</Btn>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {confirm && (
        <Modal
          title={confirm.kind === 'deactivate' ? `Deactivate ${confirm.account.username}?` : `Reset password for ${confirm.account.username}?`}
          onClose={() => !busy && setConfirm(null)}
          footer={
            <>
              <Btn variant="secondary" onClick={() => setConfirm(null)} disabled={busy}>Cancel</Btn>
              <Btn variant="primary" onClick={runConfirmed} disabled={busy}>
                {busy ? 'Working…' : confirm.kind === 'deactivate' ? 'Deactivate' : 'Reset password'}
              </Btn>
            </>
          }
        >
          <p style={{ fontSize: 14, color: C.ts, margin: 0, lineHeight: 1.5 }}>
            {confirm.kind === 'deactivate'
              ? 'They are signed out right away and can no longer sign in. Their history is kept, and you can reactivate them later.'
              : 'Their current password stops working and they are signed out. A new password is generated for you to give them.'}
          </p>
        </Modal>
      )}
    </div>
  );
}

// ── Renters ──────────────────────────────────────────────────────────────────

function RentersSection({ showToast }: { showToast: (msg: string) => void }) {
  const [renters, setRenters] = useState<Renter[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Renter | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetchRenters()
      .then(list => { if (active) setRenters(list); })
      .catch(err => { if (active) setLoadError(err instanceof Error ? err.message : 'Could not load users.'); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!renters || !q) return renters || [];
    return renters.filter(r =>
      [r.fullName, r.bNumber, r.email].some(v => v.toLowerCase().includes(q))
    );
  }, [renters, query]);

  const update = async (renter: Renter, isActive: boolean) => {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await setRenterActive(renter.bNumber, isActive);
      setRenters(prev => (prev || []).map(r => (r.bNumber === updated.bNumber ? updated : r)));
      showToast(isActive ? `${renter.fullName} can reserve gear again.` : `${renter.fullName} can no longer reserve gear.`);
      setConfirm(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update the user.');
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: C.tp, margin: 0 }}>
          Renters {renters ? <span style={{ color: C.td, fontWeight: 500 }}>({renters.length})</span> : null}
        </h2>
        <div style={{ flex: '0 1 280px', minWidth: 200 }}>
          <SearchField value={query} onChange={setQuery} placeholder="Search name, B#, or email" />
        </div>
      </div>
      {actionError && <div style={{ marginBottom: 12 }}><ErrorBox message={actionError} /></div>}
      {loadError ? (
        <ErrorBox message={loadError} />
      ) : renters === null ? (
        <p style={{ color: C.ts, fontSize: 14, margin: 0 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          message={renters.length ? 'No matches' : 'No renters yet'}
          sub={renters.length ? undefined : 'People are added here the first time they sign in on Reservations.'}
        />
      ) : (
        <div>
          {filtered.map((r, i) => (
            <div key={r.bNumber} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${C.border}` : 'none', flexWrap: 'wrap', opacity: r.isActive ? 1 : 0.65 }}>
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.tp }}>{r.fullName}</span>
                  <Pill tone="clay">{roleLabel(r.userType)}</Pill>
                  {!r.isActive && <Pill tone="grey">Deactivated</Pill>}
                </div>
                <div style={{ fontSize: 12, color: C.ts, marginTop: 2, overflowWrap: 'anywhere' }}>{r.bNumber} · {r.email}</div>
              </div>
              {r.isActive ? (
                <Btn variant="secondary" size="sm" onClick={() => setConfirm(r)} disabled={busy}>Deactivate</Btn>
              ) : (
                <Btn variant="secondary" size="sm" onClick={() => update(r, true)} disabled={busy}>Reactivate</Btn>
              )}
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <Modal
          title={`Deactivate ${confirm.fullName}?`}
          onClose={() => !busy && setConfirm(null)}
          footer={
            <>
              <Btn variant="secondary" onClick={() => setConfirm(null)} disabled={busy}>Cancel</Btn>
              <Btn variant="primary" onClick={() => update(confirm, false)} disabled={busy}>{busy ? 'Working…' : 'Deactivate'}</Btn>
            </>
          }
        >
          <p style={{ fontSize: 14, color: C.ts, margin: 0, lineHeight: 1.5 }}>
            They won&apos;t be able to reserve gear. Their past reservations are kept, and you can reactivate them later.
          </p>
        </Modal>
      )}
    </Card>
  );
}

// ── Tab ──────────────────────────────────────────────────────────────────────

export function StaffUsers({ me, showToast }: { me: string; showToast: (msg: string) => void }) {
  const [section, setSection] = useState<Section>('staff');

  const sections: { key: Section; label: string; description: string }[] = [
    {
      key: 'staff',
      label: 'OAP staff accounts',
      description: 'People who sign in to this staff portal with a username and password.',
    },
    {
      key: 'renters',
      label: 'Renters',
      description: 'Students, faculty, and staff who reserve gear. They sign in on Reservations with their B#.',
    },
  ];
  const current = sections.find(s => s.key === section)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 820 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.tp, margin: 0, letterSpacing: '-0.02em' }}>Users</h1>
        <div role="tablist" aria-label="User type" style={{ display: 'inline-flex', marginTop: 16, backgroundColor: C.tableHd, borderRadius: 10, padding: 4, gap: 4, flexWrap: 'wrap' }}>
          {sections.map(s => (
            <button
              key={s.key}
              role="tab"
              aria-selected={section === s.key}
              onClick={() => setSection(s.key)}
              className="seg-btn"
              data-active={section === s.key}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 14, color: C.ts, margin: '10px 0 0' }}>{current.description}</p>
      </div>

      {section === 'staff' ? <StaffAccountsSection me={me} showToast={showToast} /> : <RentersSection showToast={showToast} />}
    </div>
  );
}
