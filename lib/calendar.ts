import type { TimeRange } from "@/lib/types";

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function timeAt(date: string, minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${date}T${hours}:${mins}:00`;
}

export function demoBusyRanges(date: string): TimeRange[] {
  return [
    { start: `${date}T09:30:00`, end: `${date}T10:20:00` },
    { start: `${date}T11:00:00`, end: `${date}T12:05:00` },
    { start: `${date}T14:00:00`, end: `${date}T15:10:00` },
    { start: `${date}T16:20:00`, end: `${date}T17:00:00` },
  ];
}

export function findMovementGaps(
  date: string,
  workdayStart: string,
  workdayEnd: string,
  busy: TimeRange[],
): TimeRange[] {
  const start = toMinutes(workdayStart);
  const end = toMinutes(workdayEnd);
  const clipped = busy
    .map((range) => ({
      start: new Date(range.start).getHours() * 60 + new Date(range.start).getMinutes(),
      end: new Date(range.end).getHours() * 60 + new Date(range.end).getMinutes(),
    }))
    .filter((range) => range.end > start && range.start < end)
    .sort((a, b) => a.start - b.start);

  const windows: TimeRange[] = [];
  let cursor = start;
  for (const range of clipped) {
    if (range.start - cursor >= 3) {
      const candidateStart = Math.max(cursor, range.start - 7);
      windows.push({ start: timeAt(date, candidateStart), end: timeAt(date, range.start) });
    }
    cursor = Math.max(cursor, range.end);
  }
  if (end - cursor >= 3) {
    windows.push({ start: timeAt(date, cursor), end: timeAt(date, Math.min(end, cursor + 7)) });
  }
  return windows.slice(0, 4);
}

export function zonedDateTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  let guess = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  for (let pass = 0; pass < 2; pass += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(guess)).map((part) => [part.type, part.value]),
    );
    const rendered = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
    );
    guess += Date.UTC(year, month - 1, day, hour, minute) - rendered;
  }
  return new Date(guess);
}
