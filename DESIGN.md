---
name: Between
description: Fitness that fits between everything else.
colors:
  action-coral: "#f16d56"
  action-coral-hover: "#db5944"
  light-canvas: "#f3f4ef"
  light-surface: "#fafbf7"
  light-surface-raised: "#e9eee8"
  light-ink: "#17221c"
  light-muted: "#5e6b63"
  dark-canvas: "#101613"
  dark-surface: "#171f1a"
  dark-surface-raised: "#202a23"
  dark-ink: "#eff3ed"
  success: "#386c4f"
typography:
  display:
    fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.35rem, 5.7vw, 5.7rem)"
    fontWeight: 590
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.7rem"
    fontWeight: 620
    lineHeight: 1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Manrope Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  surface: "16px"
  control: "999px"
  orbit: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.action-coral}"
    textColor: "{colors.light-ink}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "50px"
  panel:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.light-ink}"
    rounded: "{rounded.surface}"
    padding: "28px"
---

# Design System: Between

## Overview

**Creative North Star: “The Available Orbit”**

Between is a calm, operate-first wellness product. The interface treats open time as a visible material: meetings become quiet orbital markers, a movement window becomes the one coral point, and progress accumulates around a seven-day loop. The system is warm without leaning on beige wellness clichés, and technical without borrowing the look of a dashboard.

Brand expression is concentrated in the day orbit, the circular Between mark, and a few state-led Anime.js moments. The rest of the interface stays familiar, readable, and fast enough for someone using a small break between meetings.

**Key Characteristics:**

- Cool mineral surfaces with one coral action voice.
- Circular geometry reserved for time, completion, and compact controls.
- Strong asymmetric composition on wide screens and strict single-column structure on mobile.
- Motion used only to explain state, progress, breath, or feedback.

## Colors

The palette uses a cool porcelain-to-forest neutral range so the coral action color stays unmistakable in both system themes.

### Primary

- **Action Coral:** Primary actions, current openings, rep feedback, and completion emphasis.

### Neutral

- **Mineral Canvas:** The quiet page field in light mode.
- **Forest Canvas:** The low-glare page field in dark mode.
- **Raised Mineral:** Secondary panels and grouped controls.
- **Deep Forest Ink:** Primary text in light mode.
- **Pale Mineral Ink:** Primary text in dark mode.

**The One Signal Rule.** Coral is the only action accent. It never competes with a second decorative hue.

**The Theme Parity Rule.** The same hierarchy and interaction contrast must hold in both system themes.

## Typography

**Display Font:** Manrope Variable (with ui-sans-serif and system fallbacks)  
**Body Font:** Manrope Variable (with ui-sans-serif and system fallbacks)

**Character:** One variable sans family keeps task labels familiar while providing enough weight range for confident, soft-edged display text.

### Hierarchy

- **Display** (590, responsive 3.35-5.7rem, 0.95): The home promise only.
- **Headline** (620, 2.2-4.5rem, 1): Focused session-stage titles.
- **Title** (700, 1.05-1.5rem): Panel and routine names.
- **Body** (400, 1rem, 1.65): Guidance with a maximum comfortable measure around 65 characters.
- **Label** (700, 0.72-0.86rem): Controls, status, and compact metadata.

**The One Family Rule.** Weight, scale, and color create hierarchy; additional display families do not.

## Layout

The home surface uses a two-column grid inside a 1220px maximum container with an asymmetric text-to-orbit balance. The first viewport keeps the main promise, Desk Reset action, and day orbit together. At 900px the structure collapses to one column. At 620px, side padding becomes 14px and all session stages use the full available width without horizontal overflow.

Spacing follows an 8px-forward rhythm, with 16-32px inside functional groups and 48px or more between major reading moments. Rules and whitespace separate secondary information before another panel is introduced.

## Elevation & Depth

Most hierarchy comes from tonal layering. The day orbit and camera workspace receive the single ambient elevation treatment (`0 24px 70px rgba(46, 67, 54, 0.13)` in light mode); ordinary information remains flat.

**The One Lift Rule.** Elevation identifies the current workspace, never every container.

## Shapes

Functional surfaces use a consistent 16px radius. Buttons and compact status controls use a full pill. Circles are semantic: they represent time, a completed check, an orbital day, or an icon-only control. Borders are one pixel and never combined with a competing heavy shadow.

## Components

### Buttons

- **Shape:** Full pill with a 50px minimum height.
- **Primary:** Coral surface, deep ink text, 22px horizontal padding.
- **Hover / Focus:** Darker coral on hover, 3px coral-tinted focus ring, and a 1px active displacement.
- **Secondary:** Surface fill with a single neutral border.

### Cards / Containers

- **Corner Style:** Soft 16px surface radius.
- **Background:** A single tonal step above the canvas.
- **Shadow Strategy:** Ambient elevation only for the day orbit and live camera workspace.
- **Border:** One neutral border or one shadow, not both.
- **Internal Padding:** 16-28px according to density.

### Navigation

The top bar is 64-72px tall, uses the circular brand mark and one account action, and remains a single line. Icon-only session controls have a 42px circular hit target and explicit accessible labels.

### Day Orbit

The orbit is a real availability view. Neutral points are busy blocks, the coral point is the best short opening, and the center carries the next actionable time. It enters in sequence, then stays still.

### Session Stage

Each stage presents one decision or movement at a time. Timers use tabular numerals. Camera status stays attached to the preview, and manual controls remain visible whether camera analysis succeeds or fails.

## Do's and Don'ts

### Do:

- **Do** keep guest mode complete and integrations visibly optional.
- **Do** use circles for time, progress, completion, and compact controls.
- **Do** preserve keyboard focus, reduced motion, system dark mode, and camera-free completion.
- **Do** let motion explain a change in state.

### Don't:

- **Don't** introduce calorie, diagnosis, injury-correction, or body-shaming language.
- **Don't** add a second accent color or decorative glow.
- **Don't** wrap routine metadata in nested cards.
- **Don't** persist camera frames, pose landmarks, or joint angles.
