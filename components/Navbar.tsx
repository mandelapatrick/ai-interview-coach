import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            CaseCoach<span className="text-blue-600">AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Companies
            </Link>
            <Link
              href="/history"
              className="text-sm text-gray-600 hover:text-gray-900"
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
                  className="w-8 h-8 rounded-full"
                />
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-gray-700"
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
