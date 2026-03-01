"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import PlanBadge from "./PlanBadge";

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
    image?: string | null;
  };
}

const navItems: NavItem[] = [
  {
    name: "Home",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    name: "Question Bank",
    href: "/dashboard/questions",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

const LogoMark = ({ size = "md" }: { size?: "sm" | "md" }) => (
  <div className={`${size === "sm" ? "w-7 h-7" : "w-8 h-8"} bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-lg flex items-center justify-center flex-shrink-0`}>
    <svg
      className={`${size === "sm" ? "w-4 h-4" : "w-5 h-5"} text-white`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  </div>
);

const UserAvatar = ({ user, size = "md" }: { user: SidebarProps["user"]; size?: "sm" | "md" }) => {
  const dim = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  return user?.image ? (
    <img
      src={user.image}
      alt=""
      className={`${dim} rounded-full ring-2 ring-gray-200 flex-shrink-0`}
    />
  ) : (
    <div className={`${dim} rounded-full bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0`}>
      <svg className="w-4 h-4 text-[#d4af37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
};

// Left accent bar for active nav items (Chegg-style)
const ActiveBar = () => (
  <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#d4af37] rounded-r-full" />
);

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

const UpgradeIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ManagePlanIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
  }, [pathname]);

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
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
    <ul className="space-y-1 px-2">
      {navItems.map((item) => {
        const active = isActive(item.href);
        const hasSubItems = item.subItems && item.subItems.length > 0;

        if (hasSubItems) {
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active
                    ? "bg-[#d4af37]/10 text-[#d4af37]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <span className={`flex items-center min-h-[24px] flex-shrink-0 ${active ? "text-[#d4af37]" : ""}`}>{item.icon}</span>
                {!collapsed && (
                  <span className="font-medium flex-1 whitespace-nowrap">{item.name}</span>
                )}
              </Link>
              {/* Inline sub-items */}
              {!collapsed && (
                <ul className="mt-1 ml-4 space-y-1 border-l border-gray-200 pl-3">
                  {item.subItems!.map((subItem) => (
                    <li key={subItem.href}>
                      <Link
                        href={subItem.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
                          isSubItemActive(subItem.href)
                            ? "text-[#d4af37] bg-[#d4af37]/5"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <span>{subItem.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        }

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                active
                  ? "bg-[#d4af37]/10 text-[#d4af37]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              title={collapsed ? item.name : undefined}
            >
              <span className={`flex items-center min-h-[24px] flex-shrink-0 ${active ? "text-[#d4af37]" : ""}`}>{item.icon}</span>
              {!collapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
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
          <li key={item.href} className="relative">
            {active && <ActiveBar />}
            <Link
              href={item.href}
              onClick={hasSubItems ? (e) => { e.preventDefault(); toggleExpanded(item.href); } : undefined}
              className={`flex items-center gap-3 px-5 py-3.5 transition-all duration-150 ${
                active
                  ? "bg-[#d4af37]/10 text-[#d4af37]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className={`flex-shrink-0 ${active ? "text-[#d4af37]" : ""}`}>
                {item.icon}
              </span>
              <span className="font-semibold flex-1 text-[15px]">{item.name}</span>
              {hasSubItems && (
                <span className={active ? "text-[#d4af37]" : "text-gray-400"}>
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
                    <li key={subItem.href} className="relative">
                      {subActive && <ActiveBar />}
                      <Link
                        href={subItem.href}
                        className={`flex items-center gap-3 pl-14 pr-5 py-3 text-sm transition-all duration-150 ${
                          subActive
                            ? "text-[#d4af37] bg-[#d4af37]/5"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
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
        className={`hidden md:flex fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex-col transition-all duration-300 z-50 overflow-hidden ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2 min-h-[32px]">
            <LogoMark />
            {!collapsed && (
              <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
                Ace<span className="text-[#d4af37]">Interview</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <DesktopNavItems />

          {/* Upgrade / Manage Plan */}
          {!subLoading && (
            <div className="px-2 mt-2">
              <Link
                href="/pricing"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  plan === "pro"
                    ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    : "text-[#d4af37] hover:bg-[#d4af37]/10"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? (plan === "pro" ? "Manage Plan" : "Upgrade") : undefined}
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {plan === "pro" ? (
                    <>
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </>
                  ) : (
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  )}
                </svg>
                {!collapsed && (
                  <span className="font-medium whitespace-nowrap">
                    {plan === "pro" ? "Manage Plan" : "Upgrade"}
                  </span>
                )}
              </Link>
            </div>
          )}
        </nav>

        {/* User Profile */}
        {user && (
          <div className="px-2 pb-2">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 min-h-[56px] ${collapsed ? "justify-center" : ""}`}>
              <UserAvatar user={user} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {user.name || "User"}
                    </span>
                    {!subLoading && <PlanBadge plan={plan} />}
                  </div>
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="text-xs text-gray-600 hover:text-[#d4af37] transition-colors"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={toggleCollapsed}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all w-full"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
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
            {!collapsed && <span className="font-medium whitespace-nowrap">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ===== MOBILE TOP HEADER ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
          aria-label="Open navigation menu"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 flex-1">
          <LogoMark size="sm" />
          <span className="text-base font-bold text-gray-900">
            Ace<span className="text-[#d4af37]">Interview</span>
          </span>
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
        className={`md:hidden fixed left-0 top-0 h-[100dvh] w-full bg-white flex flex-col z-50 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation drawer"
      >
        {/* Drawer header */}
        <div className="h-16 px-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
            onClick={() => setMobileOpen(false)}
          >
            <LogoMark />
            <span className="text-lg font-bold text-gray-900">
              Ace<span className="text-[#d4af37]">Interview</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
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
          <MobileNavItems />

          {/* Upgrade / Manage Plan */}
          {!subLoading && (
            <div className="mt-2 relative">
              <Link
                href="/pricing"
                className={`flex items-center gap-3 px-5 py-3.5 transition-all duration-150 ${
                  plan === "pro"
                    ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    : "text-[#d4af37] hover:bg-[#d4af37]/10"
                }`}
              >
                {plan === "pro" ? <ManagePlanIcon /> : <UpgradeIcon />}
                <span className="font-semibold text-[15px]">
                  {plan === "pro" ? "Manage Plan" : "Upgrade"}
                </span>
              </Link>
            </div>
          )}
        </nav>

        {/* Drawer user profile */}
        {user && (
          <div className="border-t border-gray-200 px-4 py-4 flex-shrink-0 bg-white">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50">
              <UserAvatar user={user} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {user.name || "User"}
                  </span>
                  {!subLoading && <PlanBadge plan={plan} />}
                </div>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-xs text-gray-500 hover:text-[#d4af37] transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
