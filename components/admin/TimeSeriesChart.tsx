"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";

interface TimeSeriesChartProps {
  data: Array<Record<string, unknown>>;
  lines: { key: string; color: string; name: string }[];
  title: string;
  type?: "line" | "area";
  loading?: boolean;
}

export default function TimeSeriesChart({
  data,
  lines,
  title,
  type = "line",
  loading,
}: TimeSeriesChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
        <div className="h-64 bg-gray-100 rounded" />
      </div>
    );
  }

  const Chart = type === "area" ? AreaChart : LineChart;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <Chart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(v) => new Date(v as string).toLocaleDateString()}
          />
          {lines.map((line) =>
            type === "area" ? (
              <Area
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                fill={line.color}
                fillOpacity={0.1}
              />
            ) : (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
              />
            )
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
