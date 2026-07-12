# Project: Calisthenics Skill Tracker

Mobile-first web app for tracking a calisthenics skill-training system (Maltese, Planche, Front Lever, Muscle Up, etc.), built around autoregulated intensity days. This is intended to become a real product, not a throwaway prototype — build accordingly.

## Current status: MVP built and live

The full MVP below is implemented, running against a real Supabase project, and has been visually verified screen-by-screen in a live browser session (not just code review). See "Current architecture notes" near the bottom for how things are wired together and what's still deferred.

## Tech expectations
- Mobile-first, installable as a home-screen web app (PWA: manifest + service worker + icons).
- Real accounts and a real database (not browser-only storage) — data must persist across devices and support multiple users eventually.
- Clean, modern UI, dark-mode friendly. Should feel like a premium fitness app (Whoop/Oura/Strava tone), not a generic CRUD admin panel.
- Fast to log a workout on a phone mid-session — minimal taps, big touch targets.

## Core concept: Autoregulated Intensity Days
Every training day is tagged as one of:
- **High (80–100%)** — 1–2x per week. Near-max attempts on skills.
- **Moderate (60–70%)** — most days. Solid working volume, not maximal.
- **Active Recovery / Rest** — 1–2x per week. Light mobility/skill work or full rest.

Rule: the user picks the day's actual intensity based on how they feel — a planned High day can be downgraded to Moderate. The app supports and encourages this; it never forces a rigid schedule.

Example week (illustrative, not fixed): 1–2 high days, 1–2 recovery days, remaining days moderate.

## Feature: Daily Check-In (core feature) — ✅ built
Before logging a workout, a quick check-in (2–3 taps):
1. How do you feel today? (Fresh / Okay / Tired / Sore / Wiped)
2. App suggests an intensity level (High / Moderate / Recovery) based on the weekly plan and the check-in — recommending a downgrade if fatigue is signaled.
3. User confirms or overrides — final call is always theirs.

Log both the planned and the actually-chosen intensity so the user can later see patterns (e.g. "I downgrade Wednesdays a lot," "3 high days this week may be too many"). The suggestion logic lives in `src/lib/intensity.ts` (`suggestIntensity`).

## Feature: Skill & Exercise Library — ✅ built
Pre-seeded (`supabase/migrations/0001_init.sql`) with:
- **Maltese**
- **Planche** (tuck, advanced tuck, straddle, full)
- **Front Lever** (tuck, advanced tuck, single leg, straddle, full)
- **Muscle Up** (bar and rings)
- Plus common strength/mobility/stretch accessories (pull-up, dip, push-up variants, etc.)

Per exercise: name, category (skill / strength / mobility / stretch), progression stage, skill group, is-custom flag, owner (for custom ones).

**Custom exercises**: users can type any exercise name in the exercise picker (Log screen, Plan editor) — if it doesn't match an existing one, a "+ Add as custom exercise" flow appears with a one-tap category chooser (Skill/Strength/Mobility/Stretch). No fixed list limit; this is the intended answer to "calisthenics has too many variations to pre-seed them all." Deliberately did **not** integrate an external exercise API — free text + one tap is faster and generic fitness APIs don't have calisthenics-specific progressions anyway.

Per set logging: hold time (seconds) OR reps, optional RPE (1–10), free-text notes.

## Feature: Workout Logging — ✅ built
- A session = date + intensity level (from check-in) + list of exercises with sets.
- Fast add flow: pick exercise → enter time/reps → done. Reordering via up/down controls per exercise block.
- Duplicate a previous session as a starting template.

## Feature: Workout Plans — ✅ built (added post-MVP)
Reusable named templates you design ahead of training, separate from the historical record of actual sessions:
1. Build a plan ("Push Day": exercise 1 × N sets × target reps/seconds, exercise 2, ...) under **My Plans** (linked from the Log screen header).
2. On the Log screen, **"Start from a plan"** pre-fills the exercise blocks with the plan's targets as editable starting values.
3. Edit freely while training — change reps/seconds to what actually happened, swap exercises for variations, add/remove sets — then save as today's real session, same as any other logged session.

