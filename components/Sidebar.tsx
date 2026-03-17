"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { handleSignOut } from "@/lib/actions";

interface SubMenuItem {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  subItems?: SubMenuItem[];
}

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems: NavItem[] = [
  {
    name: "Home",
    href: "/dashboard",
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    name: "Question Bank",
    href: "/dashboard/questions",
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    subItems: [
      { name: "Product Management", href: "/dashboard/questions?track=product-management" },
      { name: "Consulting", href: "/dashboard/questions?track=consulting" },
    ],
  },
  {
    name: "History",
    href: "/dashboard/history",
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    name: "Manage Plan",
    href: "/pricing",
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
];


const LogoMark = ({ size = "md" }: { size?: "sm" | "md" }) => (
  <Image
    src="/ace_white_logo.png"
    alt="Ace"
    width={size === "sm" ? 55 : 65}
    height={size === "sm" ? 34 : 40}
    className="flex-shrink-0"
  />
);

const UserAvatar = ({ user, size = "md" }: { user: SidebarProps["user"]; size?: "sm" | "md" }) => {
  const dim = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return user?.image ? (
    <img
      src={user.image}
      alt=""
      className={`${dim} rounded-full flex-shrink-0`}
    />
  ) : (
    <div className={`${dim} rounded-full bg-[#c1f879] flex items-center justify-center flex-shrink-0`}>
      <span className="text-[#1b1b1b] text-xs font-bold">{initials}</span>
    </div>
  );
};

// Chevron for items with sub-items
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const { plan, loading: subLoading } = useSubscription();

  useEffect(() => {
    const applyCollapsed = () => {
      const isLg = window.innerWidth >= 1024;
      if (isLg) {
        const saved = localStorage.getItem("sidebar-collapsed");
        setCollapsed(saved === "true");
      } else {
        setCollapsed(true);
      }
    };
    applyCollapsed();
    window.addEventListener("resize", applyCollapsed);
    return () => window.removeEventListener("resize", applyCollapsed);
  }, []);

  // Auto-expand the active parent on mount
  useEffect(() => {
    for (const item of navItems) {
      if (item.subItems && pathname.startsWith(item.href.split("?")[0])) {
        setExpandedItem(item.href);
        break;
      }
    }
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, searchParams]);

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/pricing") return pathname === "/pricing";
    return pathname.startsWith(href.split("?")[0]);
  };

  const isSubItemActive = (href: string) => {
    const [path, query] = href.split("?");
    if (!pathname.startsWith(path)) return false;
    if (!query) return true;
    const params = new URLSearchParams(query);
    for (const [key, value] of params.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  };

  const toggleExpanded = (href: string) => {
    setExpandedItem((prev) => (prev === href ? null : href));
  };

  // ── Desktop nav items ──────────────────────────────────────────────────────
  const DesktopNavItems = () => (
    <ul className="space-y-0.5 px-3">
      {navItems.map((item) => {
        const active = isActive(item.href);
        const hasSubItems = item.subItems && item.subItems.length > 0;

        if (hasSubItems) {
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] transition-all ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white/75"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <span className={`flex items-center flex-shrink-0 ${active ? "opacity-100" : "opacity-65"}`}>{item.icon}</span>
                {!collapsed && (
                  <span className="font-medium text-sm flex-1 whitespace-nowrap">{item.name}</span>
                )}
              </Link>
              {/* Inline sub-items */}
              {!collapsed && (
                <ul className="mt-0.5 ml-4 space-y-0.5 pl-3">
                  {item.subItems!.map((subItem) => {
                    const subActive = isSubItemActive(subItem.href);
                    return (
                      <li key={subItem.href}>
                        <Link
                          href={subItem.href}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] transition-all whitespace-nowrap ${
                            subActive
                              ? "text-[#4d7c0f]"
                              : "text-white/40 hover:text-white/60"
                          }`}
                        >
                          <span className={`w-[5px] h-[5px] rounded-sm flex-shrink-0 ${
                            subActive ? "bg-[#c1f879]" : "bg-white/25"
                          }`} />
                          <span className={subActive ? "font-medium" : ""}>{subItem.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        }

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] transition-all ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white/75"
              }`}
              title={collapsed ? item.name : undefined}
            >
              <span className={`flex items-center flex-shrink-0 ${active ? "opacity-100" : "opacity-65"}`}>{item.icon}</span>
              {!collapsed && <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  // ── Mobile nav items ───────────────────────────────────────────────────────
  const MobileNavItems = () => (
    <ul className="space-y-0.5">
      {navItems.map((item) => {
        const active = isActive(item.href);
        const hasSubItems = !!(item.subItems && item.subItems.length > 0);
        const isExpanded = expandedItem === item.href;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={hasSubItems ? (e) => { e.preventDefault(); toggleExpanded(item.href); } : undefined}
              className={`flex items-center gap-3 px-5 py-3.5 transition-all duration-150 ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white/75"
              }`}
            >
              <span className={`flex-shrink-0 ${active ? "opacity-100" : "opacity-65"}`}>
                {item.icon}
              </span>
              <span className="font-semibold flex-1 text-[15px]">{item.name}</span>
              {hasSubItems && (
                <span className={active ? "text-white" : "text-white/40"}>
                  <ChevronIcon open={isExpanded} />
                </span>
              )}
            </Link>

            {/* Sub-items */}
            {hasSubItems && isExpanded && (
              <ul className="pb-1">
                {item.subItems!.map((subItem) => {
                  const subActive = isSubItemActive(subItem.href);
                  return (
                    <li key={subItem.href}>
                      <Link
                        href={subItem.href}
                        className={`flex items-center gap-3 pl-14 pr-5 py-3 text-sm transition-all duration-150 ${
                          subActive
                            ? "text-[#4d7c0f]"
                            : "text-white/40 hover:text-white/60"
                        }`}
                      >
                        <span className={`w-[5px] h-[5px] rounded-sm flex-shrink-0 ${
                          subActive ? "bg-[#c1f879]" : "bg-white/25"
                        }`} />
                        <span>{subItem.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 h-screen bg-[#1b1b1b] flex-col transition-all duration-300 z-50 overflow-hidden ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.08]">
          <Link href="/dashboard" className="flex flex-col min-h-[32px]">
            <LogoMark />
            {!collapsed && (
              <span className="text-[11px] text-white/[0.38] tracking-[0.1px] mt-1">
                Interview Prep Platform
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {!collapsed && (
            <div className="px-5 mb-1.5">
              <span className="text-[10px] font-semibold text-white/30 uppercase tracking-[1px]">
                Main
              </span>
            </div>
          )}
          <DesktopNavItems />
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/[0.08] px-3 pt-3 pb-5">
          {/* User Profile */}
          {user && (
            <div className="border-t border-white/[0.08] pt-3">
              <div className={`flex items-center gap-2.5 px-2 ${collapsed ? "justify-center" : ""}`}>
                <UserAvatar user={user} />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-semibold text-white/[0.88] truncate block">
                      {user.name || "User"}
                    </span>
                    <span className="text-[11px] text-white/[0.38] truncate block">
                      {user.email || ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <div className="px-3 pb-4">
          <button
            onClick={toggleCollapsed}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] text-white/40 hover:bg-white/5 hover:text-white/60 transition-all w-full"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`w-[18px] h-[18px] transition-transform ${collapsed ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
            {!collapsed && <span className="font-medium text-sm whitespace-nowrap">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ===== MOBILE TOP HEADER ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#1b1b1b] flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-white/55 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Open navigation menu"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <Link href="/dashboard" className="flex items-center flex-1">
          <LogoMark size="sm" />
        </Link>

        {user && <UserAvatar user={user} size="sm" />}
      </header>

      {/* ===== MOBILE BACKDROP ===== */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ===== MOBILE DRAWER ===== */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-[100dvh] w-full bg-[#1b1b1b] flex flex-col z-50 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation drawer"
      >
        {/* Drawer header */}
        <div className="h-16 px-5 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
          <Link
            href="/dashboard"
            className="flex flex-col"
            onClick={() => setMobileOpen(false)}
          >
            <LogoMark />
            <span className="text-[11px] text-white/[0.38] tracking-[0.1px] mt-0.5">
              Interview Prep Platform
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close navigation menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <div className="px-5 mb-1.5">
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-[1px]">
              Main
            </span>
          </div>
          <MobileNavItems />
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/[0.08] px-4 py-4 flex-shrink-0">
          {/* User profile */}
          {user && (
            <div className="border-t border-white/[0.08] pt-3">
              <div className="flex items-center gap-2.5 px-2">
                <UserAvatar user={user} />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-white/[0.88] truncate block">
                    {user.name || "User"}
                  </span>
                  <span className="text-[11px] text-white/[0.38] truncate block">
                    {user.email || ""}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
