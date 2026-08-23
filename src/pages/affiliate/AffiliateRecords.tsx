import { AffiliateLayout } from "@/components/affiliate/AffiliateLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { affiliateApi, type AffiliateReferral, type AffiliateReward } from "@/lib/affiliateApi";
import { affiliateT as t } from "@/lib/affiliateI18n";
import { useEffect, useState } from "react";
import { Empty, ErrorState, Loading, Page } from "./AffiliatePortal";

export default function AffiliateRecords({ type }: { type: "referrals" | "rewards" }) {
  const referrals = type === "referrals"; const [items, setItems] = useState<(AffiliateReferral | AffiliateReward)[] | null>(null); const [error, setError] = useState(false);
  useEffect(() => { let active = true; const load = referrals ? affiliateApi.referrals() : affiliateApi.rewards(); load.then(value => { if (active) setItems(value); }).catch(() => { if (active) setError(true); }); return () => { active = false; }; }, [referrals]);
  return <AffiliateLayout portal><Page title={referrals ? t("referrals") : t("rewards")}>
    {!items && !error && <Loading />}{error && <ErrorState />}{items && items.length === 0 && <Empty text={referrals ? t("referralsEmpty") : t("rewardsEmpty")} />}
    {items && items.length > 0 && <Card><CardContent className="p-0 overflow-x-auto"><Table><TableHeader><TableRow>{(referrals ? [t("status"), t("date"), t("lifecycle")] : [t("status"), t("snapshot"), t("payoutDate")]).map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>{items.map(item => referrals ? <ReferralRow key={item.id} item={item as AffiliateReferral} /> : <RewardRow key={item.id} item={item as AffiliateReward} />)}</TableBody></Table></CardContent></Card>}
  </Page></AffiliateLayout>;
}
const money = (amount: number, currency: string) => new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(amount);
function ReferralRow({ item }: { item: AffiliateReferral }) { return <TableRow><TableCell>{item.status}</TableCell><TableCell>{item.attributedAt}</TableCell><TableCell>{item.confirmedAt || item.closedAt || item.tariffRecommendedAt || "—"}</TableCell></TableRow>; }
function RewardRow({ item }: { item: AffiliateReward }) { return <TableRow><TableCell>{item.status}</TableCell><TableCell>{money(item.amount, item.currency)}</TableCell><TableCell>{item.paidAt || item.availableAt || "—"}</TableCell></TableRow>; }
