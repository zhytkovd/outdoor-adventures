import type { UserInfo, BereaRole } from './types';

// Staff portal API (Backend/app/api/staff/*). Each OAP staff member has their
// own account (username + system-generated password). The session is an
// HttpOnly cookie set by the Backend and sent automatically.

const API = '/api/staff';

export interface StaffAccount {
  id: number;
  username: string;
  isActive: boolean;
  createdAt: string | null;
  createdBy: string | null;
}

/** A person who reserves gear (users table). */
export interface Renter {
  bNumber: string;
  fullName: string;
  email: string;
  userType: BereaRole;
  isActive: boolean;
}

/** Returned once, right after creating an account or resetting its password. */
export interface AccountWithPassword {
  account: StaffAccount;
  password: string;
}

const UNREACHABLE = "Can't reach the server. Make sure the Backend is running (cd Backend && npm run dev).";

async function request(input: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(input, { cache: 'no-store', ...init });
  } catch {
    throw new Error(UNREACHABLE);
  }
  // When the Backend is down, the Frontend proxy answers with a plain-text
  // 500 instead of the Backend's JSON.
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  if (res.status >= 500 && !isJson) throw new Error(UNREACHABLE);
  return res;
}

async function json<T>(res: Response, fallback: string): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : fallback);
  return data as T;
}

const jsonInit = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
});

/**
 * The dashboards expect a UserInfo for the signed-in staff member and send
 * its `bNumber` as `staffId` with every action. For staff accounts that value
 * is the username, which is what reservations.staff_id and
 * edit_history.staff_id store.
 */
export function staffAccountToUser(account: StaffAccount): UserInfo {
  return {
    userId: `S-${account.id}`,
    bNumber: account.username,
    email: '',
    fullName: account.username,
    userType: 'oap',
  };
}

export async function staffLogin(username: string, password: string): Promise<StaffAccount> {
  const res = await request(`${API}/login`, jsonInit('POST', { username, password }));
  const data = await json<{ account: StaffAccount }>(res, 'Sign-in failed.');
  return data.account;
}

export async function staffLogout(): Promise<void> {
  await request(`${API}/logout`, { method: 'POST' }).catch(() => undefined);
}

/** The staff account this browser is signed in as, or null. */
export async function getStaffSession(): Promise<StaffAccount | null> {
  const res = await request(`${API}/session`);
  const data = await json<{ authenticated: boolean; account: StaffAccount | null }>(res, 'Could not check the session.');
  return data.authenticated ? data.account : null;
}

export async function fetchStaffAccounts(): Promise<StaffAccount[]> {
  return json(await request(`${API}/accounts`), 'Could not load staff accounts.');
}

export async function createStaffAccount(username: string): Promise<AccountWithPassword> {
  return json(await request(`${API}/accounts`, jsonInit('POST', { username })), 'Could not create the account.');
}

export async function setStaffAccountActive(id: number, isActive: boolean): Promise<StaffAccount> {
  return json(await request(`${API}/accounts/${id}`, jsonInit('PATCH', { isActive })), 'Could not update the account.');
}

export async function resetStaffPassword(id: number): Promise<AccountWithPassword> {
  return json(await request(`${API}/accounts/${id}/reset-password`, jsonInit('POST')), 'Could not reset the password.');
}

export async function fetchRenters(): Promise<Renter[]> {
  return json(await request(`${API}/renters`), 'Could not load users.');
}

export async function setRenterActive(bNumber: string, isActive: boolean): Promise<Renter> {
  return json(
    await request(`${API}/renters/${encodeURIComponent(bNumber)}`, jsonInit('PATCH', { isActive })),
    'Could not update the user.'
  );
}
