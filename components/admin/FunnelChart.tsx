"use client";

interface FunnelStep {
  step: string;
  count: number;
}

interface FunnelChartProps {
  title: string;
  steps: FunnelStep[];
  loading?: boolean;
}

export default function FunnelChart({ title, steps, loading }: FunnelChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...steps.map((s) => s.count), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const pct = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
          const dropOff =
            i > 0 && steps[i - 1].count > 0
              ? Math.round(((steps[i - 1].count - step.count) / steps[i - 1].count) * 100)
              : null;

          return (
            <div key={step.step}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">{step.step}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{step.count}</span>
                  {dropOff !== null && dropOff > 0 && (
                    <span className="text-xs text-red-500">-{dropOff}%</span>
                  )}
                </div>
              </div>
              <div className="h-8 bg-gray-100 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#c1f879] to-[#d4ffa0] rounded transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