Plans and sessions are intentionally two separate concepts (`workout_plans`/`workout_plan_sets` tables vs `sessions`/`set_logs`) — a plan never mutates once loaded into the Log screen, it's just a starting point.

## Feature: Training Guides & Example Plans — ✅ built (post-MVP)
Educational content bridging the app's autoregulation philosophy into concrete "what do I actually do" guidance, plus starter plans:
- **Weekly guide** — collapsible "How to structure your week" card on the Weekly screen (`src/components/TrainingGuideContent.tsx`), explaining the High/Moderate/Recovery day-type system.
- **Plan guide** — collapsible "How to build a plan" card on My Plans (`src/components/PlanGuideContent.tsx`), covering how to group exercises, order hardest-skill-first, and keep plans short.
- **The Skill Blueprint** (`/guide`, linked from the Log screen) — a full training-philosophy guide (`src/components/SkillBlueprintContent.tsx`): why people plateau, the three rules (specificity / fatigue management / progressive overload), Max/Submax/Rest day structure, supercompensation, load-dosing methods, strength vs. coordination skill training, and attention-to-detail principles. Rendered as collapsed-by-default accordion sections rather than one continuous scroll — the source content is long and users found a single scroll overwhelming.
- **Example plans** (`src/lib/examplePlans.ts`) — Planche Day, Front Lever Day, and Handstand Day starter templates shown on My Plans. Tapping one opens `/plans/new?template=<key>`, which resolves each exercise name against the real exercise library and pre-fills the plan editor — nothing is saved until Save is pressed, same as every other plan flow. Each template carries an `intensityNote` shown at the top of the editor, tying its exercise selection back to the Max/Submax/Rest system above.
- Needed a few exercises that weren't in the original seed: Wall/Chest-to-Wall/Freestanding Handstand Hold, Planche Negatives, Protraction Dips, Front Lever Negatives, Front Lever Pulls — added via `supabase/migrations/0006`–`0008` (same "run by hand in the Supabase SQL editor" caveat as other migrations; all three already applied to the live project).

## Feature: Progress Tracking — ✅ built
- Per-skill progress chart: gradient-filled area chart (Recharts) + a glowing `ScoreRing` showing the latest value relative to personal best.
- Weekly view: planned (outline badges) vs actual (filled badges) intensity per day, plus a check-in streak counter. Tap a planned badge to cycle High → Moderate → Recovery.
- Visual and motivating (progress rings, soft glows) — not a wall of numbers.

## Data model (as implemented)
- **profiles**: extends `auth.users` — units, display name.
- **weekly_plans**: one row per user per day-of-week (0–6), default intensity — editable, not fixed.
- **check_ins**: date, feeling, planned/suggested/chosen intensity (unique per user+date, upserted).
- **exercises**: name, category, skill_group, progression_stage, is_custom, owner_id (null = global/seeded).
- **sessions**: date, intensity, linked check_in, notes.
- **set_logs**: session, exercise, reps OR duration_seconds, RPE, notes, order_index.
- **workout_plans**: user_id, name.
- **workout_plan_sets**: plan_id, exercise_id, reps OR duration_seconds, order_index (no RPE/notes — plans are targets, not logs).

All tables have RLS scoping rows to `auth.uid()` (directly, or via the parent session/plan for the `*_logs`/`*_sets` child tables). Session and plan creation/updates go through Postgres RPC functions (`create_session`, `create_workout_plan`, `update_workout_plan` in `supabase/migrations/`) so the parent row + child rows are written atomically.

## MVP scope — all built
1. ✅ Auth (Supabase email + password — see "Feature: Auth & Profile" below).
2. ✅ Daily check-in flow → intensity suggestion.
3. ✅ Exercise library seeded with the 4 named skills + progressions, plus unlimited custom exercise support.
4. ✅ Session logging: pick intensity, add exercises, log sets.
5. ✅ History view of past sessions.
6. ✅ Progress chart per exercise (ring + area chart).
7. ✅ Weekly view: planned vs actual intensity.
8. ✅ PWA setup (manifest, icons, service worker — production-only, see notes below).
9. ✅ Workout plan templates (post-MVP addition, see above).
10. ✅ Profile screen — display name, units, sign out (post-MVP addition, see below).

