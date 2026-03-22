import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/analytics";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const email = session?.user?.email;
  const admin = isAdmin(email);
  console.log("[Admin] email:", email, "isAdmin:", admin, "ADMIN_EMAILS:", process.env.ADMIN_EMAILS);

  if (!email || !admin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/landing/logo_navbar.svg" alt="Ace" width={65} height={40} />
            <h1 className="text-lg font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-[#4d7c0f] transition-colors">
            Back to App
          </a>
        </div>
        <AdminNav />
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
