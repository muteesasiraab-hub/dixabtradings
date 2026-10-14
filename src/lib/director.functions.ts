import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

const DIRECTORS = ["dickson niwagaba", "muteesasira abbey"];

function sessionConfig() {
  return {
    password: process.env["DIRECTOR_SESSION_SECRET"]!,
    name: "dixab-director",
    maxAge: 60 * 60 * 8,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

type DirSession = { director?: string };

function normName(n: string) {
  return n.trim().toLowerCase().replace(/\s+/g, " ");
}

async function digest(s: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
}

async function safeEqual(a: string, b: string) {
  const [x, y] = await Promise.all([digest(a), digest(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function matchDirector(input: string) {
  const n = normName(input);
  const parts = n.split(" ").sort().join(" ");
  return DIRECTORS.find((d) => d === n || d.split(" ").sort().join(" ") === parts) ?? null;
}

export const directorLogin = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ name: z.string().min(2).max(100), password: z.string().min(1).max(200) }).parse(i))
  .handler(async ({ data }) => {
    const expected = process.env["DIRECTOR_PASSWORD"];
    if (!expected) throw new Error("Director access is not configured");
    const director = matchDirector(data.name);
    const ok = await safeEqual(data.password, expected);
    if (!director || !ok) return { ok: false as const };
    const session = await useSession<DirSession>(sessionConfig());
    await session.update({ director });
    return { ok: true as const };
  });

export const directorLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<DirSession>(sessionConfig());
  await session.clear();
  return { ok: true };
});

async function requireDirector() {
  if (!process.env["DIRECTOR_SESSION_SECRET"]) throw new Error("Director access is not configured");
  const session = await useSession<DirSession>(sessionConfig());
  const d = session.data.director;
  if (!d) throw new Error("Please sign in again");
  return d;
}

export const directorApprovePayment = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ paymentId: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    await requireDirector();
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: pay } = await db.from("payments").select("id, user_id, status").eq("id", data.paymentId).maybeSingle();
    if (!pay) throw new Error("Payment not found");
    if (pay.status === "approved") throw new Error("Already approved");
    const { data: upd, error } = await db.from("payments")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", pay.id).neq("status", "approved").select("id");
    if (error) throw new Error("Could not approve payment");
    if (!upd?.length) throw new Error("Already approved");
    const { data: prof } = await db.from("profiles").select("id, status, sponsor_id").eq("id", pay.user_id).maybeSingle();
    if (prof && prof.status !== "active") await db.from("profiles").update({ status: "active", activated_at: new Date().toISOString() }).eq("id", prof.id);
    let ancestor = prof?.sponsor_id ?? null;
    for (let level = 1; ancestor && level <= 5; level++) {
      const { data: a } = await db.from("profiles").select("id, status, sponsor_id").eq("id", ancestor).maybeSingle();
      if (!a) break;
      if (a.status === "active") await db.from("earnings").insert({ user_id: a.id, source_user_id: pay.user_id, level, amount: 5000 });
      ancestor = a.sponsor_id;
    }
    return { ok: true };
  });

export const directorRejectPayment = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ paymentId: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    await requireDirector();
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { error } = await db.from("payments").update({ status: "rejected" }).eq("id", data.paymentId).eq("status", "pending");
    if (error) throw new Error("Could not reject payment");
    return { ok: true };
  });

export const directorRecordPayout = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ userId: z.string().uuid(), amount: z.number().int().positive().max(100_000_000), method: z.string().max(50).optional(), reference: z.string().max(100).optional() }).parse(i))
  .handler(async ({ data }) => {
    const director = await requireDirector();
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (db as any).from("payouts").insert({ user_id: data.userId, amount: data.amount, method: data.method ?? null, reference: data.reference ?? null, paid_by: director });
    if (error) { console.error("payout", error); throw new Error("Could not record payout. Make sure the payouts table exists."); }
    return { ok: true };
  });

