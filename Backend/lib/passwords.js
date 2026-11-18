// Password helpers for staff accounts. CommonJS so both the Next.js routes
// and `npm run create-staff` (plain Node) can use it.
//
// Stored format: scrypt:<salt base64url>:<hash base64url>
// (no "$" characters, which .env loaders would try to expand)

const crypto = require('crypto');

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

// Readable random password: 4 groups of 4 from 31 characters (~79 bits),
// no look-alike characters (0/O, 1/l/I).
function generatePassword() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const groups = [];
  for (let g = 0; g < 4; g++) {
    let group = '';
    for (let i = 0; i < 4; i++) group += alphabet[crypto.randomInt(alphabet.length)];
    groups.push(group);
  }
  return groups.join('-');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });
  return `scrypt:${salt.toString('base64url')}:${hash.toString('base64url')}`;
}

function verifyPassword(password, stored) {
  const [scheme, saltB64, hashB64] = String(stored || '').split(':');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64url');
  const actual = crypto.scryptSync(String(password), Buffer.from(saltB64, 'base64url'), expected.length, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

// Lowercase letters, digits, "_" and "-", 3-30 characters, starting with a
// letter or digit.
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_-]{2,29}$/;

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

function isValidUsername(username) {
  return USERNAME_PATTERN.test(username);
}

module.exports = {
  generatePassword,
  hashPassword,
  verifyPassword,
  normalizeUsername,
  isValidUsername,
};
