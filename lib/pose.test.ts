import { describe, expect, it } from "vitest";
import { angleDegrees, updateSquatState, type Landmark } from "./pose";

function pose(kneeAngle: "standing" | "bottom"): Landmark[] {
  const points = Array.from({ length: 33 }, () => ({ x: 0, y: 0, visibility: 1 }));
  const ankleX = kneeAngle === "standing" ? 0 : 0.94;
  for (const side of [0, 1]) {
    points[23 + side] = { x: 0, y: 0, visibility: 1 };
    points[25 + side] = { x: 0, y: 1, visibility: 1 };
    points[27 + side] = { x: ankleX, y: kneeAngle === "standing" ? 2 : 1.34, visibility: 1 };
  }
  return points;
}

describe("chair squat state machine", () => {
  it("counts exactly one standing to bottom to standing cycle", () => {
    const initial = { phase: "unknown" as const, reps: 0, lastTransitionAt: 0 };
    const standing = updateSquatState(initial, pose("standing"), 400);
    const bottom = updateSquatState(standing, pose("bottom"), 800);
    const complete = updateSquatState(bottom, pose("standing"), 1200);
    expect(standing.phase).toBe("standing");
    expect(bottom.phase).toBe("bottom");
    expect(complete.reps).toBe(1);
    expect(complete.counted).toBe(true);
  });

  it("debounces fast transitions", () => {
    const standing = { phase: "standing" as const, reps: 0, lastTransitionAt: 500 };
    const tooFast = updateSquatState(standing, pose("bottom"), 650);
    expect(tooFast.phase).toBe("standing");
  });

  it("withholds counting when required landmarks are not visible", () => {
    const hidden = pose("standing");
    hidden[25].visibility = 0.2;
    const update = updateSquatState({ phase: "unknown", reps: 0, lastTransitionAt: 0 }, hidden, 400);
    expect(update.visible).toBe(false);
    expect(update.angle).toBeNull();
  });
});

describe("angleDegrees", () => {
  it("returns 180 for a straight joint", () => {
    expect(angleDegrees({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 })).toBe(180);
  });
});
