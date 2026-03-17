"use client";

import { useEffect, useState } from "react";
import KPICard from "@/components/admin/KPICard";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

interface MonetizationData {
  totalOnboarded: number;
  totalPro: number;
  conversionRate: number;
  plans: { plan: string; count: number }[];
}

const COLORS = ["#9ca3af", "#c1f879", "#1e3a5f"];

export default function MonetizationPage() {
  const [data, setData] = useState<MonetizationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics/monetization")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 font-display">Monetization</h2>

      <div className="grid grid-cols-3 gap-4">
        <KPICard
          label="Onboarded Users"
          value={data?.totalOnboarded ?? "-"}
          loading={loading}
        />
        <KPICard
          label="Pro Subscribers"
          value={data?.totalPro ?? "-"}
          loading={loading}
        />
        <KPICard
          label="Conversion Rate"
          value={data ? `${data.conversionRate}%` : "-"}
          loading={loading}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h3>
        {loading ? (
          <div className="h-64 bg-gray-100 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data?.plans || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="plan" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(data?.plans || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
