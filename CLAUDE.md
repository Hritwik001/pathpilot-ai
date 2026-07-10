@AGENTS.md

# PathPilot AI — Project Handoff / Context Doc

**Read this first if you're picking up this project in a new chat session.** This file exists specifically because the previous session was approaching context limits mid-Phase-5. Update it whenever you complete a phase or hit a meaningful checkpoint, so the next session (or a fresh chat) never has to re-derive this from scratch.

## What this project is

A portfolio piece: an AI career-matching copilot ("PathPilot AI") built to demonstrate elite animation/motion design, real AI integration (Gemini + streaming + structured output), and Supabase-as-BaaS competence, all in one project. It's meant to sit alongside other case studies (KitchenFlow, RevenuePulse, SupportDesk) linked from a separate portfolio site at `D:\Prospera_Technologies\Velora_Labs\Level_1\Frontend_Portfolio` — **this project does not touch that repo**; it's fully standalone.

Full original spec/plan is in the conversation history that led to this build (not re-copied here — this doc is a state snapshot, not the spec). The short version: chat-or-resume onboarding → AI-extracted editable profile → AI-ranked job matches with reasoning → streamed AI-drafted pitch for top 3 → (this phase) Supabase auth so signed-in users' data persists across visits.

## Locations

- **Local repo**: `D:\Prospera_Technologies\Velora_Labs\Level_1\pathpilot-ai`
- **GitHub**: https://github.com/Hritwik001/pathpilot-ai (public)
- **Live deploy**: https://pathpilot-ai-iota.vercel.app (Vercel project `pathpilot-ai` under team `hritwiks-projects` / org `Hritwik's projects`)
- **Supabase project**: name `pathpilot-ai`, org `hritwik-org`, project ref `rlpchxqicnysbrcilgcz`, region Northeast Asia (Seoul). Dashboard: https://supabase.com/dashboard/project/rlpchxqicnysbrcilgcz

## Cost/account constraints (already decided, don't re-litigate)

- **LLM provider is Google Gemini, NOT OpenAI** — the original spec said OpenAI GPT-4o, but the user wants this entirely free, and OpenAI requires a card + prepaid credit. Swapped to Gemini 2.5 Flash via `@ai-sdk/google`. This was an explicit user-approved deviation from the original spec.
- The agent (Claude) cannot create accounts, log in, enter passwords, or accept ToS/consent modals on the user's behalf — the user does that part in the shared browser session, then the agent drives the rest of the dashboard UI (clicking, filling non-credential fields, running SQL, etc.).
- Google's AI Studio has bot-detection that blocks automated API-key creation clicks ("The request is suspicious") — if this happens again, don't retry-loop it, ask the user to click Create Key themselves.

## Tech stack as actually installed (versions matter — these are all newer than typical training-data knowledge)

- **Next.js 16.2.10** App Router — NOT Next.js 15. Real breaking changes vs. 15 that were already discovered and applied this build:
  - `middleware.ts` → **`proxy.ts`** (root-level file, exports `async function proxy(request)`, not `middleware`). Hardcoded to nodejs runtime, edge unsupported.
  - Turbopack is the default for dev/build, no flag needed.
  - Do **not** set `cacheComponents: true` in `next.config.ts` — this app is all dynamic/auth-gated, default dynamic rendering is correct.
  - `cookies()`, `headers()`, `params`, `searchParams` are **fully async everywhere**, always `await`.
  - `revalidateTag` needs a second `cacheLife` arg now — we avoid it entirely, using `revalidatePath` instead where needed.
  - `next/image`: use `remotePatterns` not deprecated `domains`.
  - `next.config.ts` has `serverExternalPackages: ["pdf-parse", "pdfjs-dist"]` — **required**, without it pdf-parse's internal pdfjs-dist worker file resolution breaks under Turbopack's server bundling with "Setting up fake worker failed". Do not remove this.
