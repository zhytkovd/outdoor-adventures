import crypto from 'crypto';
import pool from '../db';
import { normalizeUsername, verifyPassword } from './passwords';

// Staff portal login: each OAP staff member has their own account in
// `staff_accounts` (username + generated password).
//
// After login the browser gets a signed session cookie that lasts until the
// browser is closed. Every request re-checks the account in the database, so
// deactivating an account or resetting its password logs it out right away.
// Changing STAFF_SESSION_SECRET in Backend/.env logs everyone out.

export const SESSION_COOKIE = 'oa_staff_session';

function sessionSecret() {
  const secret = process.env.STAFF_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      'STAFF_SESSION_SECRET is missing from Backend/.env. Run `npm run create-staff` once to set it up.'
    );
  }
  return secret;
}

export function isStaffLoginConfigured() {
  return Boolean(process.env.STAFF_SESSION_SECRET);
}

// The signature includes the account's password hash, so a password reset
// invalidates sessions made with the old password.
function sign(payload, passwordHash) {
  return crypto
    .createHmac('sha256', `${sessionSecret()}:${passwordHash}`)
    .update(payload)
    .digest('base64url');
}

function createSessionToken(account) {
  const user = Buffer.from(account.username).toString('base64url');
  const payload = `v2.${user}.${Date.now()}.${crypto.randomBytes(12).toString('base64url')}`;
  return `${payload}.${sign(payload, account.password_hash)}`;
}

async function findAccount(username) {
  const [[row]] = await pool.query(
    `SELECT staff_account_id, username, password_hash, is_active
     FROM staff_accounts WHERE username = ?`,
    [username]
  );
  return row || null;
}

export function toStaffAccount(row) {
  return {
    id: row.staff_account_id,
    username: row.username,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at ?? null,
    createdBy: row.created_by ?? null,
  };
}

/** Checks username + password. Returns { account, token } or null. */
export async function loginStaff(username, password) {
  const row = await findAccount(normalizeUsername(username));
  if (!row || !row.is_active || !verifyPassword(password, row.password_hash)) return null;
  return { account: toStaffAccount(row), token: createSessionToken(row) };
}

/** The logged-in staff account for this request, or null. */
export async function getStaffAccount(request) {
  if (!isStaffLoginConfigured()) return null;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 5 || parts[0] !== 'v2') return null;
  const payload = parts.slice(0, 4).join('.');
  let username;
  try {
    username = Buffer.from(parts[1], 'base64url').toString('utf8');
  } catch {
    return null;
  }

  const row = await findAccount(username);
  if (!row || !row.is_active) return null;

  const signature = Buffer.from(parts[4]);
  const expected = Buffer.from(sign(payload, row.password_hash));
  if (signature.length !== expected.length || !crypto.timingSafeEqual(signature, expected)) {
    return null;
  }
  return toStaffAccount(row);
}

/**
 * Use at the top of staff-only route handlers:
 *   const { account, denied } = await requireStaff(request);
 *   if (denied) return denied;
 */
export async function requireStaff(request) {
  const account = await getStaffAccount(request);
  if (account) return { account, denied: null };
  return {
    account: null,
    denied: Response.json({ error: 'Staff login required.' }, { status: 401 }),
  };
}

// Cookie settings. No maxAge/expires = session cookie, deleted when the
// browser closes.
export function sessionCookieOptions() {
  return {
    httpOnly: true, // not readable from page JavaScript
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
}

// ── Login attempt limit ──────────────────────────────────────────────────────
// Slows down password guessing: 10 failed attempts per IP per 15 minutes.
// Kept in memory, so it resets when the server restarts.
const FAILED_LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000;
const failedAttempts = new Map();

export function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return (forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'local').trim();
}

export function isRateLimited(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= FAILED_LIMIT;
}

export function recordFailedLogin(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, first: Date.now() });
  } else {
    entry.count += 1;
  }
}

export function clearFailedLogins(ip) {
  failedAttempts.delete(ip);
}
