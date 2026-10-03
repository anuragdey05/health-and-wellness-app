import { describe, expect, it } from "vitest";
import { demoBusyRanges, findMovementGaps } from "./calendar";

describe("findMovementGaps", () => {
  it("returns only calendar-sized openings inside the workday", () => {
    const date = "2026-10-03";
    const gaps = findMovementGaps(date, "09:00", "18:00", demoBusyRanges(date));

    expect(gaps.length).toBeGreaterThan(0);
    for (const gap of gaps) {
      const durationMinutes = (new Date(gap.end).getTime() - new Date(gap.start).getTime()) / 60_000;
      expect(durationMinutes).toBeGreaterThanOrEqual(3);
      expect(durationMinutes).toBeLessThanOrEqual(7);
      expect(gap.start >= `${date}T09:00:00`).toBe(true);
      expect(gap.end <= `${date}T18:00:00`).toBe(true);
    }
  });
});
