import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin, getDateRangeFromParams, excludedEmailsFilter, getExcludedEmails } from "@/lib/analytics";
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
  const excluded = getExcludedEmails();

  // Helper to count unique users for an event
  async function countUniqueForEvent(eventName: string, properties?: Record<string, string>) {
    let query = supabaseAdmin!
      .from("analytics_events")
      .select("user_email, anonymous_id")
      .eq("event_name", eventName)
      .gte("created_at", start)
      .lte("created_at", end);

    if (properties) {
      for (const [key, value] of Object.entries(properties)) {
        query = query.contains("properties", { [key]: value });
      }
    }

    const { data } = await query;
    const unique = new Set(
      (data || [])
        .filter((r) => !r.user_email || !excluded.includes(r.user_email.toLowerCase()))
        .map((r) => r.user_email || r.anonymous_id)
    );
    return unique.size;
  }

  // Signup funnel
  const landingViews = await countUniqueForEvent("page_view", { page: "/" });
  const ctaClicks = await countUniqueForEvent("cta_click");
  const authStarts = await countUniqueForEvent("google_auth_start");
  const { count: signups } = await supabaseAdmin
    .from("user_onboarding")
    .select("*", { count: "exact", head: true })
    .not("user_email", "in", excludeFilter)
    .gte("created_at", start)
    .lte("created_at", end);

  // Onboarding funnel
  const roleStep = await countUniqueForEvent("onboarding_step", { step: "role" });
  const referralStep = await countUniqueForEvent("onboarding_step", { step: "referral" });
  const practiceStep = await countUniqueForEvent("onboarding_step", { step: "practice" });

  // Practice funnel
  const modeSelects = await countUniqueForEvent("mode_select");
  const practiceStarts = await countUniqueForEvent("practice_start");
  const assessmentViews = await countUniqueForEvent("assessment_view");

  return NextResponse.json({
    signup: [
      { step: "Landing Page", count: landingViews },
      { step: "CTA Click", count: ctaClicks },
      { step: "Auth Start", count: authStarts },
      { step: "Signed Up", count: signups || 0 },
    ],
    onboarding: [
      { step: "Role Selection", count: roleStep },
      { step: "Referral Source", count: referralStep },
      { step: "Practice Step", count: practiceStep },
    ],
    practice: [
      { step: "Mode Select", count: modeSelects },
      { step: "Practice Start", count: practiceStarts },
      { step: "Assessment View", count: assessmentViews },
    ],
  });
}
