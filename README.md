# Between

Between is a calendar-aware fitness coach for desk-bound beginners. It turns short openings in the day into guided 3-7 minute movement sessions, with optional local camera-based chair-squat counting.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The complete guest flow works without environment variables.

## Optional Google Calendar connection

Create a Google OAuth Web Application and add these redirect URIs:

- `http://localhost:3000/api/auth/callback/google`
- `https://<your-vercel-domain>/api/auth/callback/google`

Enable the Google Calendar API, configure an External consent screen in Testing mode, add your account as a test user, and set `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`. Between requests only identity scopes and `https://www.googleapis.com/auth/calendar.freebusy`.

## Optional AI coaching

Set `OPENAI_API_KEY`. The coaching route uses a strict structured response and a short timeout. Missing credentials, refusals, timeouts, and provider errors all return deterministic coaching copy through the same contract.

## Privacy

Video frames, pose landmarks, and joint angles stay in browser memory. Only the final rep count and session summary are stored in `between:v1:sessions` in local storage. Calendar event titles, attendees, and descriptions are never requested.
