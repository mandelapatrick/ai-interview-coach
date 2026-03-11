"use client";

interface KPICardProps {
  label: string;
  subtitle?: string;
  value: string | number;
  trend?: string;
  loading?: boolean;
}

export default function KPICard({ label, subtitle, value, trend, loading }: KPICardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-16" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}
        {subtitle && <span className="block text-xs text-gray-400">{subtitle}</span>}
      </p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {trend && <p className="text-sm text-gray-500 mt-1">{trend}</p>}
    </div>
  );
}
