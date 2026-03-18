"use client";

import { useEffect, useState } from "react";
import KPICard from "@/components/admin/KPICard";
import TimeSeriesChart from "@/components/admin/TimeSeriesChart";
import BarDistributionChart from "@/components/admin/BarDistributionChart";
import DateRangePicker, { buildRangeParams } from "@/components/admin/DateRangePicker";

interface OverviewData {
  totalUsers: number;
  dau: number;
  landingPageViews: number;
  sessionsToday: number;
  conversionPct: number;
  newSignupsToday: number;
  interestedUsers: number;
  signupTrend: { date: string; count: number }[];
  dauTrend: { date: string; count: number }[];
  landingTrend: { date: string; count: number }[];
  interestedTrend: { date: string; count: number }[];
  sessionsTrend: { date: string; count: number }[];
  byReferralSource: { label: string; count: number }[];
  byRole: { label: string; count: number }[];
  byCountry: { label: string; count: number }[];
}

export default function OverviewPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics/overview?${buildRangeParams(range)}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-display">Overview</h2>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KPICard label="Landing Page Viewers" subtitle="(Today)" value={data?.landingPageViews ?? "-"} loading={loading} />
        <KPICard label="Interested Users" subtitle="(Today)" value={data?.interestedUsers ?? "-"} loading={loading} />
        <KPICard label="New Signups" subtitle="(Today)" value={data?.newSignupsToday ?? "-"} loading={loading} />
        <KPICard
          label="Onboarding Conversion"
          subtitle="(Today)"
          value={data ? `${data.conversionPct}%` : "-"}
          loading={loading}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Total Registered Users" subtitle="(All-Time)" value={data?.totalUsers ?? "-"} loading={loading} />
        <KPICard label="DAU" subtitle="(Today)" value={data?.dau ?? "-"} loading={loading} />
        <KPICard label="Sessions" subtitle="(Today)" value={data?.sessionsToday ?? "-"} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          title="Daily Signups"
          data={data?.signupTrend || []}
          lines={[{ key: "count", color: "#c1f879", name: "Signups" }]}
          type="area"
          loading={loading}
        />
        <TimeSeriesChart
          title="Daily Active Users"
          data={data?.dauTrend || []}
          lines={[{ key: "count", color: "#1e3a5f", name: "DAU" }]}
          type="area"
          loading={loading}
        />
        <TimeSeriesChart
          title="Landing Page Viewers"
          data={data?.landingTrend || []}
          lines={[{ key: "count", color: "#6b8e23", name: "Visitors" }]}
          type="area"
          loading={loading}
        />
        <TimeSeriesChart
          title="Interested Users"
          data={data?.interestedTrend || []}
          lines={[{ key: "count", color: "#e67e22", name: "Interested" }]}
          type="area"
          loading={loading}
        />
        <TimeSeriesChart
          title="Daily Sessions"
          data={data?.sessionsTrend || []}
          lines={[{ key: "count", color: "#8b5cf6", name: "Sessions" }]}
          type="area"
          loading={loading}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <BarDistributionChart
          title="Referral Source"
          data={data?.byReferralSource || []}
          loading={loading}
          color="#8b5cf6"
        />
        <BarDistributionChart
          title="Interested Role"
          data={data?.byRole || []}
          loading={loading}
          color="#e67e22"
        />
        <BarDistributionChart
          title="Country"
          data={data?.byCountry || []}
          loading={loading}
          color="#1e3a5f"
        />
      </div>
    </div>
  );
}
