"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import TrackedCTALink from "@/components/TrackedCTALink";
import MobileMenu from "./MobileMenu";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className="fixed top-5 left-0 right-0 z-[100] bg-transparent border-b-0 pointer-events-none">
        <div
          className={`mx-6 md:mx-[60px] flex items-center gap-12 rounded-full pointer-events-auto transition-shadow duration-300 ${
            scrolled
              ? "shadow-[0_4px_32px_rgba(27,27,27,0.14),0_0_0_1px_rgba(27,27,27,0.04)]"
              : "shadow-[0_2px_24px_rgba(27,27,27,0.08),0_0_0_1px_rgba(27,27,27,0.04)]"
          }`}
          style={{ background: "rgba(252,250,246,0.7)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", padding: "14px 16px 14px 28px" }}
        >
          <Link href="/" className="flex items-center flex-shrink-0 w-[65px] h-[40px]">
            <Image src="/landing/logo_navbar.svg" alt="Ace" width={65} height={40} className="w-full h-full object-contain" />
          </Link>
          <ul className="hidden md:flex items-center gap-9 list-none flex-1">
            <li><a href="#features" className="font-sans font-normal text-[15px] text-[#1b1b1b] no-underline transition-opacity hover:opacity-60 whitespace-nowrap">features</a></li>
            <li><a href="#how-it-works" className="font-sans font-normal text-[15px] text-[#1b1b1b] no-underline transition-opacity hover:opacity-60 whitespace-nowrap">how it works</a></li>
            <li><Link href="/pricing" className="font-sans font-normal text-[15px] text-[#1b1b1b] no-underline transition-opacity hover:opacity-60 whitespace-nowrap">pricing</Link></li>
          </ul>
          <div className="flex items-center gap-2.5">
            <TrackedCTALink
              href="/api/auth/signin"
              location="nav"
              className="hidden md:inline-flex items-center gap-2 bg-[#c1f879] text-[#1b1b1b] font-display font-normal text-[15px] rounded-full no-underline whitespace-nowrap flex-shrink-0 transition-opacity hover:opacity-[0.88] px-6 py-[14px]"
            >
              <Image src="/landing/sparkles.svg" alt="" width={18} height={18} />
              start now, free
            </TrackedCTALink>
            <button
              className="md:hidden flex items-center gap-1.5 bg-[#c1f879] text-[#1b1b1b] font-display font-normal text-[15px] px-4 py-1.5 rounded-full border-none cursor-pointer whitespace-nowrap leading-none"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              menu <Image src="/landing/menu-lines.svg" alt="" width={12} height={6} className="block flex-shrink-0" />
            </button>
          </div>
        </div>
      </nav>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
