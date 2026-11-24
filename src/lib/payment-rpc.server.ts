import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function paymentRpc(db: SupabaseClient<Database>, name: string, args: Record<string, unknown>) {
  const rpc = db as unknown as { rpc(name: string, args: Record<string, unknown>): PromiseLike<{ error: { code: string; message: string } | null }> };
  const { error } = await rpc.rpc(name, args);
  if (error) throw new Error(error.code === "PGRST202" ? "The company must install the installment payment update before this action is available." : error.message);
}

export async function installmentsReady(db: SupabaseClient<Database>) {
  const rpc = db as unknown as { rpc(name: string): PromiseLike<{ data: boolean | null; error: { code: string } | null }> };
  const { data, error } = await rpc.rpc("installment_payments_ready");
  if (error?.code === "PGRST202") return false;
  if (error) throw new Error("Could not check installment payment availability");
  return data === true;
}
