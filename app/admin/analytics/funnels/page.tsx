"use client";

import { useEffect, useState } from "react";
import FunnelChart from "@/components/admin/FunnelChart";
import DateRangePicker, { buildRangeParams } from "@/components/admin/DateRangePicker";

interface FunnelStep {
  step: string;
  count: number;
}

interface FunnelsData {
  signup: FunnelStep[];
  onboarding: FunnelStep[];
  practice: FunnelStep[];
}

export default function FunnelsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<FunnelsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics/funnels?${buildRangeParams(range)}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 font-display">Funnels</h2>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <FunnelChart
          title="Signup Funnel"
          steps={data?.signup || []}
          loading={loading}
        />
        <FunnelChart
          title="Onboarding Funnel"
          steps={data?.onboarding || []}
          loading={loading}
        />
        <FunnelChart
          title="Practice Funnel"
          steps={data?.practice || []}
          loading={loading}
        />
      </div>
    </div>
  );
}
