import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { z } from "zod";
import { deterministicCoach } from "@/lib/coach";
import type { CoachResponse } from "@/lib/types";

const requestSchema = z.object({
  durationMinutes: z.number().min(0).max(30),
  energyBefore: z.enum(["low", "steady", "bright"]),
  energyAfter: z.enum(["low", "steady", "bright"]),
  completedSteps: z.array(z.string()).max(10),
  reps: z.number().int().min(0).max(100),
});

const coachSchema = z.object({
  headline: z.string().max(90),
  encouragement: z.string().max(180),
  nextSuggestion: z.string().max(160),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "The session summary is incomplete." }, { status: 400 });
  }

  const fallback = deterministicCoach(parsed.data);
  if (!process.env.OPENAI_API_KEY) return NextResponse.json<CoachResponse>(fallback);

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 3500, maxRetries: 0 });
    const response = await openai.responses.parse({
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      store: false,
      input: [
        {
          role: "system",
          content:
            "You are the concise completion coach for Between, a beginner movement app. Be warm and concrete. Never make medical, diagnostic, calorie, injury, or fitness-outcome claims. Do not shame the user. Avoid em dashes.",
        },
        { role: "user", content: JSON.stringify(parsed.data) },
      ],
      text: { format: zodTextFormat(coachSchema, "coach_response") },
    });
    return NextResponse.json<CoachResponse>(response.output_parsed ?? fallback);
  } catch {
    return NextResponse.json<CoachResponse>(fallback);
  }
}
