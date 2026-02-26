import Link from "next/link";
import { auth } from "@/lib/auth";
import { handleSignOut } from "@/lib/actions";
import NavDropdown from "./NavDropdown";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Ace<span className="text-[#d4af37]">Interview</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <NavDropdown />
            <Link
              href="/history"
              className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors"
            >
              History
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">
                {session.user.name}
              </span>
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-8 h-8 rounded-full ring-2 ring-[#d4af37]/30"
                />
              )}
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
