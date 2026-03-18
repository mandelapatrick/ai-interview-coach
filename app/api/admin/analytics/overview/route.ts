import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin, getDateRangeFromParams, countEventsByDay, countUniqueUsersByDay, countLandingPageViewsByDay, countInterestedUsersByDay, countSessionsByDay, getTodayStartISO, toDateInTz, excludedEmailsFilter, getExcludedEmails, ensureTodayEntry } from "@/lib/analytics";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }

  const { start, end } = getDateRangeFromParams(request.nextUrl.searchParams);

  const excludeFilter = excludedEmailsFilter();

  // Total users
  const { count: totalUsers } = await supabaseAdmin
    .from("user_onboarding")
    .select("*", { count: "exact", head: true })
    .not("user_email", "in", excludeFilter);

  // DAU (unique users with page_view today, PST)
  const todayStartISO = getTodayStartISO();
  const { data: dauData } = await supabaseAdmin
    .from("analytics_events")
    .select("user_email")
    .eq("event_name", "page_view")
    .not("user_email", "is", null)
    .not("user_email", "in", excludeFilter)
    .gte("created_at", todayStartISO);

  const dauSet = new Set(
    (dauData || []).map((r) => r.user_email)
  );

  // Landing page views (unique visitors to /)
  const { data: landingData } = await supabaseAdmin
    .from("analytics_events")
    .select("user_email, anonymous_id")
    .eq("event_name", "page_view")
    .eq("properties->>page", "/")
    .gte("created_at", todayStartISO);

  const excluded = getExcludedEmails();
  const landingSet = new Set(
    (landingData || [])
      .filter((r) => !r.user_email || !excluded.includes(r.user_email.toLowerCase()))
      .map((r) => r.user_email || r.anonymous_id)
  );

  // Interested users (unique visitors to /signin today)
  const { data: interestedData } = await supabaseAdmin
    .from("analytics_events")
    .select("user_email, anonymous_id")
    .eq("event_name", "page_view")
    .eq("properties->>page", "/signin")
    .gte("created_at", todayStartISO);

  const interestedSet = new Set(
    (interestedData || [])
      .filter((r) => !r.user_email || !excluded.includes(r.user_email.toLowerCase()))
      .map((r) => r.user_email || r.anonymous_id)
  );

  // Sessions today
  const { count: sessionsToday } = await supabaseAdmin
    .from("usage_tracking")
    .select("*", { count: "exact", head: true })
    .not("user_email", "in", excludeFilter)
    .gte("created_at", todayStartISO);

  // Conversion today: users who signed up today and completed onboarding
  const { count: signupsToday } = await supabaseAdmin
    .from("user_onboarding")
    .select("*", { count: "exact", head: true })
    .not("user_email", "in", excludeFilter)
    .gte("created_at", todayStartISO);

  const { count: completedToday } = await supabaseAdmin
    .from("user_onboarding")
    .select("*", { count: "exact", head: true })
    .eq("onboarding_completed", true)
    .not("user_email", "in", excludeFilter)
    .gte("created_at", todayStartISO);

  const conversionPct =
    signupsToday && signupsToday > 0
      ? Math.round(((completedToday || 0) / signupsToday) * 100)
      : 0;

  // DAU trend (unique authenticated users per day)
  const dauTrend = await countUniqueUsersByDay("page_view", start, end);

  // Landing page views trend (unique visitors to / per day)
  const landingTrend = await countLandingPageViewsByDay(start, end);

  // Interested users trend (unique visitors to /signin per day)
  const interestedTrend = await countInterestedUsersByDay(start, end);

  // Sessions trend
  const sessionsTrend = await countSessionsByDay(start, end);

  // Fetch actual signups from user_onboarding
  // Device distribution (desktop vs mobile from page_view events)
  const { data: deviceData } = await supabaseAdmin
    .from("analytics_events")
    .select("properties")
    .eq("event_name", "page_view")
    .not("user_email", "in", excludeFilter)
    .gte("created_at", start)
    .lte("created_at", end);

  const byDeviceMap: Record<string, number> = {};
  for (const row of deviceData || []) {
    const device = (row.properties as Record<string, string>)?.device;
    if (device) byDeviceMap[device] = (byDeviceMap[device] || 0) + 1;
  }

  const { data: signups } = await supabaseAdmin
    .from("user_onboarding")
    .select("created_at, referral_source, role, country")
    .not("user_email", "in", excludeFilter)
    .gte("created_at", start)
    .lte("created_at", end);

  const signupsByDay: Record<string, number> = {};
  const byReferralSource: Record<string, number> = {};
  const byRole: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  for (const row of signups || []) {
    const day = toDateInTz(row.created_at);
    signupsByDay[day] = (signupsByDay[day] || 0) + 1;
    if (row.referral_source) byReferralSource[row.referral_source] = (byReferralSource[row.referral_source] || 0) + 1;
    if (row.role) byRole[row.role] = (byRole[row.role] || 0) + 1;
    if (row.country) byCountry[row.country] = (byCountry[row.country] || 0) + 1;
  }

  const signupTrendData = ensureTodayEntry(
    Object.entries(signupsByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
    "date",
    { count: 0 }
  );

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    dau: dauSet.size,
    landingPageViews: landingSet.size,
    interestedUsers: interestedSet.size,
    sessionsToday: sessionsToday || 0,
    newSignupsToday: signupsToday || 0,
    conversionPct,
    signupTrend: signupTrendData,
    dauTrend: dauTrend,
    landingTrend: landingTrend,
    interestedTrend: interestedTrend,
    sessionsTrend: sessionsTrend,
    byReferralSource: Object.entries(byReferralSource)
      .sort(([, a], [, b]) => b - a)
      .map(([label, count]) => ({ label, count })),
    byRole: Object.entries(byRole)
      .sort(([, a], [, b]) => b - a)
      .map(([label, count]) => ({ label, count })),
    byCountry: Object.entries(byCountry)
      .sort(([, a], [, b]) => b - a)
      .map(([label, count]) => ({ label, count })),
    byDevice: Object.entries(byDeviceMap)
      .sort(([, a], [, b]) => b - a)
      .map(([label, count]) => ({ label, count })),
  });
}
