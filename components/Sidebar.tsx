"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

const BookIcon = () => (
  <svg className="w-4 h-4 text-[#d4af37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const LogoMark = ({ size = "md" }: { size?: "sm" | "md" }) => (
  <div className={`${size === "sm" ? "w-7 h-7" : "w-8 h-8"} bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-lg flex items-center justify-center flex-shrink-0`}>
    <svg
      className={`${size === "sm" ? "w-4 h-4" : "w-5 h-5"} text-[#0f172a]`}
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
      className={`${dim} rounded-full ring-2 ring-[#d4af37]/30 flex-shrink-0`}
    />
  ) : (
    <div className={`${dim} rounded-full bg-[#d4af37]/20 flex items-center justify-center flex-shrink-0`}>
      <svg className="w-4 h-4 text-[#d4af37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
};

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href.split("?")[0]);
  };

  // Desktop nav items (collapse-aware, hover flyout for subitems)
  const DesktopNavItems = () => (
    <ul className="space-y-1 px-2">
      {navItems.map((item) => {
        const active = isActive(item.href);
        const hasSubItems = item.subItems && item.subItems.length > 0;

        if (hasSubItems) {
          return (
            <li key={item.href} className="relative group">
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                  active
                    ? "bg-[#1a2d47] text-[#d4af37]"
                    : "text-white/60 hover:bg-[#1a2d47] hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.name : undefined}
              >
                <span className={active ? "text-[#d4af37]" : ""}>{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="font-medium flex-1">{item.name}</span>
                    <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </>
                )}
              </div>
              {/* Hover flyout submenu */}
              <div className="absolute left-full top-0 ml-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-[#152238] border border-white/10 rounded-xl py-2 min-w-[200px] shadow-xl">
                  {item.subItems!.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:bg-[#1a2d47] hover:text-white transition-all"
                    >
                      <BookIcon />
                      <span className="font-medium">{subItem.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </li>
          );
        }

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                active
                  ? "bg-[#1a2d47] text-[#d4af37]"
                  : "text-white/60 hover:bg-[#1a2d47] hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.name : undefined}
            >
              <span className={active ? "text-[#d4af37]" : ""}>{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  // Mobile nav items (always expanded, subitems inline)
  const MobileNavItems = () => (
    <ul className="space-y-1 px-2">
      {navItems.map((item) => {
        const active = isActive(item.href);
        const hasSubItems = item.subItems && item.subItems.length > 0;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                active
                  ? "bg-[#1a2d47] text-[#d4af37]"
                  : "text-white/60 hover:bg-[#1a2d47] hover:text-white"
              }`}
            >
              <span className={active ? "text-[#d4af37]" : ""}>{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
            {/* Inline sub-items for mobile */}
            {hasSubItems && (
              <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-3">
                {item.subItems!.map((subItem) => (
                  <li key={subItem.href}>
                    <Link
                      href={subItem.href}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                        pathname.startsWith(subItem.href.split("?")[0]) && pathname.includes(subItem.href.split("?")[1] ?? "")
                          ? "text-[#d4af37]"
                          : "text-white/50 hover:text-white hover:bg-[#1a2d47]"
                      }`}
                    >
                      <BookIcon />
                      <span>{subItem.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* ===== DESKTOP SIDEBAR (hidden on mobile) ===== */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 h-screen bg-[#0f172a] border-r border-white/10 flex-col transition-all duration-300 z-50 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className={`p-4 border-b border-white/10 ${collapsed ? "px-3" : ""}`}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <LogoMark />
            {!collapsed && (
              <span className="text-lg font-bold text-white whitespace-nowrap">
                Ace<span className="text-[#d4af37]">Interview</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <DesktopNavItems />
        </nav>

        {/* User Profile */}
        {user && (
          <div className={`px-2 pb-2 ${collapsed ? "px-2" : ""}`}>
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1a2d47]/50 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <UserAvatar user={user} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {user.name || "User"}
                  </div>
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="text-xs text-white/50 hover:text-[#d4af37] transition-colors"
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
        <div className="p-4 border-t border-white/10">
          <button
            onClick={toggleCollapsed}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-[#1a2d47] hover:text-white transition-all w-full ${
              collapsed ? "justify-center" : ""
            }`}
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
            {!collapsed && <span className="font-medium">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ===== MOBILE TOP HEADER (hidden on desktop) ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0f172a] border-b border-white/10 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-white/70 hover:text-white hover:bg-[#1a2d47] transition-all"
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
          <span className="text-base font-bold text-white">
            Ace<span className="text-[#d4af37]">Interview</span>
          </span>
        </Link>

        {user && <UserAvatar user={user} size="sm" />}
      </header>

      {/* ===== MOBILE DRAWER ===== */}
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-screen w-72 bg-[#0f172a] border-r border-white/10 flex flex-col z-50 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation drawer"
      >
        {/* Drawer header */}
        <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <LogoMark />
            <span className="text-lg font-bold text-white">
              Ace<span className="text-[#d4af37]">Interview</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-[#1a2d47] transition-all"
            aria-label="Close navigation menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <MobileNavItems />
        </nav>

        {/* Drawer user profile */}
        {user && (
          <div className="px-2 pb-4 border-t border-white/10 pt-3 flex-shrink-0">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#1a2d47]/50">
              <UserAvatar user={user} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user.name || "User"}
                </div>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-xs text-white/50 hover:text-[#d4af37] transition-colors"
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
