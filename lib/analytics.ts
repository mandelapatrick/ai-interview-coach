import { supabaseAdmin } from "./supabase";

const DEFAULT_TZ = "America/Los_Angeles";

/** Returns an ISO string for midnight today in the given IANA timezone. */
export function getTodayStartISO(tz: string = DEFAULT_TZ): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(now);
  const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
  const m = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
  const s = parseInt(parts.find((p) => p.type === "second")?.value || "0");
  const todayStart = new Date(now.getTime() - (h * 3600 + m * 60 + s) * 1000);
  todayStart.setMilliseconds(0);
  return todayStart.toISOString();
}

/** Converts a UTC ISO timestamp to a YYYY-MM-DD string in the given timezone. */
export function toDateInTz(isoString: string, tz: string = DEFAULT_TZ): string {
  const d = new Date(isoString);
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
}

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export function getDateRange(range: string): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString();

  // Compute PST midnight today, then subtract N days
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DEFAULT_TZ,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(now);
  const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
  const m = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
  const s = parseInt(parts.find((p) => p.type === "second")?.value || "0");
  const todayMidnight = new Date(now.getTime() - (h * 3600 + m * 60 + s) * 1000);
  todayMidnight.setMilliseconds(0);

  let days: number;
  switch (range) {
    case "7d":
      days = 7;
      break;
    case "90d":
      days = 90;
      break;
    case "30d":
    default:
      days = 30;
      break;
  }

  const start = new Date(todayMidnight.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    start: start.toISOString(),
    end,
  };
}

export async function queryEvents(
  eventName: string,
  startDate: string,
  endDate: string
) {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from("analytics_events")
    .select("*")
    .eq("event_name", eventName)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: true });
  return data || [];
}

export async function countEventsByDay(
  eventName: string,
  startDate: string,
  endDate: string
): Promise<{ date: string; count: number }[]> {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from("analytics_events")
    .select("created_at")
    .eq("event_name", eventName)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    const day = toDateInTz(row.created_at);
    counts[day] = (counts[day] || 0) + 1;
  }

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export async function countLandingPageViewsByDay(
  startDate: string,
  endDate: string
): Promise<{ date: string; count: number }[]> {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from("analytics_events")
    .select("created_at, user_email, anonymous_id")
    .eq("event_name", "page_view")
    .eq("properties->>page", "/")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (!data) return [];

  const dailyVisitors: Record<string, Set<string>> = {};
  for (const row of data) {
    const day = toDateInTz(row.created_at);
    const id = row.user_email || row.anonymous_id;
    if (!id) continue;
    if (!dailyVisitors[day]) dailyVisitors[day] = new Set();
    dailyVisitors[day].add(id);
  }

  return Object.entries(dailyVisitors)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, visitors]) => ({ date, count: visitors.size }));
}

export async function countSessionsByDay(
  startDate: string,
  endDate: string
): Promise<{ date: string; count: number }[]> {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from("usage_tracking")
    .select("created_at")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    const day = toDateInTz(row.created_at);
    counts[day] = (counts[day] || 0) + 1;
  }

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export async function countInterestedUsersByDay(
  startDate: string,
  endDate: string
): Promise<{ date: string; count: number }[]> {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from("analytics_events")
    .select("created_at, user_email, anonymous_id")
    .eq("event_name", "page_view")
    .eq("properties->>page", "/signin")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (!data) return [];

  const dailyVisitors: Record<string, Set<string>> = {};
  for (const row of data) {
    const day = toDateInTz(row.created_at);
    const id = row.user_email || row.anonymous_id;
    if (!id) continue;
    if (!dailyVisitors[day]) dailyVisitors[day] = new Set();
    dailyVisitors[day].add(id);
  }

  return Object.entries(dailyVisitors)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, visitors]) => ({ date, count: visitors.size }));
}

export async function countUniqueUsersByDay(
  eventName: string,
  startDate: string,
  endDate: string
): Promise<{ date: string; count: number }[]> {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from("analytics_events")
    .select("created_at, user_email")
    .eq("event_name", eventName)
    .not("user_email", "is", null)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (!data) return [];

  const dailyUsers: Record<string, Set<string>> = {};
  for (const row of data) {
    const day = toDateInTz(row.created_at);
    if (!dailyUsers[day]) dailyUsers[day] = new Set();
    dailyUsers[day].add(row.user_email);
  }

  return Object.entries(dailyUsers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, users]) => ({ date, count: users.size }));
}
