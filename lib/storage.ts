import type { SessionResult } from "@/lib/types";

export const SESSION_STORAGE_KEY = "between:v1:sessions";

export function readSessions(): SessionResult[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as SessionResult[]) : [];
  } catch {
    return [];
  }
}

export function saveSession(result: SessionResult): SessionResult[] {
  const next = [result, ...readSessions()].slice(0, 50);
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function sessionsByLocalDay(sessions: SessionResult[], now = new Date()): number[] {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    const key = formatter.format(date);
    return sessions.filter((session) => formatter.format(new Date(session.completedAt)) === key).length;
  });
}
