import type { RoutineTemplate } from "@/lib/types";

export const deskReset: RoutineTemplate = {
  id: "desk-reset",
  name: "Desk Reset",
  description: "Loosen your shoulders, wake up your legs, and finish with one calm minute.",
  durationMinutes: 3,
  steps: [
    {
      id: "warmup",
      title: "Shoulder wake-up",
      instruction: "Roll your shoulders back slowly. Keep your jaw soft and let your breath stay easy.",
      durationSeconds: 30,
    },
    {
      id: "squats",
      title: "Chair squats",
      instruction: "Stand in front of a stable chair. Sit toward it, lightly touch, then stand tall.",
      targetReps: 8,
    },
    {
      id: "breathe",
      title: "Settle your breath",
      instruction: "Breathe in as the ring opens. Breathe out as it returns.",
      durationSeconds: 60,
    },
  ],
};
