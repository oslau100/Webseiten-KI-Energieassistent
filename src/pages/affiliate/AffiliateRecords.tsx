import { AffiliateLayout, PortalUnavailable } from "@/components/affiliate/AffiliateLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { affiliateT as t } from "@/lib/affiliateI18n";
import { Page } from "./AffiliatePortal";

export default function AffiliateRecords({ type }: { type: "referrals" | "rewards" }) {
  const referrals = type === "referrals";
  return <AffiliateLayout portal><Page title={referrals ? t("referrals") : t("rewards")}><PortalUnavailable />
    {!referrals && <div className="my-5 flex flex-wrap gap-2">{(["pending", "available", "paid", "cancelled"] as const).map(s => <span key={s} className="rounded-full border px-2.5 py-0.5 text-xs font-semibold">{t(s)}</span>)}</div>}
    <Card className="mt-6 hidden md:block"><CardContent className="p-0"><Table><TableHeader><TableRow>{(referrals ? ["Name", t("status"), t("date"), t("lifecycle"), t("amount")] : [t("status"), t("snapshot"), t("date"), t("payoutDate")]).map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody><TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">{referrals ? t("referralsEmpty") : t("rewardsEmpty")}</TableCell></TableRow></TableBody></Table></CardContent></Card>
    <Card className="mt-6 md:hidden"><CardContent className="py-10 text-center text-sm text-muted-foreground">{referrals ? t("referralsEmpty") : t("rewardsEmpty")}</CardContent></Card>
  </Page></AffiliateLayout>;
}
