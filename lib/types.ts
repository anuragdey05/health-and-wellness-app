export type TimeRange = {
  start: string;
  end: string;
};

export type EnergyLevel = "low" | "steady" | "bright";

export type ExerciseStep = {
  id: "warmup" | "squats" | "breathe";
  title: string;
  instruction: string;
  durationSeconds?: number;
  targetReps?: number;
};

export type RoutineTemplate = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  steps: ExerciseStep[];
};

export type PoseStatus =
  | "idle"
  | "loading"
  | "ready"
  | "framing"
  | "standing"
  | "bottom"
  | "unavailable"
  | "denied";

export type SessionResult = {
  id: string;
  routineId: string;
  routineName: string;
  completedAt: string;
  durationSeconds: number;
  reps: number;
  energyBefore: EnergyLevel;
  energyAfter: EnergyLevel;
  completedSteps: string[];
};

export type CoachResponse = {
  headline: string;
  encouragement: string;
  nextSuggestion: string;
};

export type FreeBusyResponse = {
  busy: TimeRange[];
  gaps: TimeRange[];
  source: "google" | "demo";
  needsReconnect?: boolean;
};
