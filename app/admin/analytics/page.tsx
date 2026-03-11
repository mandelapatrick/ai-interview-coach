"use client";

import { useEffect, useState } from "react";
import KPICard from "@/components/admin/KPICard";
import TimeSeriesChart from "@/components/admin/TimeSeriesChart";
import DateRangePicker from "@/components/admin/DateRangePicker";

interface OverviewData {
  totalUsers: number;
  dau: number;
  landingPageViews: number;
  sessionsToday: number;
  conversionPct: number;
  signupTrend: { date: string; count: number }[];
  dauTrend: { date: string; count: number }[];
  landingTrend: { date: string; count: number }[];
  sessionsTrend: { date: string; count: number }[];
}

export default function OverviewPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics/overview?range=${range}`)
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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Total Registered Users" subtitle="(All-Time)" value={data?.totalUsers ?? "-"} loading={loading} />
        <KPICard label="Landing Page Viewers" subtitle="(Today)" value={data?.landingPageViews ?? "-"} loading={loading} />
        <KPICard label="DAU" subtitle="(Today)" value={data?.dau ?? "-"} loading={loading} />
        <KPICard label="Sessions" subtitle="(Today)" value={data?.sessionsToday ?? "-"} loading={loading} />
        <KPICard
          label="Onboarding Conversion"
          subtitle="(Today)"
          value={data ? `${data.conversionPct}%` : "-"}
          loading={loading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          title="Daily Signups"
          data={data?.signupTrend || []}
          lines={[{ key: "count", color: "#d4af37", name: "Signups" }]}
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
          title="Daily Sessions"
          data={data?.sessionsTrend || []}
          lines={[{ key: "count", color: "#8b5cf6", name: "Sessions" }]}
          type="area"
          loading={loading}
        />
      </div>
    </div>
  );
}