export const getDirectorOverview = createServerFn({ method: "GET" }).handler(async () => {
  if (!process.env["DIRECTOR_SESSION_SECRET"]) return { authed: false as const };
  let director: string | undefined;
  try {
    const session = await useSession<DirSession>(sessionConfig());
    director = session.data.director;
  } catch (e) {
    console.error("director session", e);
    return { authed: false as const };
  }
  if (!director) return { authed: false as const };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let loaded;
  try {
  loaded = await Promise.all([
    supabaseAdmin.from("profiles").select("id, full_name, phone, email, referral_code, status, sponsor_id, created_at").order("created_at", { ascending: false }),
    supabaseAdmin.from("payments").select("id, user_id, amount, status, reference, created_at").order("created_at", { ascending: false }),
    supabaseAdmin.from("earnings").select("user_id, amount"),
  ]);
  } catch (e) {
    console.error("director overview", e);
    return { authed: true as const, director, error: "Members list is unavailable right now.", stats: { total: 0, active: 0, pending: 0, revenue: 0, paidOut: 0, pendingPayments: 0, disbursed: 0 }, payments: [] as { id: string; user_id: string; amount: number; status: string; reference: string | null; created_at: string; member: string }[], payouts: [] as { id: string; user_id: string; amount: number; method: string | null; reference: string | null; paid_by: string; created_at: string; member: string }[], balances: [] as { id: string; full_name: string; phone: string | null; earned: number; paid: number; balance: number }[], payoutsReady: false, members: [] as { id: string; full_name: string; phone: string | null; email: string | null; referral_code: string; status: string; sponsor_id: string | null; created_at: string; sponsor_name: string; earnings: number; directs: number }[] };
  }
  const [{ data: profiles }, { data: payments }, { data: earnings }] = loaded;

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const earnBy = new Map<string, number>();
  for (const e of earnings ?? []) earnBy.set(e.user_id, (earnBy.get(e.user_id) ?? 0) + (e.amount ?? 0));
  const directs = new Map<string, number>();
  for (const p of profiles ?? []) if (p.sponsor_id) directs.set(p.sponsor_id, (directs.get(p.sponsor_id) ?? 0) + 1);

  const members = (profiles ?? []).map((p) => ({
    ...p,
    sponsor_name: p.sponsor_id ? nameById.get(p.sponsor_id) ?? "—" : "—",
    earnings: earnBy.get(p.id) ?? 0,
    directs: directs.get(p.id) ?? 0,
  }));

  // Sign-ups that haven't confirmed their email yet have no profile row; show them too.
  try {
    const known = new Set(members.map((m) => m.id));
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of authList?.users ?? []) {
      const reg = u.user_metadata?.dixab_registration;
      if (known.has(u.id) || !reg || typeof reg.fullName !== "string") continue;
      if (!u.email_confirmed_at) {
        await supabaseAdmin.auth.admin.updateUserById(u.id, { email_confirm: true }).catch(() => null);
      }
      members.push({
        id: u.id,
        full_name: reg.fullName,
        phone: typeof reg.phone === "string" ? reg.phone : null,
        email: u.email ?? "",
        referral_code: "—",
        status: "awaiting first sign-in",
        sponsor_id: null,
        created_at: u.created_at,
        sponsor_name: typeof reg.referralCode === "string" && reg.referralCode ? `code ${reg.referralCode}` : "—",
        earnings: 0,
        directs: 0,
      });
    }
    members.sort((a, b) => b.created_at.localeCompare(a.created_at));
  } catch (e) {
    console.error("director pending signups", e);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payoutsRes = await (supabaseAdmin as any).from("payouts").select("id, user_id, amount, method, reference, paid_by, created_at").order("created_at", { ascending: false });
  const payouts: { id: string; user_id: string; amount: number; method: string | null; reference: string | null; paid_by: string; created_at: string }[] = payoutsRes.error ? [] : payoutsRes.data ?? [];
  const paidBy = new Map<string, number>();
  for (const p of payouts) paidBy.set(p.user_id, (paidBy.get(p.user_id) ?? 0) + p.amount);
  const nm = (id: string) => nameById.get(id) ?? "—";
  const paymentList = (payments ?? []).map((p) => ({ ...p, member: nm(p.user_id) }));
  const balances = members.filter((m) => m.earnings > 0).map((m) => ({ id: m.id, full_name: m.full_name, phone: m.phone, earned: m.earnings, paid: paidBy.get(m.id) ?? 0, balance: m.earnings - (paidBy.get(m.id) ?? 0) }));
  const approved = (payments ?? []).filter((p) => p.status === "approved");
  return {
    authed: true as const,
    director,
    stats: {
      total: members.length,
      active: members.filter((m) => m.status === "active").length,
      pending: members.filter((m) => m.status !== "active").length,
      revenue: approved.reduce((s, p) => s + (p.amount ?? 0), 0),
      paidOut: (earnings ?? []).reduce((s, e) => s + (e.amount ?? 0), 0),
      pendingPayments: paymentList.filter((p) => p.status === "pending").length,
      disbursed: payouts.reduce((s, p) => s + p.amount, 0),
    },
    members,
    payments: paymentList,
    payouts: payouts.map((p) => ({ ...p, member: nm(p.user_id) })),
    balances,
    payoutsReady: !payoutsRes.error,
  };
});
