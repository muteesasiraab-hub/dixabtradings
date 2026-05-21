import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listPendingPayments, approvePayment, getMyDashboard } from "@/lib/network.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UGX } from "@/lib/format";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getDash = useServerFn(getMyDashboard);
  const listFn = useServerFn(listPendingPayments);
  const approveFn = useServerFn(approvePayment);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { navigate({ to: "/login" }); return; }
      const dash = await getDash();
      if (!dash?.isAdmin) { toast.error("Admins only"); navigate({ to: "/dashboard" }); return; }
      setReady(true);
    })();
  }, [navigate, getDash]);

  const payments = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => listFn(),
    enabled: ready,
  });

  const approveMut = useMutation({
    mutationFn: (paymentId: string) => approveFn({ data: { paymentId } }),
    onSuccess: () => {
      toast.success("Payment approved · earnings credited up to 5 levels");
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ready) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin · Payments</h1>
        <p className="text-sm text-muted-foreground">Approve member payments. Each approval activates the member and credits UGX 5,000 to up to 5 ancestor levels.</p>
      </div>

      {payments.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      <div className="space-y-3">
        {(payments.data ?? []).map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{p.profile?.full_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{p.profile?.phone} · {p.profile?.email}</p>
                <p className="mt-1 text-xs">Code: <span className="font-mono">{p.profile?.referral_code}</span></p>
                {p.reference && <p className="mt-1 text-xs">Ref: <span className="font-mono">{p.reference}</span></p>}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold">{UGX(p.amount)}</p>
                  <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>
                    {p.status}
                  </Badge>
                </div>
                {p.status === "pending" && (
                  <Button onClick={() => approveMut.mutate(p.id)} disabled={approveMut.isPending}>
                    Approve
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {payments.data && payments.data.length === 0 && (
          <p className="text-sm text-muted-foreground">No payments yet.</p>
        )}
      </div>
    </div>
  );
}
