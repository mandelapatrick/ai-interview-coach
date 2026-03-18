import { supabaseAdmin } from "./supabase";

const DEFAULT_TZ = "America/Los_Angeles";

/** Returns lowercase emails from PRO_OVERRIDE_EMAILS env var (internal/test accounts). */
export function getExcludedEmails(): string[] {
  return (process.env.PRO_OVERRIDE_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Formats excluded emails for Supabase .not('col', 'in', '(...)') filter. */
export function excludedEmailsFilter(): string {
  return `(${getExcludedEmails().join(",")})`;
}

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

export function getDateRangeFromParams(params: URLSearchParams): { start: string; end: string } {
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");
  if (startDate && endDate) {
    // Convert YYYY-MM-DD dates to PST-aware ISO timestamps
    const startParts = startDate.split("-").map(Number);
    const endParts = endDate.split("-").map(Number);
    // Start: midnight PST on startDate
    const startLocal = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    // End: end of day PST on endDate (use next day midnight)
    const endLocal = new Date(endParts[0], endParts[1] - 1, endParts[2] + 1);
    // Get PST offset by comparing a known date
    const now = new Date();
    const pstOffset = getTimezoneOffsetMs(now, DEFAULT_TZ);
    return {
      start: new Date(startLocal.getTime() + pstOffset).toISOString(),
      end: new Date(endLocal.getTime() + pstOffset).toISOString(),
    };
  }
  const range = params.get("range") || "30d";
  return getDateRange(range);
}

/** Returns offset in ms to convert a local-style Date to UTC for a given timezone. */
function getTimezoneOffsetMs(refDate: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "numeric", minute: "numeric", second: "numeric",
    hour12: false,
  }).formatToParts(refDate);
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || "0");
  const tzNow = new Date(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return refDate.getTime() - tzNow.getTime();
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

/** Ensures the trend array includes an entry for today (PST). Appends {date: today, ...zeroValues} if missing. */
export function ensureTodayEntry<T extends Record<string, unknown>>(
  data: T[],
  dateKey: string = "date",
  zeroTemplate?: Partial<T>
): T[] {
  const today = toDateInTz(new Date().toISOString());
  if (data.some((d) => d[dateKey] === today)) return data;
  const zero = { [dateKey]: today, ...zeroTemplate } as T;
  return [...data, zero];
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
    .not("user_email", "in", excludedEmailsFilter())
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
    .lte("created_at", endDate)
    .not("user_email", "in", excludedEmailsFilter());

  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    const day = toDateInTz(row.created_at);
    counts[day] = (counts[day] || 0) + 1;
  }

  const result = Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
  return ensureTodayEntry(result, "date", { count: 0 });
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

  const excluded = getExcludedEmails();
  const dailyVisitors: Record<string, Set<string>> = {};
  for (const row of data) {
    if (row.user_email && excluded.includes(row.user_email.toLowerCase())) continue;
    const day = toDateInTz(row.created_at);
    const id = row.user_email || row.anonymous_id;
    if (!id) continue;
    if (!dailyVisitors[day]) dailyVisitors[day] = new Set();
    dailyVisitors[day].add(id);
  }

  const result = Object.entries(dailyVisitors)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, visitors]) => ({ date, count: visitors.size }));
  return ensureTodayEntry(result, "date", { count: 0 });
}

export async function countSessionsByDay(
  startDate: string,
  endDate: string
): Promise<{ date: string; count: number }[]> {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from("usage_tracking")
    .select("created_at, user_email")
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .not("user_email", "in", excludedEmailsFilter());

  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    const day = toDateInTz(row.created_at);
    counts[day] = (counts[day] || 0) + 1;
  }

  const result = Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
  return ensureTodayEntry(result, "date", { count: 0 });
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

  const excluded = getExcludedEmails();
  const dailyVisitors: Record<string, Set<string>> = {};
  for (const row of data) {
    if (row.user_email && excluded.includes(row.user_email.toLowerCase())) continue;
    const day = toDateInTz(row.created_at);
    const id = row.user_email || row.anonymous_id;
    if (!id) continue;
    if (!dailyVisitors[day]) dailyVisitors[day] = new Set();
    dailyVisitors[day].add(id);
  }

  const result = Object.entries(dailyVisitors)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, visitors]) => ({ date, count: visitors.size }));
  return ensureTodayEntry(result, "date", { count: 0 });
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
    .not("user_email", "in", excludedEmailsFilter())
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (!data) return [];

  const dailyUsers: Record<string, Set<string>> = {};
  for (const row of data) {
    const day = toDateInTz(row.created_at);
    if (!dailyUsers[day]) dailyUsers[day] = new Set();
    dailyUsers[day].add(row.user_email);
  }

  const result = Object.entries(dailyUsers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, users]) => ({ date, count: users.size }));
  return ensureTodayEntry(result, "date", { count: 0 });
}
