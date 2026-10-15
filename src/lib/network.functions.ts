import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ENTRY_FEE } from "@/lib/format";
import { paymentReference } from "@/lib/payment-methods";

// Look up a member's email by their Identifier (referral) code — used for login form
export const resolveEmailByIdentifier = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ identifier: z.string().trim().min(2).max(20) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
    const { userId, claims } = context;
    if (data.email.toLowerCase() !== claims.email?.toLowerCase()) {
      throw new Error("Profile email must match the signed-in account");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { provisionMember } = await import("@/lib/member-provision.server");
    const { data: existing } = await context.supabase.from("profiles").select("referral_code").eq("id", userId).maybeSingle();
    if (existing) return { referralCode: existing.referral_code, isFirstUser: false };
    const bootstrapEmail = process.env["DIXAB_BOOTSTRAP_ADMIN_EMAIL"]?.trim().toLowerCase();
    const isFirstUser = Boolean(bootstrapEmail && claims.email?.toLowerCase() === bootstrapEmail);
    const newCode = await provisionMember(supabaseAdmin, { userId, ...data, founder: isFirstUser });

    return { referralCode: newCode, isFirstUser };
  });

// Get current user dashboard data
export const getMyDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) throw new Error("Could not load your member page");
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

    const { data: earnings } = await supabase
      .from("earnings")
      .select("id, amount, level, created_at, source_user_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const totalEarnings = (earnings ?? []).reduce(
      (s, e) => s + (e.amount ?? 0),
      0,
    );

    const { data: latestPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    const { count: directCount } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("sponsor_id", userId);

    const { data: paymentHistory } = await supabase.from("payments").select("*").eq("user_id", userId).order("created_at", { ascending: false });

    return {
      paymentHistory: paymentHistory ?? [],
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
    const { userId, supabase } = context;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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
    z.object({ reference: z.string().trim().min(2).max(70), method: z.enum(["airtel", "mtn"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { data: payment } = await supabase
      .from("payments")
      .select("id, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!payment) throw new Error("No payment record");
    if (payment.status === "approved") throw new Error("Already approved");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: updated, error } = await supabaseAdmin
      .from("payments")
      .update({ reference: paymentReference(data.method, data.reference), status: "pending" })
      .eq("id", payment.id).eq("user_id", userId).neq("status", "approved").select("id");
    if (error || !updated?.length) throw new Error("Payment reference could not be saved. Refresh and try again.");
    return { ok: true };
  });

// Create a member account that is confirmed immediately (no email confirmation step).
export const registerMemberAccount = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        fullName: z.string().trim().min(2).max(100),
        phone: z.string().trim().min(7).max(20),
        email: z.string().trim().email().max(255),
        password: z.string().min(6).max(72),
        referralCode: z.string().trim().max(20).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { provisionMember } = await import("@/lib/member-provision.server");
    const code = (data.referralCode ?? "").trim().toUpperCase();
    const founder = process.env["DIXAB_BOOTSTRAP_ADMIN_EMAIL"]?.trim().toLowerCase();
    const isFounder = Boolean(founder && founder === data.email.toLowerCase());
    // Founding administration requires the existing verified-email signup path.
    if (isFounder) throw new Error("The founding administrator must use a verified account configured by the company.");
    if (!code) throw new Error("Your sponsor's identifier code is required");
    const { data: sponsor, error: sponsorError } = await supabaseAdmin.from("profiles").select("id").eq("referral_code", code).maybeSingle();
    if (sponsorError || !sponsor) throw new Error("Invalid identifier code");
    const { data: account, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.toLowerCase(), password: data.password, email_confirm: true,
      user_metadata: { dixab_registration: { fullName: data.fullName, phone: data.phone, referralCode: code } },
    });
    if (error || !account.user) {
      if (error && /already|registered/i.test(error.message)) throw new Error("This email is already registered — please sign in");
      throw new Error("Account could not be created. Please try again.");
    }
    try {
      const referralCode = await provisionMember(supabaseAdmin, { userId: account.user.id, ...data, referralCode: code });
      return { ok: true, referralCode, amount: ENTRY_FEE };
    } catch (error) {
      const { error: cleanupError } = await supabaseAdmin.auth.admin.deleteUser(account.user.id);
      if (cleanupError) console.error("Incomplete signup cleanup failed", cleanupError.code);
      throw error;
    }
  });
