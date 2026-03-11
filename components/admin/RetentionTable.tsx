"use client";

interface Cohort {
  week: string;
  size: number;
  retention: Record<string, number>;
}

interface RetentionTableProps {
  cohorts: Cohort[];
  periods: string[];
  loading?: boolean;
}

function getCellColor(value: number): string {
  if (value >= 40) return "bg-green-500 text-white";
  if (value >= 25) return "bg-green-400 text-white";
  if (value >= 15) return "bg-yellow-400 text-gray-900";
  if (value >= 5) return "bg-orange-400 text-white";
  if (value > 0) return "bg-red-400 text-white";
  return "bg-gray-100 text-gray-400";
}

export default function RetentionTable({ cohorts, periods, loading }: RetentionTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
        <div className="h-64 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Retention</h3>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 px-3 text-gray-500 font-medium">Week</th>
            <th className="text-center py-2 px-3 text-gray-500 font-medium">Users</th>
            {periods.map((p) => (
              <th key={p} className="text-center py-2 px-3 text-gray-500 font-medium">
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort) => (
            <tr key={cohort.week} className="border-t border-gray-100">
              <td className="py-2 px-3 text-gray-700 font-medium whitespace-nowrap">
                {(() => {
                  const [, m, d] = cohort.week.split("-");
                  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                  return `${months[parseInt(m) - 1]} ${parseInt(d)}`;
                })()}
              </td>
              <td className="py-2 px-3 text-center text-gray-600">{cohort.size}</td>
              {periods.map((period) => {
                const val = cohort.retention[period] || 0;
                return (
                  <td key={period} className="py-2 px-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-medium ${getCellColor(val)}`}
                    >
                      {val}%
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
          {cohorts.length === 0 && (
            <tr>
              <td colSpan={periods.length + 2} className="py-8 text-center text-gray-400">
                No cohort data yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
