"use client";

import { useEffect, useState } from "react";
import KPICard from "@/components/admin/KPICard";
import TimeSeriesChart from "@/components/admin/TimeSeriesChart";
import DateRangePicker from "@/components/admin/DateRangePicker";
import FilterBar from "@/components/admin/FilterBar";

interface SessionsData {
  series: { date: string; practice: number; learn: number }[];
  totalPractice: number;
  totalLearn: number;
  avgPerUserPerWeek: number;
}

interface ActiveUsersData {
  series: { date: string; dau: number; wau: number; mau: number }[];
}

export default function EngagementPage() {
  const [range, setRange] = useState("30d");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sessions, setSessions] = useState<SessionsData | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUsersData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ range });
    if (filters.mode) params.set("mode", filters.mode);
    if (filters.role) params.set("role", filters.role);

    Promise.all([
      fetch(`/api/admin/analytics/sessions?${params}`).then((r) => r.json()),
      fetch(`/api/admin/analytics/active-users?range=${range}`).then((r) => r.json()),
    ])
      .then(([s, a]) => {
        setSessions(s);
        setActiveUsers(a);
      })
      .finally(() => setLoading(false));
  }, [range, filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 font-display">Engagement</h2>
        <div className="flex items-center gap-4">
          <FilterBar
            filters={[
              {
                label: "All Modes",
                key: "mode",
                options: [
                  { label: "Audio", value: "audio" },
                  { label: "Video", value: "video" },
                ],
              },
              {
                label: "All Roles",
                key: "role",
                options: [
                  { label: "Consulting", value: "Consulting" },
                  { label: "Product Management", value: "Product Management" },
                  { label: "Strategy", value: "Strategy" },
                  { label: "Investment Banking", value: "Investment Banking" },
                  { label: "Software Engineering", value: "Software Engineering" },
                ],
              },
            ]}
            values={filters}
            onChange={(key, value) =>
              setFilters((prev) => ({ ...prev, [key]: value }))
            }
          />
          <DateRangePicker value={range} onChange={setRange} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KPICard
          label="Practice Sessions"
          value={sessions?.totalPractice ?? "-"}
          loading={loading}
        />
        <KPICard
          label="Learn Sessions"
          value={sessions?.totalLearn ?? "-"}
          loading={loading}
        />
        <KPICard
          label="Avg Sessions/User/Week"
          value={sessions?.avgPerUserPerWeek ?? "-"}
          loading={loading}
        />
      </div>

      <TimeSeriesChart
        title="Sessions Per Day"
        data={sessions?.series || []}
        lines={[
          { key: "practice", color: "#c1f879", name: "Practice" },
          { key: "learn", color: "#1e3a5f", name: "Learn" },
        ]}
        loading={loading}
      />

      <TimeSeriesChart
        title="DAU / WAU / MAU"
        data={activeUsers?.series || []}
        lines={[
          { key: "dau", color: "#c1f879", name: "DAU" },
          { key: "wau", color: "#22c55e", name: "WAU" },
          { key: "mau", color: "#1e3a5f", name: "MAU" },
        ]}
        type="area"
        loading={loading}
      />
    </div>
  );
}
