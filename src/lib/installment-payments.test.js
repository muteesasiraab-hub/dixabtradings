import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
async function fixture() {
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$;
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email text);
    CREATE TABLE profiles(id uuid PRIMARY KEY REFERENCES auth.users(id), full_name text,phone text,email text,sponsor_id uuid REFERENCES profiles(id),referral_code text NOT NULL UNIQUE,status text,activated_at timestamptz);
    CREATE TABLE payments(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid REFERENCES profiles(id),amount integer,status text,reference text,created_at timestamptz DEFAULT now(),approved_at timestamptz);
    CREATE TABLE earnings(id serial PRIMARY KEY,user_id uuid,source_user_id uuid,level integer,amount integer);
    CREATE SEQUENCE code_sequence;
    CREATE FUNCTION generate_referral_code() RETURNS text LANGUAGE sql AS $$ SELECT 'DA'||nextval('code_sequence')::text $$;`);
  await db.exec(await readFile(new URL('../../database/company-entry-setup.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('../../database/installment-payments.sql',import.meta.url),'utf8'));
  return db;
}
async function register(db,n,code='DIXAB-ENTRY') {
  await db.query('INSERT INTO auth.users VALUES ($1,$2)',[id(n),`member${n}@example.test`]);
  await db.query('SELECT provision_member($1,$2,$3,$4,$5)',[id(n),'Test member','0700000000',`member${n}@example.test`,code]);
}
const submit=(db,n,amount,ref)=>db.query('SELECT submit_member_installment($1,$2,$3)',[id(n),amount,`MTN Mobile Money · ${ref}`]);
const approve=(db,ref)=>db.query('SELECT director_approve_payment(id) FROM payments WHERE reference=$1',[`MTN Mobile Money · ${ref}`]);
async function state(db,n) { return (await db.query('SELECT status,referral_code,activated_at FROM profiles WHERE id=$1',[id(n)])).rows[0]; }

test('approved 40000 installment issues no code, consumes no company slot, and full approved 100000 activates',async()=>{
 const db=await fixture(); try { await register(db,1); await submit(db,1,40000,'first'); await approve(db,'first');
 assert.equal((await state(db,1)).referral_code,null); assert.equal((await state(db,1)).status,'pending');
 assert.equal((await db.query('SELECT used_count FROM company_entry_codes')).rows[0].used_count,0);
 await submit(db,1,60000,'second'); assert.equal((await state(db,1)).referral_code,null); await approve(db,'second');
 assert.match((await state(db,1)).referral_code,/^DA/); assert.equal((await state(db,1)).status,'active');
 assert.equal((await db.query('SELECT used_count FROM company_entry_codes')).rows[0].used_count,1);
 assert.equal((await db.query("SELECT sum(amount)::int AS paid FROM payments WHERE status='approved'")).rows[0].paid,100000);
 } finally { await db.close(); }
});
test('partial referrals do not count toward three slots or earn commissions; full payment credits once',async()=>{
 const db=await fixture(); try { await register(db,1); await submit(db,1,100000,'parent'); await approve(db,'parent'); const parent=(await state(db,1)).referral_code;
 await register(db,2,parent); await submit(db,2,25000,'partial'); await approve(db,'partial');
 assert.equal((await db.query('SELECT count(*)::int AS n FROM profiles WHERE sponsor_id=$1 AND activated_at IS NOT NULL',[id(1)])).rows[0].n,0);
 assert.equal((await db.query('SELECT count(*)::int AS n FROM earnings')).rows[0].n,0);
 await submit(db,2,75000,'final'); await approve(db,'final');
 assert.equal((await db.query('SELECT count(*)::int AS n FROM profiles WHERE sponsor_id=$1 AND activated_at IS NOT NULL',[id(1)])).rows[0].n,1);
 assert.equal((await db.query('SELECT sum(amount)::int AS paid FROM earnings')).rows[0].paid,10000);
 await assert.rejects(approve(db,'final'),/Only pending/);
 } finally { await db.close(); }
});
test('pending installments reserve the remaining balance and rejected installments remain in statement without counting',async()=>{
 const db=await fixture(); try { await register(db,1); await submit(db,1,60000,'unverified');
 await assert.rejects(submit(db,1,50000,'over'),/remaining balance/);
 await db.query('SELECT director_reject_installment(id) FROM payments WHERE reference=$1',['MTN Mobile Money · unverified']);
 await submit(db,1,100000,'replacement'); await approve(db,'replacement');
 const rows=(await db.query('SELECT amount,status,reference FROM payments ORDER BY amount')).rows;
 assert.equal(rows.length,2); assert.equal(rows[0].amount,60000); assert.equal(rows[0].status,'rejected'); assert.equal(rows[1].amount,100000); assert.equal(rows[1].status,'approved');
 } finally { await db.close(); }
});
test('duplicate transaction references cannot be submitted by the same or another member',async()=>{
 const db=await fixture(); try { await register(db,1); await register(db,2); await submit(db,1,10000,'same');
 await assert.rejects(submit(db,1,10000,'same'),/already been submitted/); await assert.rejects(submit(db,2,10000,'SAME'),/already been submitted/);
 } finally { await db.close(); }
});
test('installment amount must be positive and cannot exceed 100000 UGX',async()=>{
 const db=await fixture(); try { await register(db,1); for(const amount of [0,-1,100001]) await assert.rejects(submit(db,1,amount,'invalid'),/between 1 and 100000/);
 } finally { await db.close(); }
});
test('three-member cap is checked only on final approval and preserves earlier approved installments',async()=>{
 const db=await fixture(); try { for(let n=1;n<=4;n++) await register(db,n);
 await submit(db,4,40000,'four-partial'); await approve(db,'four-partial');
 for(let n=1;n<=3;n++){ await submit(db,n,100000,`full-${n}`); await approve(db,`full-${n}`); }
 await submit(db,4,60000,'four-final'); await assert.rejects(approve(db,'four-final'),/3-approved-member limit/);
 assert.equal((await state(db,4)).referral_code,null); assert.equal((await db.query("SELECT sum(amount)::int AS paid FROM payments WHERE user_id=$1 AND status='approved'",[id(4)])).rows[0].paid,40000);
 } finally { await db.close(); }
});
test('members cannot approve, reject or write installment records directly',async()=>{
 const db=await fixture(); try {
 const rows=(await db.query("SELECT has_table_privilege('authenticated','payments','UPDATE') AS edit,has_function_privilege('authenticated','submit_member_installment(uuid,integer,text)','EXECUTE') AS submit,has_function_privilege('authenticated','director_approve_payment(uuid)','EXECUTE') AS approve,has_function_privilege('authenticated','director_reject_installment(uuid)','EXECUTE') AS reject")).rows[0];
 assert.deepEqual(rows,{edit:false,submit:false,approve:false,reject:false});
 } finally { await db.close(); }
});
test('installment update is idempotent and preserves approved payment history',async()=>{
 const db=await fixture(); try { await register(db,1); await submit(db,1,40000,'saved'); await approve(db,'saved');
 await db.exec(await readFile(new URL('../../database/installment-payments.sql',import.meta.url),'utf8'));
 assert.equal((await db.query("SELECT sum(amount)::int AS paid FROM payments WHERE status='approved'")).rows[0].paid,40000); assert.equal((await state(db,1)).referral_code,null);
 } finally { await db.close(); }
});
