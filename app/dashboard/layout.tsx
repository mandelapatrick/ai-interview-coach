import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Sidebar user={session?.user} />

      {/* Main content area with left margin for sidebar */}
      <div className="transition-all duration-300 ml-16 lg:ml-56">
        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
