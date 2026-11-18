// Creates an OAP staff account from the command line, mainly for the FIRST
// account (after that, staff create accounts in the portal's Users tab).
//
//   cd Backend
//   npm run create-staff -- <username>           create an account
//   npm run create-staff -- <username> --reset   new password for an account
//
// Prints the generated password ONCE. Also adds STAFF_SESSION_SECRET to
// Backend/.env if it's missing (restart `npm run dev` after that).

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
  generatePassword,
  hashPassword,
  isValidUsername,
  normalizeUsername,
} = require('../lib/passwords');

const envPath = path.join(__dirname, '..', '.env');

function ensureSessionSecret() {
  let env = fs.readFileSync(envPath, 'utf8');
  // Leftover from the old shared-password login.
  env = env.replace(/^STAFF_PASSWORD_HASH=.*\n?/m, '');
  let added = false;
  if (!/^STAFF_SESSION_SECRET=.+$/m.test(env)) {
    env = env.replace(/^STAFF_SESSION_SECRET=.*\n?/m, '');
    env = `${env.replace(/\n*$/, '\n')}STAFF_SESSION_SECRET=${crypto.randomBytes(32).toString('base64url')}\n`;
    added = true;
  }
  fs.writeFileSync(envPath, env);
  return added;
}

async function main() {
  const args = process.argv.slice(2);
  const reset = args.includes('--reset');
  const username = normalizeUsername(args.find(a => !a.startsWith('--')));

  if (!isValidUsername(username)) {
    console.error('Usage: npm run create-staff -- <username> [--reset]');
    console.error('Username: 3-30 characters, lowercase letters, numbers, "_" or "-".');
    process.exit(1);
  }
  if (!fs.existsSync(envPath)) {
    console.error(`No .env found at ${envPath}. Create it with the DB_* settings first.`);
    process.exit(1);
  }

  const secretAdded = ensureSessionSecret();
  const pool = require('../db');
  const password = generatePassword();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    if (reset) {
      const [result] = await conn.query(
        `UPDATE staff_accounts SET password_hash = ?, is_active = TRUE WHERE username = ?`,
        [hashPassword(password), username]
      );
      if (!result.affectedRows) throw new Error(`No staff account named "${username}".`);
    } else {
      await conn.query(
        `INSERT INTO staff_accounts (username, password_hash, created_by) VALUES (?, ?, NULL)`,
        [username, hashPassword(password)]
      );
    }
    await conn.query(
      `INSERT INTO edit_history (staff_id, entity_type, entity_id, action, notes)
       VALUES (?, 'staff_account', ?, ?, 'npm run create-staff')`,
      [username, username, reset ? 'Password reset' : 'Staff account created']
    );
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      console.error(`The username "${username}" is already taken. Use --reset to give it a new password.`);
    } else {
      console.error('Failed:', error.message);
    }
    process.exitCode = 1;
    return;
  } finally {
    conn.release();
    await pool.end();
  }

  console.log(`\n${reset ? 'New password for' : 'Created staff account'} "${username}".`);
  console.log('Password (shown only once, save it somewhere safe):\n');
  console.log(`    ${password}\n`);
  if (secretAdded) console.log('Added STAFF_SESSION_SECRET to Backend/.env. Restart `npm run dev`.\n');
}

main();
