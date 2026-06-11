import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function ReferralCard({
  name,
  code,
  phone,
}: {
  name: string;
  code: string;
  phone: string;
}) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/register?ref=${code}` : "";
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4 no-print">
        <h3 className="font-semibold">Your referral card</h3>
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </div>
      <div className="print-area p-6">
        <div className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/80">
            <span className="grid h-6 w-6 place-items-center rounded bg-white/15 text-[10px] font-bold">AI</span>
            ABBDIC investments
          </div>
          <p className="mt-6 text-xs uppercase text-white/70">Referral code</p>
          <p className="font-mono text-4xl font-bold tracking-widest">{code}</p>
          <div className="mt-6 space-y-1 text-sm">
            <p className="text-white/70">Member</p>
            <p className="font-semibold">{name}</p>
            <p className="text-white/80">{phone}</p>
          </div>
          <p className="mt-6 break-all text-xs text-white/80">{url}</p>
          <p className="mt-4 text-[11px] text-white/60">
            Entry fee UGX 60,000 · Earn UGX 5,000 per referral · 5-level network · Max 3 direct referrals
          </p>
        </div>
      </div>
    </Card>
  );
}
