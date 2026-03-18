import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin, getDateRangeFromParams, toDateInTz, excludedEmailsFilter, ensureTodayEntry } from "@/lib/analytics";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const mode = request.nextUrl.searchParams.get("mode") || null;
  const role = request.nextUrl.searchParams.get("role") || null;
  const { start, end } = getDateRangeFromParams(request.nextUrl.searchParams);

  const excludeFilter = excludedEmailsFilter();

  let query = supabaseAdmin
    .from("usage_tracking")
    .select("created_at, session_type, interview_mode, user_email")
    .not("user_email", "in", excludeFilter)
    .gte("created_at", start)
    .lte("created_at", end);

  if (mode) {
    query = query.eq("interview_mode", mode);
  }

  const { data: usageData } = await query;

  // If role filter, get users with that role
  let roleEmails: Set<string> | null = null;
  if (role) {
    const { data: roleData } = await supabaseAdmin
      .from("user_onboarding")
      .select("user_email")
      .eq("role", role)
      .not("user_email", "in", excludeFilter);
    roleEmails = new Set((roleData || []).map((r) => r.user_email));
  }

  const filtered = roleEmails
    ? (usageData || []).filter((r) => roleEmails!.has(r.user_email))
    : usageData || [];

  // Group by day and type
  const practiceByDay: Record<string, number> = {};
  const learnByDay: Record<string, number> = {};

  for (const row of filtered) {
    const day = toDateInTz(row.created_at);
    if (row.session_type === "practice") {
      practiceByDay[day] = (practiceByDay[day] || 0) + 1;
    } else {
      learnByDay[day] = (learnByDay[day] || 0) + 1;
    }
  }

  // Merge into single series
  const allDays = new Set([...Object.keys(practiceByDay), ...Object.keys(learnByDay)]);
  const series = ensureTodayEntry(
    Array.from(allDays)
      .sort()
      .map((date) => ({
        date,
        practice: practiceByDay[date] || 0,
        learn: learnByDay[date] || 0,
      })),
    "date",
    { practice: 0, learn: 0 }
  );

  // Avg sessions per user per week
  const uniqueUsers = new Set(filtered.map((r) => r.user_email));
  const weeks = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (7 * 24 * 60 * 60 * 1000)));
  const avgPerUserPerWeek =
    uniqueUsers.size > 0
      ? Math.round((filtered.length / uniqueUsers.size / weeks) * 10) / 10
      : 0;

  return NextResponse.json({
    series,
    totalPractice: Object.values(practiceByDay).reduce((a, b) => a + b, 0),
    totalLearn: Object.values(learnByDay).reduce((a, b) => a + b, 0),
    avgPerUserPerWeek,
  });
}
