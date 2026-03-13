import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin, excludedEmailsFilter, getExcludedEmails } from "@/lib/analytics";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const excludeFilter = excludedEmailsFilter();
  const excluded = getExcludedEmails();

  // Total onboarded users
  const { count: totalUsers } = await supabaseAdmin
    .from("user_onboarding")
    .select("*", { count: "exact", head: true })
    .not("user_email", "in", excludeFilter)
    .eq("onboarding_completed", true);

  // Subscriptions breakdown
  const { data: subsRaw } = await supabaseAdmin
    .from("user_subscriptions")
    .select("plan_type, billing_interval, status, user_email");

  const subs = (subsRaw || []).filter(
    (s) => !s.user_email || !excluded.includes(s.user_email.toLowerCase())
  );

  const activePro = (subs || []).filter(
    (s) => s.plan_type === "pro" && s.status === "active"
  );

  const monthly = activePro.filter((s) => s.billing_interval === "monthly").length;
  const yearly = activePro.filter((s) => s.billing_interval === "yearly").length;
  const free = (subs || []).filter((s) => s.plan_type === "free").length;

  const conversionRate =
    totalUsers && totalUsers > 0
      ? Math.round((activePro.length / totalUsers) * 100 * 10) / 10
      : 0;

  return NextResponse.json({
    totalOnboarded: totalUsers || 0,
    totalPro: activePro.length,
    conversionRate,
    plans: [
      { plan: "Free", count: free },
      { plan: "Pro Monthly", count: monthly },
      { plan: "Pro Yearly", count: yearly },
    ],
  });
}
