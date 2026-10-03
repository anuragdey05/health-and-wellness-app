"use client";

import {
  ArrowRightIcon,
  CalendarCheckIcon,
  LockSimpleIcon,
  SignOutIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DayOrbit } from "@/components/day-orbit";
import { MomentumOrbit } from "@/components/momentum-orbit";
import { SessionFlow } from "@/components/session-flow";
import { demoBusyRanges, findMovementGaps } from "@/lib/calendar";
import { readSessions, sessionsByLocalDay } from "@/lib/storage";
import type { FreeBusyResponse, SessionResult } from "@/lib/types";

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function initialDay(): FreeBusyResponse {
  const date = localDate();
  const busy = demoBusyRanges(date);
  return {
    busy,
    gaps: findMovementGaps(date, "09:00", "18:00", busy),
    source: "demo",
  };
}

export function BetweenApp({
  signedIn,
  oauthConfigured,
  userName,
}: {
  signedIn: boolean;
  oauthConfigured: boolean;
  userName?: string | null;
}) {
  const [sessionOpen, setSessionOpen] = useState(false);
  const [calendar, setCalendar] = useState<FreeBusyResponse>(initialDay);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarNote, setCalendarNote] = useState<string | null>(null);
  const [history, setHistory] = useState<SessionResult[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setHistory(readSessions()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const refreshCalendar = useCallback(async () => {
    setCalendarLoading(true);
    setCalendarNote(null);
    try {
      const response = await fetch("/api/calendar/freebusy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: localDate(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          workdayStart: "09:00",
          workdayEnd: "18:00",
        }),
      });
      if (!response.ok) throw new Error("Calendar lookup failed");
      const next = (await response.json()) as FreeBusyResponse;
      setCalendar(next);
      if (next.needsReconnect) setCalendarNote("Reconnect Google Calendar to refresh live availability.");
      else if (next.source === "google") setCalendarNote("Free/busy refreshed. No event details were read.");
    } catch {
      setCalendarNote("Using demo availability. Your reset still works.");
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshCalendar(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshCalendar]);

  function handleComplete(result: SessionResult) {
    setHistory((current) => [result, ...current.filter((item) => item.id !== result.id)]);
  }

  if (sessionOpen) {
    return <SessionFlow onClose={() => setSessionOpen(false)} onComplete={handleComplete} />;
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#top">Skip to main content</a>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Between home">
          <span className="brand-mark" aria-hidden />
          <span>Between</span>
        </a>
        <nav aria-label="Account and calendar">
          {signedIn ? (
            <>
              <span className="account-label">{userName ? `Hi, ${userName.split(" ")[0]}` : "Calendar connected"}</span>
              <Link className="nav-action" href="/api/auth/signout"><SignOutIcon aria-hidden size={17} />Sign out</Link>
            </>
          ) : oauthConfigured ? (
            <Link className="nav-action" href="/api/auth/signin/google"><CalendarCheckIcon aria-hidden size={18} />Connect calendar</Link>
          ) : (
            <span className="account-label">Guest mode</span>
          )}
        </nav>
      </header>

      <main id="top" className="home-main">
        <section className="hero-copy" aria-labelledby="hero-title">
          <h1 id="hero-title">Fitness that fits <em>between</em> everything else.</h1>
          <p>Find a clear moment. Match your energy. Finish a three-minute reset without rearranging your day.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setSessionOpen(true)}>
              Try Desk Reset <ArrowRightIcon aria-hidden size={19} weight="bold" />
            </button>
            <span><LockSimpleIcon aria-hidden size={16} weight="duotone" />No account needed</span>
          </div>
        </section>

        <DayOrbit data={calendar} />

        <section className="today-plan" aria-labelledby="today-plan-title">
          <div className="plan-main">
            <div className="plan-symbol"><SparkleIcon aria-hidden size={25} weight="duotone" /></div>
            <div>
              <h2 id="today-plan-title">Desk Reset</h2>
              <p>Shoulders, 8 chair squats, then one quiet minute.</p>
            </div>
          </div>
          <div className="plan-meta">
            <div><strong>3 min</strong><span>Designed for a real workday</span></div>
            <button className="text-button" onClick={() => setSessionOpen(true)}>Start now <ArrowRightIcon aria-hidden size={17} /></button>
          </div>
        </section>

        <MomentumOrbit counts={sessionsByLocalDay(history)} />

        <section className="privacy-note">
          <LockSimpleIcon aria-hidden size={22} weight="duotone" />
          <div>
            <h2>Your camera stays yours.</h2>
            <p>Pose analysis runs locally in your browser. Between stores only your final rep count, never video or body landmarks.</p>
          </div>
        </section>
      </main>

      <footer className="footer" aria-live="polite">
        <p>{calendarNote ?? (calendar.source === "google" ? "Calendar availability is live." : "Demo availability keeps every feature tryable.")}</p>
        <button className="footer-action" onClick={refreshCalendar} disabled={calendarLoading}>
          {calendarLoading ? "Checking availability" : calendar.source === "google" ? "Refresh free/busy" : "Refresh demo day"}
        </button>
      </footer>
    </div>
  );
}