## Feature: Auth & Profile — ✅ built (switched from magic link post-MVP)
Originally shipped as passwordless email-magic-link only. Switched to email + password with distinct screens per user request:
- `src/app/login/page.tsx` — email + password sign-in (`supabase.auth.signInWithPassword`).
- `src/app/register/page.tsx` — name + email + password sign-up (`supabase.auth.signUp`, with `options.data.display_name` so the DB trigger seeds `profiles.display_name` immediately). Signs the user in and redirects to `/` right away — no email confirmation step. Supabase's "Confirm email" setting (Authentication → Sign In / Providers → User Signups) was turned **off** for this project (2026-07-08) at the user's request, since requiring a confirmation-link click before first sign-in felt unnecessarily friction-y for this app. This does mean signup doesn't verify email ownership — acceptable tradeoff for now given the target usage (personal/small-scale tracker), revisit if this becomes a multi-tenant product with account-recovery or spam concerns.
- `src/app/(app)/profile/page.tsx` — view/edit `display_name` and `units` (backed by `getProfile`/`updateProfile` in `src/lib/data.ts`), shows the account email (read-only, from the auth user), a change-password form, and a sign-out button. Linked from a small circular icon button in the Today screen header (top-right).
- `src/app/forgot-password/page.tsx` + `src/app/reset-password/page.tsx` — password recovery. Forgot-password sends the reset email via `resetPasswordForEmail(email, { redirectTo: origin + "/auth/callback?next=/reset-password" })`; the callback route exchanges the code (establishing a real, recently-created session) and lands on `/reset-password`, which calls `updateUser({ password })`. `/reset-password` is intentionally **not** in `proxy.ts`'s `PUBLIC_PATHS` — it relies on the normal auth-gate redirect to `/login` for anyone without a valid (recovery) session.
- Change-password (on the Profile screen) calls `updateUser({ password, current_password })` — the `current_password` field is required now that "Require current password when updating" is enabled (see Security hardening). Both this and reset-password use `minLength={10}` client-side to match the server-side policy.
- `src/app/auth/callback/route.ts` — handles the PKCE `code` exchange for both signup-confirmation-style links (currently unused, since "Confirm email" is off) and password-recovery links (`/forgot-password` → this route → `/reset-password`).
- `src/components/ui/AuthHeader.tsx` — shared ring-logo + title/subtitle header, used by all four auth screens (login, register, forgot-password, reset-password) instead of duplicating the SVG.
- `src/proxy.ts` — `/register` and `/forgot-password` added to `PUBLIC_PATHS`; signed-in users hitting `/login` or `/register` are redirected to `/`.
- `supabase/migrations/0004_profile_display_name.sql` — updates the `handle_new_user()` trigger to read `display_name` out of `new.raw_user_meta_data` (populated by `signUp`'s `options.data`) so the profile row is created with the right name from the start. **This migration must be run by hand in the Supabase SQL editor** — no automated migration runner is wired up (see "Stack decisions"). ✅ Already applied to the live project (2026-07-08).
- `src/lib/supabase/errors.ts` (`friendlyAuthError`) — used by both login and register instead of showing `error.message` raw. Needed because `@supabase/auth-js` treats any 5xx from the Auth API as "retryable" and skips parsing the response body, so `error.message` ends up as the *stringified Response object* — literally the text `"{}"` — instead of the server's actual message (e.g. "Error sending confirmation email"). Confirmed live: a Resend/SMTP outage during testing produced exactly this, and the raw `"{}"` was being rendered straight to the user before this fix. If you see a bare `{}` error anywhere else auth errors are surfaced, apply the same fix.

## Security hardening — ✅ done (2026-07-08)
Code-level (reversible via git):
- **Strict CSP via `src/proxy.ts`** — nonce + `'strict-dynamic'` on `script-src` (Next.js auto-attaches the nonce to every framework/page script it emits — verified live via response headers and page source), `frame-ancestors 'none'`, `object-src 'none'`, `connect-src` scoped to `'self'` + `*.supabase.co`. `style-src` uses `'unsafe-inline'` deliberately — CSP nonces can't cover inline `style="..."` attributes (only `<style>` tags), and this app relies on React inline `style={{...}}` props for dynamic colors (`ScoreRing`, `IntensitySelector`, glows). Also sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` on every response. Verified: no CSP violations in console, all pages render, real Supabase API calls succeed under the new `connect-src`.
- **Open-redirect fix in `src/app/auth/callback/route.ts`** — the `?next=` param is now validated (`safeRedirectPath`) to be a same-site relative path before use as a redirect target, rejecting absolute/protocol-relative URLs.
- **`supabase/migrations/0005_security_hardening.sql`** — `update_workout_plan` previously relied entirely on RLS to block cross-user writes (which worked, but surfaced a raw Postgres RLS-violation error instead of failing cleanly). Now explicitly checks plan ownership up front. ✅ Applied to the live project.

Live Supabase project settings (Authentication → Sign In / Providers → Email, and → Rate Limits), all applied 2026-07-08 per explicit user sign-off on exact values:
- **Password policy**: minimum length raised from 6 → **10**; character requirements set to **lowercase + uppercase + digits + symbols** (was: none).
- **"Secure password change" enabled** — password changes require a session created within the last 24h (blocks a stale/hijacked session token from silently taking over the account via password change).
- **"Require current password when updating" enabled** — password changes now require re-entering the current password.
- **Sign-in/sign-up rate limit tightened**: 30 → **10 requests/5min per IP** (360/hour → 120/hour).
- **"Prevent use of leaked passwords"** (HaveIBeenPwned check) is **Pro-plan-only** on Supabase — not available on this project's Free tier without a billing upgrade. Left off; revisit if/when upgrading.
- **CAPTCHA** (Cloudflare Turnstile) — ✅ added and live 2026-07-13. See the deferred-items list in "Current architecture notes" below for full detail.

## Explicitly out of scope for now (design so these bolt on later without a rebuild)
- Stretching/mobility and flexibility tracking modules.
- Explosive leg/plyometric training modules.
- Broader "everyday sustainable full-body" programming beyond the skill system.
- Payments/social features — just keep `category` fields and per-user data isolation generic enough to support this later.

## Design tone — implemented
Modern, minimal, athlete's-tool feel — closer to **Oura** than Whoop.

Specifically, as built:
- **Calm, quiet UI** — soft dark backgrounds via a layered radial-gradient body background (warm gold + cool blue + sage hints fading into deep charcoal/navy), not flat black.
- **One score/number takes center stage per screen** — `ScoreRing` component (soft glowing ring + big confident numeral) used on Today, Check-in confirmation, and Progress.
- **Soft gradients and circular/ring motifs** — `ScoreRing`'s glow uses a `radial-gradient` (not a blurred solid div — that caused a visible square artifact, see gotchas below) plus a slow 3s breathing pulse animation (`glow-pulse` keyframe in `globals.css`).
- **Rounded corners, soft shadows, subtle depth** — `Card` component uses an inset top highlight + layered shadow + subtle gradient fill, not a flat single color.
- **Muted, sophisticated color palette** — CSS custom properties in `globals.css` (`--color-accent` soft gold, `--color-high`/`--color-moderate`/`--color-recovery` for intensity).
- **Typography-led hierarchy** — Inter (body) + Sora (display/numerals) via `next/font`.
- **Gentle language, not alarms** — Recovery framed as restorative, not a warning.
- Dark mode only for now (`color-scheme: dark` forced); light mode not yet built.

## Working notes
- Ask clarifying questions about data model, auth provider, or hosting before starting a feature if genuinely ambiguous — otherwise make a reasonable choice and proceed.
- Keep this file updated as scope grows (stretching, mobility, explosive leg work are planned future additions — update this doc when that work starts).

## Stack decisions (locked in)
- **Framework**: Next.js 16 (App Router, TypeScript, Turbopack), Tailwind CSS v4.
- **Backend**: Supabase — Postgres database + Supabase Auth (email + password, with email confirmation links handled the same way magic links used to be) + Row Level Security for per-user data isolation.
- **Email**: Custom SMTP via **Resend** is configured in the Supabase project (Authentication → SMTP Settings) — Supabase's default shared email sender has a strict rate limit (a few emails/hour) that broke testing early on; Resend gives 30/hour+ and removes that ceiling. Sender is `onboarding@resend.dev` (Resend's no-setup-needed test address — fine for now, revisit if a custom domain is wanted later). Signup no longer sends an email at all ("Confirm email" is off); this SMTP config is currently unused but will matter again once a "forgot password" flow is added.
- **Data access**: `@supabase/supabase-js` + `@supabase/ssr` for server/client auth-aware queries. Schema managed via SQL migrations in `supabase/migrations/`, applied by hand via the Supabase SQL editor (no CLI/migration-runner wired up yet).
- **Hosting**: Vercel. ✅ Deployed 2026-07-09 — **https://calisthenics-skill-tracker.vercel.app**, project `rumens-projects-ad90a99f/calisthenics-skill-tracker`, GitHub repo `Rumbata24/full-body-movement` connected for auto-deploy-on-push to `main`. `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` set for both Production and Preview environments via `vercel env add`. Supabase project hosts the DB/auth; its Site URL and Redirect URLs (Authentication → URL Configuration) were updated to include both the Vercel domain and `localhost:3000` so auth flows (password reset) work in both environments.

