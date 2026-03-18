"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/style.css";

interface DateRangePickerProps {
  value: string;
  onChange: (range: string) => void;
}

const PRESETS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

function parseCustomRange(value: string): DateRange | undefined {
  if (!value.startsWith("custom:")) return undefined;
  const [, startStr, endStr] = value.split(":");
  return {
    from: new Date(startStr + "T00:00:00"),
    to: new Date(endStr + "T00:00:00"),
  };
}

function formatCustomLabel(value: string): string {
  const range = parseCustomRange(value);
  if (!range?.from || !range?.to) return "Custom";
  return `${format(range.from, "MMM d")} – ${format(range.to, "MMM d")}`;
}

export function buildRangeParams(range: string): string {
  if (range.startsWith("custom:")) {
    const [, startDate, endDate] = range.split(":");
    return `startDate=${startDate}&endDate=${endDate}`;
  }
  return `range=${range}`;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<DateRange | undefined>(parseCustomRange(value));
  const containerRef = useRef<HTMLDivElement>(null);
  const isCustom = value.startsWith("custom:");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  function handleSelect(range: DateRange | undefined) {
    setSelected(range);
    if (range?.from && range?.to) {
      const startStr = format(range.from, "yyyy-MM-dd");
      const endStr = format(range.to, "yyyy-MM-dd");
      onChange(`custom:${startStr}:${endStr}`);
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => {
              onChange(preset.value);
              setOpen(false);
              setSelected(undefined);
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              value === preset.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => {
            setOpen(!open);
            if (!isCustom) setSelected(undefined);
          }}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            isCustom
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {isCustom ? formatCustomLabel(value) : "Custom"}
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-3">
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            disabled={{ after: new Date() }}
            numberOfMonths={2}
          />
        </div>
      )}
    </div>
  );
}
