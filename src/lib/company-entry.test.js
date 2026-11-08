import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

async function fixture() {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
    CREATE TABLE profiles(id uuid PRIMARY KEY REFERENCES auth.users(id), full_name text, phone text, email text,
      sponsor_id uuid REFERENCES profiles(id), referral_code text UNIQUE, status text);
    CREATE TABLE payments(id serial PRIMARY KEY, user_id uuid REFERENCES profiles(id), amount integer, status text);
    CREATE TABLE earnings(id serial PRIMARY KEY);
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

test('company code admits exactly three members, not a fourth', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    for (let n = 1; n <= 3; n++) await register(db, n);
    await assert.rejects(register(db, 4), /3-member limit/);
    const result = await db.query('SELECT count(*)::int AS total, count(sponsor_id)::int AS sponsored FROM profiles');
    assert.deepEqual(result.rows[0], { total: 3, sponsored: 0 });
    const used = await db.query('SELECT used_count FROM company_entry_codes');
    assert.equal(used.rows[0].used_count, 3);
  } finally { await db.close(); }
});

test('company registrations are pending ordinary members without admin privileges', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    await register(db, 1);
    assert.equal((await db.query('SELECT status FROM profiles')).rows[0].status, 'pending');
    assert.equal((await db.query('SELECT count(*)::int AS total FROM user_roles')).rows[0].total, 0);
    await assert.rejects(register(db, 2, 'DIXAB-ENTRY', true), /Founding member registration is disabled/);
  } finally { await db.close(); }
});

test('retrying the same registration consumes only one of the three company entries', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    await register(db, 1); await register(db, 1);
    assert.equal((await db.query('SELECT used_count FROM company_entry_codes')).rows[0].used_count, 1);
  } finally { await db.close(); }
});

test('each new member still admits only three direct recruits', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    const parent = (await register(db, 1)).rows[0].code;
    for (let n = 2; n <= 4; n++) await register(db, n, parent);
    await assert.rejects(register(db, 5, parent), /3-person limit/);
    assert.equal((await db.query('SELECT count(*)::int AS total FROM profiles WHERE sponsor_id = $1', [id(1)])).rows[0].total, 3);
  } finally { await db.close(); }
});

test('reset removes Abbey and all memberships, payments and matching login accounts', { timeout: 30000 }, async () => {
  const db = await fixture();
  try {
    await register(db, 1);
    await db.query("UPDATE profiles SET full_name = 'Muteesasira Abbey'");
    await db.query("INSERT INTO user_roles VALUES ($1,'admin')", [id(1)]);
    await db.exec(await readFile(new URL('../../database/reset-members.sql', import.meta.url), 'utf8'));
    for (const table of ['profiles', 'payments', 'earnings', 'payouts', 'user_roles', 'auth.users']) {
      assert.equal((await db.query(`SELECT count(*)::int AS total FROM ${table}`)).rows[0].total, 0);
    }
    assert.equal((await db.query('SELECT used_count FROM company_entry_codes')).rows[0].used_count, 0);
    await register(db, 2);
    assert.equal((await db.query('SELECT count(*)::int AS total FROM profiles')).rows[0].total, 1);
  } finally { await db.close(); }
});