- **AI SDK (`ai` package) v7.0.17**, **`@ai-sdk/google` v4.0.9** — also has real deltas vs. older training knowledge:
  - Provider factory is `createGoogle`, not `createGoogleGenerativeAI`; the pre-built instance is `google` from `@ai-sdk/google`.
  - `generateObject({ model, schema, prompt })` — same as before, `schema` param unchanged.
  - Tool `parameters` field renamed to `inputSchema` (not used in this project currently, no tools/function-calling implemented).
  - `result.toTextStreamResponse()` still works for streaming plain text (used for the pitch route) — deprecated but functional, fine for now.
  - `@ai-sdk/react`'s `useChat` needs a `transport: new DefaultChatTransport({ api })` now instead of `{ api }` directly — **not used in this project**, the onboarding chat is a hand-rolled Q&A wizard, not `useChat`, so this doesn't apply here, just noting it in case a future feature adds real chat UI.
  - Model string used: `"gemini-2.5-flash"`.
- **pdf-parse v2.4.5** — completely different API from v1. `import { PDFParse } from "pdf-parse"; const parser = new PDFParse({ data: buffer }); const { text } = await parser.getText(); await parser.destroy();` NOT the old `pdf(buffer).then(...)` pattern.
- **@supabase/ssr v0.12.0** — current API is `createServerClient(url, key, { cookies: { getAll, setAll } })`, NOT the older `{ get, set, remove }` pattern. `getAll`/`setAll` can be async (works fine with Next 16's async `cookies()`).
- **Lenis v1.x** for smooth scroll — has a built-in `anchors: true` option that must be enabled, otherwise plain `<a href="#hash">` links silently break (Lenis intercepts scroll handling and native anchor jumps land in the wrong place). Already fixed and enabled in `LenisProvider.tsx`.
- **GSAP + ScrollTrigger** for the landing page's pinned scroll-story section, with `snap` config so steps land on discrete fully-visible states rather than continuous blend.
- **Zustand + persist middleware** (localStorage) for client-side state — `onboarding-store.ts` (profile) and `matches-store.ts` (matches). This is the anonymous-visitor persistence layer; Phase 5 adds Supabase as an upgrade path for signed-in users, without removing the localStorage path (anonymous visitors should still get the full demo).

## Known environment gotcha (testing limitation, not an app bug)

The Chrome tab used for browser-based testing in this session frequently reports `document.visibilityState: "hidden"` / `document.hasFocus(): false` — it's a backgrounded tab from the OS's perspective (the user has many other tabs/windows open). `requestAnimationFrame` is fully suspended by Chrome in backgrounded tabs, which stalls anything driven by rAF: Framer Motion's `AnimatePresence` exit-then-mount transitions, Lenis's `scrollTo` animation, GSAP's ticker. Symptom: a click correctly updates React state (verifiable via fiber inspection or by checking `localStorage`/network requests directly) but the visible page appears stuck for 10-20+ seconds, or indefinitely, until the tab happens to regain focus.

**Don't mistake this for a real bug.** When testing something animation-dependent and it looks stuck:
1. Check the actual data/state first (localStorage, a direct API curl call, React fiber `memoizedState`) before concluding something is broken.
2. If verifying visually is important, ask the user to check in their own actively-focused browser tab — that's the only fully reliable way to confirm an animation/transition completes, since this constraint is unfixable from within the automated session.
3. Don't try to "wait it out" indefinitely — sometimes it resolves in ~8-10s, sometimes not at all in a reasonable window.

## Phase status

### ✅ Phase 0 — Scaffold + deploy (done)
Next.js 16 app scaffolded, all deps installed, pushed to GitHub, deployed to Vercel.

### ✅ Phase 1 — Animated landing page (done)
Cursor-reactive CSS-3D hero (`components/hero/HeroSceneCSS.tsx`), staggered blur-reveal headline (`components/motion/RevealText.tsx` — gradient-text classes must go on the innermost `motion.span`, NOT an outer wrapper, or `bg-clip-text` silently fails), Lenis smooth scroll, pinned GSAP scroll-story section with discrete snap steps (`components/sections/ScrollStory.tsx`), count-up stats, magnetic buttons. Lighthouse (production build): **Performance 93, Accessibility 100, Best Practices 96, SEO 100**.

Fixed along the way: scroll jank from `backdrop-filter` on a fixed navbar + on hero cards with per-frame JS-driven transforms (removed backdrop-filter, use solid/translucent backgrounds instead — backdrop-filter recompute cost is the recurring root cause any time this user reports scroll jank); the hero's pointer-tracking rAF loop is gated by an `IntersectionObserver` so it stops running once scrolled past the hero.

### ✅ Phase 2 — Onboarding UI on mocks (done, later upgraded in Phase 3)
Chat wizard (4 fixed questions, typewriter-streamed via a local mock, not AI-generated — the questions themselves don't need AI) + resume upload (drag/drop or click, PDF only). Both converge on an editable profile page. `lib/ai/mock.ts` still exists and is used as a **fallback** if the real API call fails (try/catch → mock), not just historical — keep it.

### ✅ Phase 3 — Real Gemini wiring (done)
`/api/onboarding/chat` and `/api/resume/parse` now call real Gemini via `generateObject` against `ProfileSchema` (`lib/ai/schemas.ts`). Verified via curl and full browser flow, both locally and on the live Vercel deployment. `GOOGLE_GENERATIVE_AI_API_KEY` is set in both `.env.local` (local, gitignored) and Vercel's project environment variables (Production + Preview).

### ✅ Phase 4 — Job matches + streamed pitch (done)
`/api/matches/generate` picks 8-12 ranked matches from a curated 40-role pool (`lib/ai/role-archetypes.ts`) via `generateObject` against `MatchBatchSchema`. `/api/matches/[id]/pitch` streams a personalized pitch via `streamText` + `toTextStreamResponse()` for the top 3 matches (`components/matches/MatchCard.tsx` reads the stream manually via `response.body.getReader()`, no `useChat` needed). Matches persist in `matches-store.ts` (localStorage). "Refresh matches" regenerates a batch excluding every previously-seen role title (`allSeenRoleTitles()` in the store) — this is the **client-side, single-session preview** of the "no repeats" behavior; Phase 5 makes it properly persistent/cross-day via Supabase. Verified end-to-end on both local and live deployment (curl + browser, including confirming zero role-title overlap between two consecutive batches).

Small UX fix bundled into this phase: Lenis anchor-link bug (see above) affecting "See how it works".

### ✅ Phase 5 — Supabase auth + persistence (done)

**What's confirmed done:**
- Supabase project created: `pathpilot-ai`, ref `rlpchxqicnysbrcilgcz`, org `hritwik-org`. User is signed in via GitHub.
- Publishable (anon-equivalent) key obtained: this project uses Supabase's **newer key system** ("Publishable key" / "Secret keys"), not the legacy anon/service_role JWTs. The publishable key value has been added to `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`. (Naming kept as `ANON_KEY` for convention even though technically it's the "publishable key" now — same role: safe to expose client-side, RLS-protected.)
- `NEXT_PUBLIC_SUPABASE_URL` set to `https://rlpchxqicnysbrcilgcz.supabase.co` — **verified correct**: resolves and returns `401` from `/rest/v1/` (expected without an API key), confirmed live in a new session.
- No service-role/secret key was captured or is planned to be used — this app only ever needs the user's own authenticated session + RLS, never admin/bypass-RLS access.
- **Migration successfully run against the live database** (`supabase/migrations/0001_init.sql`), executed via the SQL Editor UI in 4 chunks (one `create table` / policy group at a time) to avoid a Monaco auto-indent/auto-bracket corruption bug hit when typing large multi-line SQL. **The fix that worked**: flatten each statement to a single line (no internal newlines, no leading indentation) before typing — this avoids the auto-indent snowballing that corrupted a previous attempt (a `--` comment absorbed the next line and silently dropped the `matches` table). Clipboard-paste (`navigator.clipboard.writeText` + Ctrl+V) was tried first but hangs/times out in this automated browser context (no permission-prompt handling) — don't bother with it, use the flattened single-line-per-statement typing approach instead, and always verify via `window.monaco.editor.getModels()[0].getValue()` (or a screenshot, if that JS eval gets blocked by a content filter on this specific query) before hitting Run.
  - Verified in the dashboard afterward: `profiles` and `matches` tables exist under `schema public`; `resumes` storage bucket exists with 1 policy attached.
- Code written and **committed... check `git status`, may still be uncommitted** — see below:
  - `src/lib/supabase/client.ts` — browser client via `createBrowserClient`
  - `src/lib/supabase/server.ts` — server client via `createServerClient`, awaits `cookies()` per Next 16 rules, has a try/catch around `setAll` since Server Components can't set cookies (expected, proxy.ts handles refresh)
  - `proxy.ts` (project root) — session-refresh proxy (Next 16's renamed middleware), hand-written since `@supabase/ssr` ships no built-in `updateSession` helper. Matcher excludes static assets.
  - `src/hooks/useSupabaseUser.ts` — client hook, `getUser()` + `onAuthStateChange` subscription.
  - `src/app/(auth)/login/page.tsx` + `LoginForm.tsx` — split so `useSearchParams()` is wrapped in `Suspense` (avoids a Next build warning). Email magic-link via `signInWithOtp` + "Continue with Google" via `signInWithOAuth`. **Functionally verified**: submitting the email form produces a real `200` from `POST https://rlpchxqicnysbrcilgcz.supabase.co/auth/v1/otp` (confirmed via network tab) — a real magic-link email was sent to the user's own address during testing.
  - `src/app/(auth)/auth/callback/route.ts` — `exchangeCodeForSession(code)` then redirect to `next` param (default `/profile`).
  - `src/app/(auth)/auth/signout/route.ts` — POST route, `signOut()` then redirect to `/`.
  - `src/app/(app)/layout.tsx` — now an async server component; shows "Sign in" link when anonymous, or email + History link + Sign-out form when signed in. **Verified**: anonymous header correctly shows "Sign in" in the browser.
  - `src/app/(app)/history/page.tsx` — server component, auth-gated via `redirect("/login?next=/history")`. **Verified**: anonymous visit to `/history` correctly redirects to `/login?next=/history`.
  - `src/app/api/profile/route.ts` — POST upserts the onboarding profile into Supabase `profiles` (camelCase → snake_case mapping), 401 if not signed in.
  - `src/app/api/matches/[id]/route.ts` — PATCH updates `status`/`pitch` on a `matches` row, scoped to `user_id = current user`, 401 if not signed in.
  - `src/app/api/matches/generate/route.ts` — rewritten: if signed in and not `force`, checks for an existing today's batch in Supabase first and returns it as-is; exclusion list becomes the user's full match history (`select role_title from matches where user_id = X`) instead of just client-provided `excludeRoles`; newly generated matches are inserted into Supabase and the response uses the DB-assigned row `id`s (so later PATCH calls target real rows). Anonymous path unchanged (client-generated `crypto.randomUUID()` ids, no Supabase calls).
  - `src/app/(app)/matches/page.tsx` — `generateMatches` now takes a `force` flag: initial load passes `false` (respects today's existing batch), "Refresh matches" passes `true` (always generates a fresh batch).
  - `src/components/matches/MatchCard.tsx` — after `updateStatus`/`setPitch` in the local Zustand store, also fires a `PATCH /api/matches/[id]` when `useSupabaseUser()` reports a signed-in user.
  - `src/app/(app)/profile/page.tsx` — "See my matches" is now a button (not a bare `Link`): if signed in, `POST /api/profile` to upsert before navigating via `router.push`.
  - `npx tsc --noEmit` and `npm run build` both pass clean with all of the above.
- **Committed and pushed** (commit `79c0f39`, "Add Supabase auth and persistence for signed-in users"). `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to Vercel (Production + Preview), project redeployed, and verified live: `curl -X POST https://pathpilot-ai-iota.vercel.app/api/matches/generate` (no auth cookie) returns a real Gemini-generated batch with 200 — confirms the Supabase client initializes correctly in production and the anonymous fallback path works end-to-end on the live deployment, not just locally.

**Google OAuth — done.** User created a fresh, dedicated Google Cloud project ("PathPilot AI", not reusing an unrelated existing project) and an OAuth client (Web application type, authorized redirect URI `https://rlpchxqicnysbrcilgcz.supabase.co/auth/v1/callback`). Client ID/Secret were pasted directly into Supabase's Authentication → Providers → Google page by the user (agent never handled the credential values, same boundary as the Resend API key). **Verified functionally**: `curl ".../auth/v1/authorize?provider=google&redirect_to=..."` now returns a `302` redirect to `accounts.google.com` with the correct `client_id` — previously this returned `{"error_code":"validation_failed","msg":"Unsupported provider..."}` before setup. Google Cloud Console (`console.cloud.google.com`) is a domain the agent's browser tool cannot navigate to at all (hard block, unlike Supabase/GitHub) — all clicks there have to be done by the user, screenshot-relay style, no way around it.

**Everything else in Phase 5 (done and verified):**
- **Real signed-in test pass — complete.** User signed in via magic-link (had to fix two real blockers first: Supabase's default email sender is hard rate-limited by design, fixed by wiring a custom SMTP via Resend's free tier in Auth → Settings → SMTP Settings; and the first magic-link click failed because it landed in Gmail Spam, not an app bug). Once signed in, verified end-to-end **directly against the database** (not just UI): `profiles` upsert on "See my matches" (confirmed row with correct `role_interest`/`years_experience`), `matches/generate` persisted a 10-row batch to Supabase with real Gemini-generated role titles, "Refresh matches" correctly appended a second non-duplicate batch (20 rows total, no repeated role titles), "Mark applied"/"Dismiss" synced via `PATCH /api/matches/[id]` (confirmed status changed in DB), and pitch generation synced too (`has_pitch: true` confirmed in DB after streaming completed).
- **RLS cross-user isolation — verified**, without needing a second real signup: ran `set local role authenticated; set local request.jwt.claims = '{"sub":"<uuid>","role":"authenticated"}'` in the SQL editor with a random UUID → `select count(*) from profiles/matches` both returned 0. Same query with the real signed-in user's UUID returned the correct 1 profile / 20 matches. Confirms RLS blocks non-owners and correctly allows owners — the standard Supabase-recommended way to test RLS without provisioning multiple accounts.
- **Committed and pushed** (commit `79c0f39`, "Add Supabase auth and persistence for signed-in users"). `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to Vercel (Production + Preview), project redeployed, and verified live: `curl -X POST https://pathpilot-ai-iota.vercel.app/api/matches/generate` (no auth cookie) returns a real Gemini-generated batch with 200 — confirms the Supabase client initializes correctly in production and the anonymous fallback path works end-to-end on the live deployment, not just locally. Re-verified again at this checkpoint, still 200 with a fresh batch.

### ✅ Phase 6 — Realtime processing indicator (done)
Live status broadcast during AI calls via Supabase Realtime **broadcast channels** (no new table, no migration needed):
- `src/lib/realtime/status.ts` — server-side `createStatusReporter(channelId)`: opens a Realtime channel with `@supabase/supabase-js`'s `createClient`, waits for `SUBSCRIBED` before allowing sends (with a 3s timeout fallback to a no-op reporter so a Realtime hiccup never breaks the actual AI call), exposes `send(message)` / `close()`.
- `src/hooks/useStatusChannel.ts` — client hook: generates a random channel ID once per mount, subscribes to `broadcast` events named `status`, returns `{ channelId, status, resetStatus }`.
- Wired into all three AI-calling flows: `/api/resume/parse` ("Reading your resume…" → "Extracting skills and experience…"), `/api/onboarding/chat` ("Turning your answers into a profile…"), `/api/matches/generate` ("Checking your match history…" → "Ranking roles that fit your profile…" → "Saving your matches…" for signed-in users). Client passes `channelId` alongside the existing request payload (FormData field for resume upload, JSON field for the other two).
- UI: `ResumeUpload.tsx` and the matches-page's initial-load spinner now show `status ?? "<static fallback text>"` — live text when the channel delivers a message, falls back to the old static copy otherwise (covers channel failures gracefully). Also added a **second** status indicator on the matches page specifically for "Refresh matches" clicks (previously that path showed no loading feedback at all — the original spinner was gated on `matches.length === 0`, which is never true during a refresh since the old batch is still on screen).
- **Verified live**: watched a real generation in the browser — page showed "Ranking roles that fit your profile…" (the actual broadcast payload, not the static fallback) partway through a 12.9s `/api/matches/generate` call, then resolved to the match list with no console errors. Also re-verified the "Refresh matches" path shows the live status next to the still-visible old matches while the new batch generates.

### ⬜ Phase 7 — 3D hero upgrade (nice-to-have, not started)
Swap `HeroSceneCSS.tsx` for a React Three Fiber scene behind a feature flag + `next/dynamic`, only if time remains. Re-verify Lighthouse after, since this is the biggest perf risk in the whole project.

### ⬜ Final — End-to-end verification + README (not started)
Walk the deployed URL end-to-end one more time after all phases land, document the final Lighthouse score, write a README with architecture decisions and "what's next."

## Working conventions established this build (follow these, don't relitigate)

- **Always verify actual installed package versions/APIs before writing code that touches them** — this project runs Next.js 16, AI SDK v7, pdf-parse v2, Supabase SSR v0.12, all of which have real breaking changes vs. what training data assumes. When in doubt, read `node_modules/<package>/**/*.d.ts` or use an Explore agent to check, don't guess from memory.
- **Restart the dev server after any `.env.local` or `next.config.ts` change** — env vars and config are only read at server start.
- **`rm -rf .next` while the dev server is still running corrupts it** (`ENOENT ... build-manifest.json`) — always stop the dev server first, then clean `.next`, then restart. This has bitten the session twice.
- **Commit messages should explain *why*, not just *what*** — the ones written so far do this (e.g. explaining the pdf-parse bundling issue, the Lenis anchor bug) — keep that standard.
- **Verify claims with real evidence, not just visual screenshots** — given the tab-visibility issue above, prefer checking `localStorage`, direct API curl calls, or React fiber state over trusting a screenshot when something animation-related is being tested.
- Every phase so far has been: build → typecheck → production build check → restart dev server → test locally (curl + browser) → commit → push → (if env vars changed) also update Vercel's env vars + trigger a redeploy → test on the live URL too. Keep following this exact loop for Phase 5's remaining pieces.
- User prefers being asked before I: accept ToS/consent modals, choose which of several project/orgs to use for a new resource (asked and got "Default Gemini Project" / new dedicated Supabase project rather than reusing an unrelated existing one), or make an account-level change like adding a Vercel env var (I did ask/announce before doing so, and should keep doing that).

## Immediate next steps when resuming

Phases 5 and 6 are both done. Next: either Phase 7 (3D hero, low priority, biggest perf risk in the project) or go straight to Final (end-to-end verification + README) — ask the user which they'd rather do next, neither is blocking. Phase 6's realtime status work isn't yet committed to git as of this checkpoint — check `git status`.
