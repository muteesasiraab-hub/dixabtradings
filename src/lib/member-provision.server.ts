import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function provisionMember(db: SupabaseClient<Database>, input: {
  userId: string; fullName: string; phone: string; email: string; referralCode?: string; founder?: boolean;
}) {
  // This RPC is part of the self-managed SQL setup; generated types are not edited.
  const rpc = db as unknown as { rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: string | null; error: { message: string; code: string } | null }> };
  const { data, error } = await rpc.rpc("provision_member", {
    _user_id: input.userId, _full_name: input.fullName, _phone: input.phone,
    _email: input.email.toLowerCase(), _referral_code: input.referralCode ?? "", _founder: input.founder ?? false,
  });
  if (error || !data) {
    if (error?.code === "PGRST202") throw new Error("Member registration setup must be applied to the members database before registration can continue.");
    throw new Error(error?.message ?? "Registration could not be completed");
  }
  return data;
}