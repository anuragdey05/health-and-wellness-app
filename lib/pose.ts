export type Landmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

export type SquatPhase = "unknown" | "standing" | "bottom";

export type SquatState = {
  phase: SquatPhase;
  reps: number;
  lastTransitionAt: number;
};

export type SquatUpdate = SquatState & {
  angle: number | null;
  visible: boolean;
  counted: boolean;
};

const REQUIRED_LANDMARKS = [23, 24, 25, 26, 27, 28] as const;
const VISIBILITY_THRESHOLD = 0.6;
const STANDING_ANGLE = 155;
const BOTTOM_ANGLE = 110;
const TRANSITION_DEBOUNCE_MS = 300;

export function angleDegrees(a: Landmark, b: Landmark, c: Landmark): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const magnitude = Math.hypot(ba.x, ba.y) * Math.hypot(bc.x, bc.y);
  if (!magnitude) return 0;
  const cosine = Math.max(-1, Math.min(1, dot / magnitude));
  return (Math.acos(cosine) * 180) / Math.PI;
}

export function averageKneeAngle(landmarks: Landmark[]): number | null {
  if (landmarks.length < 29) return null;
  const visible = REQUIRED_LANDMARKS.every(
    (index) => (landmarks[index]?.visibility ?? 1) >= VISIBILITY_THRESHOLD,
  );
  if (!visible) return null;
  const left = angleDegrees(landmarks[23], landmarks[25], landmarks[27]);
  const right = angleDegrees(landmarks[24], landmarks[26], landmarks[28]);
  return (left + right) / 2;
}

export function updateSquatState(
  state: SquatState,
  landmarks: Landmark[],
  now: number,
): SquatUpdate {
  const angle = averageKneeAngle(landmarks);
  if (angle === null) return { ...state, angle: null, visible: false, counted: false };

  const elapsed = now - state.lastTransitionAt;
  if (elapsed < TRANSITION_DEBOUNCE_MS) {
    return { ...state, angle, visible: true, counted: false };
  }

  if (angle >= STANDING_ANGLE && state.phase === "unknown") {
    return { phase: "standing", reps: state.reps, lastTransitionAt: now, angle, visible: true, counted: false };
  }

  if (angle <= BOTTOM_ANGLE && state.phase === "standing") {
    return { phase: "bottom", reps: state.reps, lastTransitionAt: now, angle, visible: true, counted: false };
  }

  if (angle >= STANDING_ANGLE && state.phase === "bottom") {
    return { phase: "standing", reps: state.reps + 1, lastTransitionAt: now, angle, visible: true, counted: true };
  }

  return { ...state, angle, visible: true, counted: false };
}
