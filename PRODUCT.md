# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Anime.js, Auth.js, MediaPipe Tasks Vision, and optional OpenAI Responses API. Deployment target: Vercel.

## Users

Desk-bound fitness beginners who want to move during short openings in a workday without planning a conventional workout.

## Product Purpose

Between detects calendar-sized openings and turns them into guided 3-7 minute movement sessions. Success means a first-time visitor can complete a useful reset immediately, without an account or external credentials.

## Positioning

The product treats unclaimed calendar space as the unit of fitness. It adapts a reusable routine and workout-history loop to short, beginner-friendly sessions that fit between existing commitments.

## Operating Context

The primary use case is a desktop or mobile browser during a workday. A guest can use seeded calendar availability. A connected Google account may supply free/busy ranges without event metadata.

## Capabilities and Constraints

- Guest-first Desk Reset with energy check-in, shoulder warm-up, chair squats, breathing close, and completion feedback.
- Chair-squat counting is optional, local-only, and has manual controls.
- Session history is versioned local storage only.
- Google integration reads free/busy ranges only.
- AI coaching is optional and always has a deterministic fallback.
- No medical claims, diagnosis, calorie estimates, or injury-correction claims.

## Brand Commitments

The product is named Between. The tagline is “Fitness that fits between everything else.” The experience is warm, calm, privacy-forward, and kinetic without feeling performative.

## Evidence on Hand

- Product brief: `Mosaic Wellness - CEO's Office - Builder Round.pdf`
- Approved implementation plan supplied in the project conversation.
- No testimonials, customer claims, or clinical evidence are available and none should be fabricated.

## Product Principles

- Let people try the complete value loop before asking them to sign in.
- Turn constraints into confidence: short time, low energy, and no equipment are valid inputs.
- Keep sensitive camera data on the device and persist only the result.
- Degrade integrations visibly and gracefully.
- Reward consistency without guilt, calorie language, or false precision.

## Accessibility & Inclusion

Keyboard access, visible focus, semantic labels, reduced-motion support, responsive layouts, camera-free completion, and plain-language recovery states are required.
