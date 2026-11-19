import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

async function fixture() {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$;
    CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
    CREATE TABLE profiles(id uuid PRIMARY KEY REFERENCES auth.users(id), full_name text, phone text, email text,
      sponsor_id uuid REFERENCES profiles(id), referral_code text NOT NULL UNIQUE, status text, activated_at timestamptz);
    CREATE TABLE payments(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES profiles(id), amount integer, status text, reference text, approved_at timestamptz);
    CREATE TABLE earnings(id serial PRIMARY KEY, user_id uuid, source_user_id uuid, level integer, amount integer);
    CREATE TABLE payouts(id serial PRIMARY KEY);
    CREATE TABLE user_roles(user_id uuid REFERENCES auth.users(id), role text);
    CREATE SEQUENCE code_sequence;
    CREATE FUNCTION generate_referral_code() RETURNS text LANGUAGE sql AS $$ SELECT 'DA' || nextval('code_sequence')::text $$;
  `);
  await db.exec(await readFile(new URL('../../database/company-entry-setup.sql', import.meta.url), 'utf8'));
  return db;
}
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
async function register(db, n, code = 'DIXAB-ENTRY', founder = false) {
  await db.query('INSERT INTO auth.users(id,email) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id(n), `member${n}@example.test`]);
  return db.query('SELECT provision_member($1,$2,$3,$4,$5,$6) AS code', [id(n), 'Test Member', '0700000000', `member${n}@example.test`, code, founder]);
}

async function approve(db, n) {
  await db.query("UPDATE payments SET reference = 'MTN:verified-test' WHERE user_id = $1", [id(n)]);
  return db.query('SELECT director_approve_payment(id) FROM payments WHERE user_id = $1 AND status = $2', [id(n), 'pending']);
}
async function codeFor(db, n) {
  return (await db.query('SELECT referral_code FROM profiles WHERE id = $1', [id(n)])).rows[0].referral_code;
}

test('registration issues no referral code; approval issues one', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    assert.equal((await register(db, 1)).rows[0].code, null);
    assert.equal(await codeFor(db, 1), null);
    await approve(db, 1);
    assert.match(await codeFor(db, 1), /^DA/);
    assert.equal((await db.query('SELECT status FROM profiles')).rows[0].status, 'active');
  } finally { await db.close(); }
});

test('company slots count exactly three approvals, not pending registrations', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    for (let n = 1; n <= 5; n++) await register(db, n);
    assert.equal((await db.query('SELECT used_count FROM company_entry_codes')).rows[0].used_count, 0);
    for (let n = 1; n <= 3; n++) await approve(db, n);
    await assert.rejects(approve(db, 4), /3-approved-member limit/);
    assert.equal((await db.query('SELECT used_count FROM company_entry_codes')).rows[0].used_count, 3);
    assert.equal(await codeFor(db, 4), null);
    assert.equal((await db.query('SELECT status FROM payments WHERE user_id = $1', [id(4)])).rows[0].status, 'pending');
    await assert.rejects(register(db, 6), /3-approved-member limit/);
  } finally { await db.close(); }
});

test('member referral limit counts three approvals only, pending and rejected members consume no slots', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    await register(db, 1); await approve(db, 1);
    const parent = await codeFor(db, 1);
    for (let n = 2; n <= 6; n++) await register(db, n, parent);
    assert.equal((await db.query('SELECT count(*)::int AS total FROM profiles WHERE sponsor_id = $1 AND activated_at IS NOT NULL', [id(1)])).rows[0].total, 0);
    await db.query("UPDATE profiles SET status = 'rejected' WHERE id = $1", [id(6)]);
    for (let n = 2; n <= 4; n++) await approve(db, n);
    await assert.rejects(approve(db, 5), /3-approved-member limit/);
    assert.equal(await codeFor(db, 5), null);
    assert.equal((await db.query('SELECT count(*)::int AS total FROM earnings')).rows[0].total, 3);
    assert.equal((await db.query('SELECT status FROM payments WHERE user_id = $1', [id(5)])).rows[0].status, 'pending');
  } finally { await db.close(); }
});

test('unapproved old codes cannot sponsor new members', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    await register(db, 1);
    await db.query("UPDATE profiles SET referral_code = 'DAUNPAID' WHERE id = $1", [id(1)]);
    await assert.rejects(register(db, 2, 'DAUNPAID'), /approved member identifier/);
  } finally { await db.close(); }
});

test('founding privileges remain disabled and signup retries consume no slots', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    await register(db, 1); await register(db, 1);
    assert.equal((await db.query('SELECT used_count FROM company_entry_codes')).rows[0].used_count, 0);
    assert.equal((await db.query('SELECT count(*)::int AS total FROM user_roles')).rows[0].total, 0);
    await assert.rejects(register(db, 2, 'DIXAB-ENTRY', true), /Founding member registration is disabled/);
  } finally { await db.close(); }
});

test('repeat approvals do not duplicate codes, referral slots or earnings', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    await register(db, 1); await approve(db, 1);
    const firstCode = await codeFor(db, 1);
    const paymentId = (await db.query('SELECT id FROM payments WHERE user_id = $1', [id(1)])).rows[0].id;
    await assert.rejects(db.query('SELECT director_approve_payment($1)', [paymentId]), /Only pending/);
    await db.query("INSERT INTO payments(user_id,amount,status,reference) VALUES ($1,100000,'pending','repeat-payment')", [id(1)]);
    await approve(db, 1);
    assert.equal(await codeFor(db, 1), firstCode);
    assert.equal((await db.query('SELECT used_count FROM company_entry_codes')).rows[0].used_count, 1);
    assert.equal((await db.query('SELECT count(*)::int AS total FROM earnings')).rows[0].total, 0);
  } finally { await db.close(); }
});

test('approval requires a payment reference and leaves slots untouched on failure', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    await register(db, 1);
    const paymentId = (await db.query('SELECT id FROM payments')).rows[0].id;
    await assert.rejects(db.query('SELECT director_approve_payment($1)', [paymentId]), /transaction reference/);
    assert.equal(await codeFor(db, 1), null);
    assert.equal((await db.query('SELECT used_count FROM company_entry_codes')).rows[0].used_count, 0);
  } finally { await db.close(); }
});

test('approved entry slots remain used if a member is deleted', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    for (let n = 1; n <= 3; n++) { await register(db, n); await approve(db, n); }
    await db.query('DELETE FROM payments WHERE user_id = $1', [id(1)]);
    await db.query('DELETE FROM profiles WHERE id = $1', [id(1)]);
    await assert.rejects(register(db, 4), /3-approved-member limit/);
  } finally { await db.close(); }
});

test('upgrade clears unpaid codes, frees only pending entry slots, and is idempotent', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    // Simulate the former setup: both active and pending members consumed slots.
    await db.exec('ALTER TABLE profiles DROP COLUMN company_entry_code');
    for (let n = 1; n <= 3; n++) await db.query('INSERT INTO auth.users(id,email) VALUES ($1,$2)', [id(n), `member${n}@example.test`]);
    await db.query("INSERT INTO profiles(id,referral_code,status,activated_at) VALUES ($1,'DAOLD1','active',now()),($2,'DAOLD2','pending',NULL),($3,'DAOLD3','rejected',NULL)", [id(1),id(2),id(3)]);
    await db.exec('UPDATE company_entry_codes SET used_count = 3');
    const setup = await readFile(new URL('../../database/company-entry-setup.sql', import.meta.url), 'utf8');
    await db.exec(setup); await db.exec(setup);
    assert.equal(await codeFor(db, 1), 'DAOLD1');
    assert.equal(await codeFor(db, 2), null);
    assert.equal(await codeFor(db, 3), null);
    assert.equal((await db.query('SELECT used_count FROM company_entry_codes')).rows[0].used_count, 1);
  } finally { await db.close(); }
});

test('reset removes memberships and financial records and resets company entry count', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    await register(db, 1); await approve(db, 1);
    await db.exec(await readFile(new URL('../../database/reset-members.sql', import.meta.url), 'utf8'));
    for (const table of ['profiles', 'payments', 'earnings', 'payouts', 'user_roles', 'auth.users']) {
      assert.equal((await db.query(`SELECT count(*)::int AS total FROM ${table}`)).rows[0].total, 0);
    }
    assert.equal((await db.query('SELECT used_count FROM company_entry_codes')).rows[0].used_count, 0);
  } finally { await db.close(); }
});
