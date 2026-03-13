import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin, getDateRange, countUniqueUsersByDay, ensureTodayEntry } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const range = request.nextUrl.searchParams.get("range") || "30d";
  const { start, end } = getDateRange(range);

  const dauSeries = await countUniqueUsersByDay("page_view", start, end);

  // Compute WAU and MAU for each day
  const enriched = dauSeries.map((point) => {
    const pointDate = new Date(point.date);
    const wauStart = new Date(pointDate);
    wauStart.setDate(wauStart.getDate() - 7);
    const mauStart = new Date(pointDate);
    mauStart.setDate(mauStart.getDate() - 30);

    const wau = dauSeries
      .filter((p) => {
        const d = new Date(p.date);
        return d >= wauStart && d <= pointDate;
      })
      .reduce((sum, p) => sum + p.count, 0);

    const mau = dauSeries
      .filter((p) => {
        const d = new Date(p.date);
        return d >= mauStart && d <= pointDate;
      })
      .reduce((sum, p) => sum + p.count, 0);

    return { date: point.date, dau: point.count, wau, mau };
  });

  return NextResponse.json({ series: ensureTodayEntry(enriched, "date", { dau: 0, wau: 0, mau: 0 }) });
}
