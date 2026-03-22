import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { handleSignOut } from "@/lib/actions";
import NavDropdown from "./NavDropdown";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center">
            <Image src="/landing/logo_navbar.svg" alt="Ace" width={65} height={40} />
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <NavDropdown />
            <Link
              href="/history"
              className="text-sm text-gray-600 hover:text-[#4d7c0f] transition-colors"
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
                  className="w-8 h-8 rounded-full ring-2 ring-[#c1f879]/30"
                />
              )}
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-[#4d7c0f] transition-colors"
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
