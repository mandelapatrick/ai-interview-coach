"use client";

import { useEffect, useState } from "react";
import RetentionTable from "@/components/admin/RetentionTable";

interface RetentionData {
  cohorts: {
    week: string;
    size: number;
    retention: Record<string, number>;
  }[];
  periods: string[];
}

export default function RetentionPage() {
  const [data, setData] = useState<RetentionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics/retention")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 font-display">Retention</h2>
      <RetentionTable
        cohorts={data?.cohorts || []}
        periods={data?.periods || []}
        loading={loading}
      />
    </div>
  );
}
