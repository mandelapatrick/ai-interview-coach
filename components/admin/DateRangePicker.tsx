"use client";

interface DateRangePickerProps {
  value: string;
  onChange: (range: string) => void;
}

const PRESETS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          onClick={() => onChange(preset.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === preset.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
