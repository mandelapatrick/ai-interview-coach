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

  const country = request.nextUrl.searchParams.get("country") || null;
  const { start, end } = getDateRangeFromParams(request.nextUrl.searchParams);

  let query = supabaseAdmin
    .from("user_onboarding")
    .select("created_at, country, role, user_email")
    .not("user_email", "in", excludedEmailsFilter())
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: true });

  if (country) {
    query = query.eq("country", country);
  }

  const { data } = await query;

  // Group by day
  const byDay: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  const byRole: Record<string, number> = {};

  for (const row of data || []) {
    const day = toDateInTz(row.created_at);
    byDay[day] = (byDay[day] || 0) + 1;
    if (row.country) byCountry[row.country] = (byCountry[row.country] || 0) + 1;
    if (row.role) byRole[row.role] = (byRole[row.role] || 0) + 1;
  }

  const daily = ensureTodayEntry(
    Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
    "date",
    { count: 0 }
  );

  return NextResponse.json({
    daily,
    byCountry: Object.entries(byCountry)
      .sort(([, a], [, b]) => b - a)
      .map(([country, count]) => ({ country, count })),
    byRole: Object.entries(byRole)
      .sort(([, a], [, b]) => b - a)
      .map(([role, count]) => ({ role, count })),
    total: data?.length || 0,
  });
}
