"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate, stagger } from "animejs";
import { ArrowUpRightIcon, CalendarBlankIcon, ClockIcon } from "@phosphor-icons/react";
import type { FreeBusyResponse, TimeRange } from "@/lib/types";

function minutesFromRange(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const [, time = "09:00"] = value.split("T");
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  }
  return date.getHours() * 60 + date.getMinutes();
}

function polarPosition(range: TimeRange) {
  const workdayStart = 9 * 60;
  const workdayLength = 9 * 60;
  const midpoint = (minutesFromRange(range.start) + minutesFromRange(range.end)) / 2;
  const angle = ((midpoint - workdayStart) / workdayLength) * 300 - 150;
  return {
    transform: `rotate(${angle}deg) translateY(-8.45rem) rotate(${-angle}deg)`,
  };
}

function formatTime(value: string) {
  const [, time = value] = value.split("T");
  const [hour, minute] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(
    new Date(2026, 0, 1, hour, minute),
  );
}

export function DayOrbit({ data }: { data: FreeBusyResponse }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    if (!rootRef.current || reduceMotion) return;
    const animation = animate(rootRef.current.querySelectorAll("[data-orbit-piece]"), {
      opacity: [0, 1],
      scale: [0.82, 1],
      delay: stagger(75),
      duration: 650,
      ease: "out(4)",
    });
    return () => {
      animation.pause();
    };
  }, [data, reduceMotion]);

  const bestGap = data.gaps[0];

  return (
    <section className="orbit-panel" aria-labelledby="day-orbit-title">
      <div className="section-heading">
        <div>
          <h2 id="day-orbit-title">Your day has room.</h2>
          <p>{data.source === "google" ? "Live free/busy calendar" : "A private demo day"}</p>
        </div>
        <span className="source-label">
          <CalendarBlankIcon aria-hidden size={17} weight="duotone" />
          {data.source === "google" ? "Google connected" : "Demo availability"}
        </span>
      </div>

      <div className="orbit-stage" ref={rootRef}>
        <div className="orbit-ring" aria-hidden>
          {data.busy.slice(0, 6).map((range, index) => (
            <span
              className="orbit-block"
              data-orbit-piece
              key={`${range.start}-${index}`}
              style={polarPosition(range)}
            />
          ))}
          {bestGap ? (
            <span className="orbit-gap" data-orbit-piece style={polarPosition(bestGap)} />
          ) : null}
        </div>
        <div className="orbit-center">
          <span>Next opening</span>
          <strong>{bestGap ? formatTime(bestGap.start) : "After work"}</strong>
          <small>{bestGap ? "7 minutes clear" : "No short gap found"}</small>
        </div>
        <span className="orbit-time orbit-time-start">9</span>
        <span className="orbit-time orbit-time-mid">1</span>
        <span className="orbit-time orbit-time-end">6</span>
      </div>

      <div className="opening-row">
        <span className="opening-icon"><ClockIcon aria-hidden size={20} weight="duotone" /></span>
        <div>
          <strong>{bestGap ? `${formatTime(bestGap.start)} opening` : "Tomorrow is another day"}</strong>
          <span>{bestGap ? "Enough for a Desk Reset" : "We will keep the plan light"}</span>
        </div>
        <ArrowUpRightIcon aria-hidden size={20} />
      </div>
    </section>
  );
}
