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

      {/* Main content area — full width on mobile (sidebar becomes a drawer),
          offset by sidebar width on desktop */}
      <div className="transition-all duration-300 pt-14 md:pt-0 md:ml-16 lg:ml-56">
        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