## Current architecture notes (read before continuing work)

**Key shared files:**
- `src/lib/useDraftBlocks.ts` — the exercise-block editing state (add/remove/reorder exercises and sets, flatten to a save payload). Shared by the Log screen and the Plan editor; also exports `setsToBlocks()` to hydrate blocks from a past session or a saved plan.
- `src/components/ExercisePicker.tsx` — shared exercise picker/search bottom sheet, used by Log, Plan editor, and Progress (single-select mode via `selectedId`). Handles custom-exercise creation with a category chooser.
- `src/components/ui/ScoreRing.tsx`, `IntensitySelector.tsx`, `IntensityBadge.tsx`, `Card.tsx`, `Button.tsx` — shared design-system primitives; reuse these rather than one-off styling.
- `src/components/ui/ConfirmDialog.tsx` — in-app confirm modal replacing native `confirm()`/`alert()` popups (which look jarring against the app's dark theme and can't be styled). Used for Delete plan / Delete session; reuse this for any future destructive action instead of `window.confirm`.
- `src/lib/useInstallPrompt.ts` + `src/components/InstallPrompt.tsx` — ✅ built 2026-07-09. Dismissible "Add to your home screen" card on the Today screen: captures the browser's `beforeinstallprompt` event for a real one-tap install button on Android/Chrome/Edge, shows Share-icon instructions on iOS Safari instead (Apple exposes no programmatic install trigger there). Confirmed working live on both platforms. Requires the production service worker (only registers when `NODE_ENV === "production"`), so the install button won't appear in local dev.
- `src/proxy.ts` — Next 16's `middleware.ts` replacement; gates all routes except `/login`, `/register`, `/forgot-password`, `/auth`, `/offline`, `/privacy`. Also sets the CSP + other security headers on every response (see the CSP gotcha below before touching this). 2026-07-09: briefly switched the auth check from `getUser()` to `getSession()` to cut felt navigation lag, but reverted on 2026-07-12 — Supabase's docs explicitly warn against trusting `getSession()` in server-side/middleware code, since it reads the JWT from the cookie without revalidating it against the Auth server, letting a forged cookie influence the redirect decision. Back to `getUser()` (verified against Supabase's Auth server on every request); the latency cost is accepted as the price of not trusting an unverified cookie, even though actual data access was always separately protected by RLS.
- `src/instrumentation.ts` / `src/instrumentation-client.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts` — Sentry error monitoring wiring, added 2026-07-12. See deferred-items list below for details.

**Deferred items — reviewed 2026-07-13. All actionable ones are now done and verified live; only the Pro-plan-gated item remains.**
1. ✅ **Account deletion + data export** — done 2026-07-12. `src/app/(app)/profile/page.tsx` "Your data" card exports a full JSON dump (`exportUserData` in `src/lib/data.ts`) and a "Danger zone" card calls `delete_own_account()` (via `deleteOwnAccount`), a `security definer` Postgres function (`supabase/migrations/0009_delete_own_account.sql`, applied live) that deletes the caller's own `auth.users` row — every user-scoped table cascades from that FK, so one delete cleans up everything. Verified end-to-end live: signed up a disposable test account, deleted it through the UI, confirmed gone.
2. ✅ **CAPTCHA (Cloudflare Turnstile)** — code done 2026-07-13, and now fully live and verified. `src/components/ui/Turnstile.tsx` is a shared widget (loads Cloudflare's script, renders the challenge, reports the token via `onVerify`), wired into `/register`, `/login`, and `/forgot-password` (all three, not just register — Supabase's "Enable Captcha protection" toggle applies project-wide to sign-up/sign-in/password-reset, not per-route, so leaving login unprotected would either do nothing or break login once the toggle flips on). Site key lives in `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public by design, safe to commit to env; also added to Vercel Production + Preview). Turnstile widget only has the production hostname (`calisthenics-skill-tracker.vercel.app`) allow-listed — `localhost` isn't a valid Turnstile hostname (no TLD), so the widget deliberately shows a Cloudflare "Unable to connect to website" error in local dev; this is expected, not a bug. Required adding `https://challenges.cloudflare.com` to both `script-src` and a new `frame-src` directive (the challenge renders in its own iframe) in `src/proxy.ts`'s CSP — same "new third-party endpoint needs a CSP allowance or it silently fails" lesson as the Sentry item below. The user enabled CAPTCHA protection in Supabase Dashboard → Authentication → Attack Protection with the Turnstile secret key (never given to Claude or committed anywhere). **Gotcha hit and fixed:** the provider dropdown was initially left on **hCaptcha** instead of **Turnstile** — the widget still showed a client-side "Success!" (that only proves the site key/domain pairing is right), but real signups failed server-side with `invalid-input-response` because Supabase was verifying the Turnstile token against hCaptcha's API. Fixed by switching the provider to Turnstile. Verified live end-to-end after the fix: a request with no token is rejected (`captcha_failed`), and a real signup with a valid token succeeds — confirmed by actually signing up and then deleting a disposable test account through the app's own delete-account feature.
3. ✅ **Production error monitoring** — done 2026-07-12. `@sentry/nextjs` wired up via `src/instrumentation.ts` + `src/instrumentation-client.ts` + `sentry.server.config.ts`/`sentry.edge.config.ts` (all read `NEXT_PUBLIC_SENTRY_DSN`; DSN isn't secret, safe to be public, also added to Vercel Production + Preview), plus `src/app/global-error.tsx` to catch React render errors. `tracesSampleRate: 0` — error capture only, no performance tracing (kept deliberately minimal; no source-map upload / `withSentryConfig` wrapper since that needs a Sentry auth token we don't have yet — stack traces work but point at built/minified code until that's added). Required adding `https://*.sentry.io` to `connect-src` in `src/proxy.ts`'s CSP, or the browser silently blocks the report with no console error (same class of issue as the CSP nonce gotcha below — always check `connect-src`/`script-src`/`frame-src` when adding a new third-party endpoint). Verified live: triggered both an unhandled error and an explicit `captureException`, confirmed both landed in the Sentry issues feed, then deleted those test issues afterward to keep the feed clean.
4. ✅ **Privacy policy / terms page** — done 2026-07-12. `src/app/privacy/page.tsx`, public route (added to `PUBLIC_PATHS` in `src/proxy.ts`), linked from the bottom of `/login` and `/register`. Covers what's collected, how it's stored (RLS), how it's used, data export/deletion, terms-of-use-lite, and a contact email.
5. **"Prevent use of leaked passwords" (HaveIBeenPwned check) is Pro-plan-only on Supabase** — not available on this project's Free tier without a billing upgrade. The only remaining item, and it's not worth paying for on its own (see reasoning discussed with the user 2026-07-13: existing password policy + rate limiting already cover the likelier attack paths; revisit only if upgrading to Pro for other reasons, or if the app moves beyond a small known-tester beta).

**Beta signup status (as of 2026-07-09):** invites are fully manual for now — a Google Form + linked Sheet collect name/email (see the Form linked from the Log screen guide work), and the user sends access by hand. An earlier attempt to automate this via Google Apps Script + a Vercel API route (`/api/beta-invite`) was built, tested, and then fully reverted — both free email-sending options available (Resend's sandbox sender, Supabase's built-in mailer) turned out to only deliver to the account owner's own address, not real testers. Don't re-introduce that automation without first securing a verified sending domain.

**Known gotchas hit during development (avoid repeating):**
- **This project directory is on a slow/networked drive.** Next.js prints a "Slow filesystem detected" warning on every dev server start. Turbopack's dev cache has served visibly stale CSS/JS even across full server restarts here — if a change doesn't seem to take effect, stop the server, delete `.next`, and restart before assuming the code is wrong.
- **Don't concatenate an alpha-hex suffix onto a CSS `var()` reference** (e.g. `` `${color}66` `` where `color = "var(--color-accent)"`) — produces the invalid CSS token `var(--color-accent)66`, which browsers silently drop (no console error). Use `color-mix(in srgb, ${color} 40%, transparent)` instead. This bug silently killed the `ScoreRing` glow entirely for a while.
- **`filter: drop-shadow()` on a raw SVG element gets clipped** by the browser's default (small) SVG filter region, producing a visible square/rectangular cutoff around circular glows. Don't put glow effects directly on SVG elements — use a separate plain `<div>` with a `radial-gradient` background positioned behind the SVG instead.
- **`@supabase/auth-js` renders 5xx Auth API errors as the literal string `"{}"`** (see `src/lib/supabase/errors.ts` above) — never render `error.message` from a Supabase auth call directly to the user; always go through `friendlyAuthError()`.
- **Nonce-based CSP silently breaks static pages in production.** `src/proxy.ts` briefly used a per-request nonce + `'strict-dynamic'` on `script-src` (the "gold standard" CSP pattern). It worked perfectly in `next dev` but **completely broke all client-side interactivity on Vercel** — forms fell back to native HTML submission, no click handlers fired, zero console errors to hint why. Root cause: almost every route in this app (`next build` output confirms — only dynamic-segment routes like `/history/[id]` are server-rendered per request) is **statically pre-rendered at build time**, when no request/nonce exists yet, so the static HTML's `<script>` tags can never carry a nonce — but the proxy was still demanding a fresh one on every request. Fixed by dropping nonces in favor of `'self' 'unsafe-inline'` on `script-src` (Next's own documented fallback for apps using static generation); the rest of the CSP (connect-src scoping, frame-ancestors, object-src none) is untouched. **Always test CSP changes against a real `next build` + `next start` (or a deploy), never `next dev` alone** — dev mode renders everything per-request and hides this entire class of bug.
- **`next dev`'s hydration state can't be checked by reading input `.value`** — setting a DOM input's value via the native property setter + dispatching an `input` event (the standard way to drive a React-controlled input from outside React) succeeds regardless of whether React has hydrated yet, since it's just a raw DOM write. To actually confirm hydration completed, check `inputEl._valueTracker` (React attaches this only after hydrating a controlled input) rather than trusting that the value "stuck".
- The Supabase SQL editor (Monaco-based) corrupts pasted/typed multi-line SQL with auto-closing brackets when typed via automated keystroke simulation. If scripting SQL edits into it programmatically, set the Monaco model value directly via `window.monaco.editor.getModels()[0].setValue(sql)` rather than simulating keystrokes.
- The `react-hooks/set-state-in-effect` ESLint rule flags direct `setState` calls in a `useEffect` body (even for legitimate client-only-value patterns like reading `new Date()`). Wrap the call in `Promise.resolve().then(() => setState(...))` to satisfy it without changing behavior.
- **JSX text immediately after an inline element (e.g. `<strong>...</strong> more text` where "more text" wraps onto a new source line) can hydration-mismatch.** When the text following a closing tag starts with a literal space on the *same* source line and then wraps to further lines, the JSX whitespace-trimming algorithm disagreed between the server render and the client bundle on whether to keep that leading space — one produced `" they train…"`, the other `"they train…"` — throwing a hydration error (hit in `SkillBlueprintContent.tsx`). Fix: don't rely on implicit whitespace collapsing around inline elements — wrap the space in an explicit `{" "}` expression on both sides instead.
