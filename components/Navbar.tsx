import Link from "next/link";
import { auth } from "@/lib/auth";
import { handleSignOut } from "@/lib/actions";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold text-white">
            AceInterview<span className="text-blue-500">.ai</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Companies
            </Link>
            <Link
              href="/history"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              History
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <span className="text-sm text-gray-400 hidden sm:inline">
                {session.user.name}
              </span>
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              )}
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
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
