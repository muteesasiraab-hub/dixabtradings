import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Look up a member's email by their Identifier (referral) code — used for login form
export const resolveEmailByIdentifier = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ identifier: z.string().trim().min(2).max(20) }).parse(input),
  )
  .handler(async ({ data }) => {
    const code = data.identifier.toUpperCase();
    const { data: row } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("referral_code", code)
      .maybeSingle();
    if (!row?.email) throw new Error("Invalid identifier code");
    return { email: row.email };
  });


// Register / create profile after auth signup
export const createProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        fullName: z.string().trim().min(2).max(100),
        phone: z.string().trim().min(7).max(20),
        email: z.string().trim().email().max(255),
        referralCode: z.string().trim().max(20).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Already has profile?
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (existing) throw new Error("Profile already exists");

    // Count total profiles to know if this is the first (bootstrap admin)
    const { count } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    let sponsorId: string | null = null;
    const isFirstUser = (count ?? 0) === 0;

    if (!isFirstUser) {
      const code = (data.referralCode ?? "").trim().toUpperCase();
      if (!code) throw new Error("Referral code is required");
      const { data: sponsor } = await supabaseAdmin
        .from("profiles")
        .select("id, status")
        .eq("referral_code", code)
        .maybeSingle();
      if (!sponsor) throw new Error("Invalid referral code");

      // Enforce 3-direct cap (count all referrals regardless of status)
      const { count: directCount } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("sponsor_id", sponsor.id);
      if ((directCount ?? 0) >= 3) {
        throw new Error("This referral code has reached its 3-person limit");
      }
      sponsorId = sponsor.id;
    }

    // Generate a unique referral code
    let newCode = "";
    for (let i = 0; i < 10; i++) {
      const candidate =
        "AI" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const { data: clash } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("referral_code", candidate)
        .maybeSingle();
      if (!clash) {
        newCode = candidate;
        break;
      }
    }
    if (!newCode) throw new Error("Could not generate referral code");

    const { error: insErr } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      full_name: data.fullName,
      phone: data.phone,
      email: data.email,
      sponsor_id: sponsorId,
      referral_code: newCode,
      status: isFirstUser ? "active" : "pending",
      activated_at: isFirstUser ? new Date().toISOString() : null,
    });
    if (insErr) throw new Error(insErr.message);

    if (isFirstUser) {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
    } else {
      // create a pending payment record
      await supabaseAdmin
        .from("payments")
        .insert({ user_id: userId, amount: 60000, status: "pending" });
    }

    return { referralCode: newCode, isFirstUser };
  });

// Get current user dashboard data
export const getMyDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (!profile) return null;

    // Walk down 5 levels
    const levels: Array<{
      level: number;
      members: Array<{
        id: string;
        full_name: string;
        phone: string;
        status: string;
        referral_code: string;
        created_at: string;
      }>;
    }> = [];
    let currentIds: string[] = [profile.id];
    for (let lvl = 1; lvl <= 5; lvl++) {
      const { data: members } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, phone, status, referral_code, created_at")
        .in("sponsor_id", currentIds);
      const list = members ?? [];
      levels.push({ level: lvl, members: list });
      currentIds = list.map((m) => m.id);
      if (currentIds.length === 0) break;
    }

    const { data: earnings } = await supabaseAdmin
      .from("earnings")
      .select("id, amount, level, created_at, source_user_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const totalEarnings = (earnings ?? []).reduce(
      (s, e) => s + (e.amount ?? 0),
      0,
    );

    const { data: latestPayment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    const { count: directCount } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("sponsor_id", userId);

    return {
      profile,
      levels,
      earnings: earnings ?? [],
      totalEarnings,
      latestPayment,
      isAdmin: !!roleRow,
      directCount: directCount ?? 0,
    };
  });

// Admin: list all pending payments
export const listPendingPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Forbidden");

    const { data: payments } = await supabaseAdmin
      .from("payments")
      .select("id, amount, status, reference, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(200);

    const userIds = (payments ?? []).map((p) => p.user_id);
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, phone, email, referral_code")
      .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    return (payments ?? []).map((p) => ({
      ...p,
      profile: profileMap.get(p.user_id) ?? null,
    }));
  });

// Admin: approve payment (calls SQL function)
export const approvePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ paymentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context; // user-scoped client; SQL function enforces admin
    const { error } = await supabase.rpc("approve_payment", {
      _payment_id: data.paymentId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Submit payment reference (e.g. MoMo transaction id)
export const submitPaymentReference = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ reference: z.string().trim().min(2).max(100) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("id, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!payment) throw new Error("No payment record");
    if (payment.status === "approved") throw new Error("Already approved");
    await supabaseAdmin
      .from("payments")
      .update({ reference: data.reference })
      .eq("id", payment.id);
    return { ok: true };
  });
