"use client";

import TrackedCTALink from "@/components/TrackedCTALink";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center gap-8">
      <button
        className="absolute top-4 right-6 bg-transparent border-none text-[28px] cursor-pointer text-[#1b1b1b]"
        onClick={onClose}
        aria-label="Close menu"
      >
        ✕
      </button>
      <a href="#features" onClick={onClose} className="font-sans font-medium text-[20px] text-[#1b1b1b] no-underline">features</a>
      <a href="#how-it-works" onClick={onClose} className="font-sans font-medium text-[20px] text-[#1b1b1b] no-underline">how it works</a>
      <a href="#pricing" onClick={onClose} className="font-sans font-medium text-[20px] text-[#1b1b1b] no-underline">pricing</a>
      <TrackedCTALink
        href="/api/auth/signin"
        location="mobile-menu"
        className="inline-flex items-center gap-2 bg-[#c1f879] text-[#1b1b1b] font-display font-normal text-[16px] px-7 py-3 rounded-full"
      >
        start now, free
      </TrackedCTALink>
    </div>
  );
}
