# PathPilot AI

An AI career-matching copilot. Tell it who you are — by chat or resume — and get 8-12 ranked role matches with plain-English reasoning, plus an AI-drafted pitch for your top 3. Free, fast, and never the same batch twice.

**Live**: [pathpilot-ai-iota.vercel.app](https://pathpilot-ai-iota.vercel.app) · **Demo video**: [demo/pathpilot-ai-demo.mp4](./demo/pathpilot-ai-demo.mp4)

Built as a portfolio piece to demonstrate motion/animation craft, real AI integration (not a mock), and Supabase-as-BaaS competence in one project.

## How it works

1. **Tell it who you are** — a four-question chat wizard or a resume upload (PDF), your choice.
2. **Get a structured profile** — role interest, years of experience, skills, notable projects, preferences. Fully editable before anything else happens.
3. **See ranked matches, with reasons** — Gemini ranks 8-12 roles from a curated pool against your specific profile, with a one-line reason per match that references your actual skills, not generic filler.
4. **Get a pitch** — for your top 3 matches, a personalized outreach pitch streams in live, ready to copy and send.

Anonymous visitors get the full experience with zero signup, persisted to `localStorage` for the session. Signing in (email magic-link or Google) "graduates" that data into Supabase — profile and every match batch persist across visits and devices, with row-level security scoping each user to their own data.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + React 19
- **Google Gemini 2.5 Flash** via the Vercel AI SDK (`generateObject` for structured profile/match extraction, `streamText` for the live pitch)
- **Supabase** — Postgres + Auth (email magic-link, Google OAuth) + Realtime (broadcast channels for live AI-processing status) + Row Level Security
- **Framer Motion**, **GSAP + ScrollTrigger**, **Lenis** for the animation layer
- **React Three Fiber** for an optional 3D hero (see below)
- **Zustand** for anonymous-visitor client state
- Deployed on **Vercel**, email sent via **Resend**

## Architecture decisions worth knowing about

**Gemini, not OpenAI.** The original plan called for GPT-4o. Swapped to Gemini 2.5 Flash so the whole project runs at zero cost — OpenAI requires a card and prepaid credit with no meaningful free tier; Google AI Studio's Gemini API does not.

**localStorage-first, Supabase as an upgrade path.** Anonymous visitors never hit a paywall or a signup wall — the full demo (chat/resume → profile → matches → pitch) works entirely client-side against `localStorage`. Signing in doesn't unlock features; it adds persistence. This was a deliberate design choice so a reviewer trying the site cold gets the complete experience in one sitting.

**Custom SMTP over Supabase's default email sender.** Supabase's built-in email service is rate-limited by design (a couple of emails per hour) specifically to prevent it being used as a free spam relay — fine for occasional testing, not something you'd want a real user (or a reviewer testing the sign-in flow) to hit. Wired up Resend's free tier as custom SMTP instead.

**The 3D hero is real, but shipped disabled.** `src/components/hero/HeroScene3D.tsx` is a working React Three Fiber scene (floating panels, particle field, pointer-reactive tilt) swapped in via `next/dynamic` behind `NEXT_PUBLIC_ENABLE_3D_HERO`. Measured with production Lighthouse before deciding: flag off costs nothing (the 3D chunk is never fetched), flag on drops Performance from the low-90s to 49 (3.4s of blocked main thread from continuous WebGL rendering). Left disabled rather than shipped broken — the fix is switching the R3F `Canvas` to `frameloop="demand"` with manual `invalidate()` calls instead of a continuous 60fps loop, not yet done.

**Live status during AI calls, via Supabase Realtime broadcast — no new table.** Resume parsing, chat profile generation, and match ranking all take several seconds. Rather than a generic spinner, the server pushes short status updates ("Reading your resume…", "Ranking roles that fit your profile…") over a broadcast channel that the client subscribes to per-request. No schema change needed — broadcast channels don't persist anything.

**RLS tested without provisioning multiple accounts.** Row Level Security on `profiles` and `matches` was verified by setting `request.jwt.claims` to an arbitrary UUID in the Supabase SQL editor and confirming zero visible rows, then repeating with the real signed-in user's UUID and confirming full access — the standard Supabase-documented technique for testing RLS policies directly.

## Local setup

```bash
npm install
cp .env.local.example .env.local
# fill in GOOGLE_GENERATIVE_AI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Requires a Supabase project with `supabase/migrations/0001_init.sql` applied (creates `profiles`, `matches`, RLS policies, and a private `resumes` storage bucket).

## What's next

- **3D hero optimization** — switch to on-demand rendering so it can ship enabled without the performance cost.
- **Realtime "who's online" style presence**, or richer live status (progress percentages, not just text) — the broadcast infrastructure is already there.
- Two nice-to-haves explicitly deferred as low priority throughout the build: neither blocks the core product.
