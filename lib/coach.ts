import type { CoachResponse, EnergyLevel } from "@/lib/types";

const energyRank: Record<EnergyLevel, number> = { low: 0, steady: 1, bright: 2 };

export function deterministicCoach(input: {
  energyBefore: EnergyLevel;
  energyAfter: EnergyLevel;
  reps: number;
}): CoachResponse {
  const change = energyRank[input.energyAfter] - energyRank[input.energyBefore];
  if (change > 0) {
    return {
      headline: "You made space, and it gave something back.",
      encouragement: `${input.reps} steady chair squats and one calmer minute turned this gap into momentum.`,
      nextSuggestion: "Look for one more short opening tomorrow. The same reset is enough.",
    };
  }
  if (change < 0) {
    return {
      headline: "Showing up still counts.",
      encouragement: `You completed the reset and listened to your energy instead of forcing a bigger effort.`,
      nextSuggestion: "Next time, keep the movement smaller or choose the breathing close only.",
    };
  }
  return {
    headline: "A small reset is real progress.",
    encouragement: `You finished ${input.reps} chair squats and gave your body a clean break from the desk.`,
    nextSuggestion: "Repeat this reset in your next clear 3-minute window.",
  };
}
