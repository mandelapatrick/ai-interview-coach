"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function NavDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm text-white/70 hover:text-[#d4af37] transition-colors"
      >
        Interview Prep
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a2d47] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
          <Link
            href="/dashboard/consulting"
            className="block px-4 py-3 hover:bg-[#213754] transition-colors group"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-white group-hover:text-[#d4af37] transition-colors">
                  Consulting
                </div>
                <div className="text-xs text-white/50">
                  MBB & Big 4 case interviews
                </div>
              </div>
            </div>
          </Link>

          <div className="border-t border-white/10" />

          <Link
            href="/dashboard/pm"
            className="block px-4 py-3 hover:bg-[#213754] transition-colors group"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-white group-hover:text-[#d4af37] transition-colors">
                  Product Management
                </div>
                <div className="text-xs text-white/50">
                  FAANG & tech company PMs
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
