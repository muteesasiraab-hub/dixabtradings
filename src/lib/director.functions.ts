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

export const getDirectorOverview = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<DirSession>(sessionConfig());
  const director = session.data.director;
  if (!director) return { authed: false as const };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: profiles }, { data: payments }, { data: earnings }] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, full_name, phone, email, referral_code, status, sponsor_id, created_at").order("created_at", { ascending: false }),
    supabaseAdmin.from("payments").select("user_id, amount, status"),
    supabaseAdmin.from("earnings").select("user_id, amount"),
  ]);

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
    },
    members,
  };
});
