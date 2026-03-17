import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";
import Sidebar from "@/components/Sidebar";
import { getUserOnboarding } from "@/lib/supabase";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  // Redirect first-time users to onboarding
  if (session.user?.email) {
    unstable_noStore();
    const onboarding = await getUserOnboarding(session.user.email);
    if (!onboarding || !onboarding.onboarding_completed) {
      redirect("/onboarding");
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfaf6]">
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
