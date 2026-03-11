import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/analytics";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  // Get all users with signup date
  const { data: users } = await supabaseAdmin
    .from("user_onboarding")
    .select("user_email, created_at")
    .order("created_at", { ascending: true });

  if (!users || users.length === 0) {
    return NextResponse.json({ cohorts: [] });
  }

  // Get all page_view events for retention
  const { data: events } = await supabaseAdmin
    .from("analytics_events")
    .select("user_email, created_at")
    .eq("event_name", "page_view")
    .not("user_email", "is", null);

  // Build user activity map: email -> Set of dates active
  const activityMap: Record<string, Set<string>> = {};
  for (const event of events || []) {
    if (!event.user_email) continue;
    if (!activityMap[event.user_email]) activityMap[event.user_email] = new Set();
    activityMap[event.user_email].add(event.created_at.split("T")[0]);
  }

  // Group users into weekly cohorts
  const cohortMap: Record<string, { email: string; signupDate: Date }[]> = {};
  for (const user of users) {
    const signup = new Date(user.created_at);
    // Get Monday of signup week
    const day = signup.getDay();
    const diff = signup.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(signup);
    monday.setDate(diff);
    const weekKey = monday.toISOString().split("T")[0];

    if (!cohortMap[weekKey]) cohortMap[weekKey] = [];
    cohortMap[weekKey].push({ email: user.user_email, signupDate: signup });
  }

  // Retention periods in days
  const periods = [
    { label: "D1", days: 1 },
    { label: "D3", days: 3 },
    { label: "D7", days: 7 },
    { label: "D14", days: 14 },
    { label: "W4", days: 28 },
  ];

  const cohorts = Object.entries(cohortMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8) // Last 8 weeks
    .map(([week, members]) => {
      const retention: Record<string, number> = {};

      for (const period of periods) {
        let retained = 0;
        for (const member of members) {
          const targetDate = new Date(member.signupDate);
          targetDate.setDate(targetDate.getDate() + period.days);
          const targetStr = targetDate.toISOString().split("T")[0];

          // Check if user was active on or after target date (within a 1-day window)
          const activities = activityMap[member.email];
          if (activities && activities.has(targetStr)) {
            retained++;
          }
        }
        retention[period.label] =
          members.length > 0 ? Math.round((retained / members.length) * 100) : 0;
      }

      return {
        week,
        size: members.length,
        retention,
      };
    });

  return NextResponse.json({ cohorts, periods: periods.map((p) => p.label) });
}
