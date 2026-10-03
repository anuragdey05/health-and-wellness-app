import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions, googleConfigured } from "@/lib/auth";
import { demoBusyRanges, findMovementGaps, zonedDateTimeToUtc } from "@/lib/calendar";
import type { FreeBusyResponse, TimeRange } from "@/lib/types";

const requestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeZone: z.string().min(1),
  workdayStart: z.string().regex(/^\d{2}:\d{2}$/),
  workdayEnd: z.string().regex(/^\d{2}:\d{2}$/),
});

function localIso(date: Date, timeZone: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

function demoResponse(date: string, start: string, end: string, needsReconnect = false) {
  const busy = demoBusyRanges(date);
  return NextResponse.json<FreeBusyResponse>({
    busy,
    gaps: findMovementGaps(date, start, end, busy),
    source: "demo",
    needsReconnect,
  });
}

export async function POST(request: Request) {
  const body = requestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Check the date, timezone, and workday range." }, { status: 400 });
  }

  const { date, timeZone, workdayStart, workdayEnd } = body.data;
  if (!googleConfigured) return demoResponse(date, workdayStart, workdayEnd);
  const session = await getServerSession(authOptions);
  const expiresAt = session?.googleAccessTokenExpiresAt;
  if (!session?.googleAccessToken || (expiresAt && expiresAt * 1000 <= Date.now())) {
    return demoResponse(date, workdayStart, workdayEnd, Boolean(session));
  }

  try {
    const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.googleAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: zonedDateTimeToUtc(date, workdayStart, timeZone).toISOString(),
        timeMax: zonedDateTimeToUtc(date, workdayEnd, timeZone).toISOString(),
        timeZone,
        items: [{ id: "primary" }],
      }),
      signal: AbortSignal.timeout(4500),
    });

    if (!response.ok) return demoResponse(date, workdayStart, workdayEnd, response.status === 401);
    const payload = (await response.json()) as {
      calendars?: { primary?: { busy?: TimeRange[] } };
    };
    const busy = (payload.calendars?.primary?.busy ?? []).map((range) => ({
      start: localIso(new Date(range.start), timeZone),
      end: localIso(new Date(range.end), timeZone),
    }));
    return NextResponse.json<FreeBusyResponse>({
      busy,
      gaps: findMovementGaps(date, workdayStart, workdayEnd, busy),
      source: "google",
    });
  } catch {
    return demoResponse(date, workdayStart, workdayEnd);
  }
}
