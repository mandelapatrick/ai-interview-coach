"use client";

import Link from "next/link";
import { track } from "@/lib/analytics-client";

interface TrackedCTALinkProps {
  href: string;
  location: string;
  className?: string;
  children: React.ReactNode;
}

export default function TrackedCTALink({ href, location, className, children }: TrackedCTALinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => track("cta_click", { location })}
    >
      {children}
    </Link>
  );
}
