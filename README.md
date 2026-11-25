# Small.design — canonical application

React + Vite + TypeScript. This is the sole application and production source for https://small.design. No Next.js. The approved v2 design and motion have been ported into React; the old React visual direction is retained under docs/archives/. The separate smalldesign-v2 repository is a design archive, not a deployment source.

## Run and verify

- `npm ci`
- Copy `.env.example` to `.env.local`, using the existing public intake endpoint/site key. Never put service-role, Attio or bot credentials in a Vite define or VITE_* variable.
- `npm run dev`
- `npm run lint && npm run test:intake && npm run build`
- `npm run test:release` and `npm run test:accessibility` run Chromium/WebKit browser checks. CI installs these browsers.
- `npm run preview` serves the built site.

## Source map

- `src/small/Landing.tsx`: hero and contact footer.
- `src/small/hero-motion.ts`: typed Canvas rolling/unfolding/walking engine with React cleanup.
- `src/small/Diagnostic.tsx`: `/diagnostic` form, review/edit, challenge and receipt states.
- `src/small/intake.ts`, `security.ts`: existing Supabase contract and Turnstile lifecycle.
- `src/small/IdleCompanion.tsx`: diagnostic companion.
- `src/small/styles.css`: shared type/color roles and mobile flow.
- `public/assets/`: approved motion, local font and adaptive companion icons.
- `supabase/functions/`, `supabase/migrations/`: preserved backend and migration history. These are already deployed; do not recreate or reapply them to production.
- `scripts/build-routes.mjs`: route-specific static metadata for `/diagnostic`; Vercel redirects `/diagnostic.html` there.

## Release

One release branch: `main`. Feature work belongs on branches/PRs in this repository. Require CI success before merging. The existing Vercel project is `smalldesign`; its public production environment already holds `INTAKE_FUNCTION_URL`, `TURNSTILE_SITE_KEY`, and `REQUIRE_INTAKE_SETUP=true`. Backend secrets remain in the existing Supabase project.

`npm run deploy:production` refuses a different repository, a non-main branch or dirty tracked source, then builds and deploys the canonical checkout. Git auto-deployment has not been newly enabled; manual releases retain an explicit gate. Never deploy a temporary static copy or the v2 design archive to this project.

## Lead pipeline

React form → Turnstile-protected Supabase intake → transactional submission/outbox → scheduled worker → Attio → Growth Bot → phone. Success is shown only after durable receipt. Retries retain the same submission ID; CRM and bot deduplicate by ID. Existing bot behavior drafts for review, without contacting customers. See docs/operations/ and docs/releases/2026-11-02-react-consolidation/. A webhook receipt alone does not prove phone delivery.

## Visual history

The prior React design remains under docs/archives/2026-11-02-react-v1 and Git history. Native AE projects and earlier drawing experiments remain in the separate v2 design archive; only selected runtime assets are shipped here.

### Diagnostic analytics

Analytics is the bundled `posthog-js` package. The build aliases `posthog-js/no-external` to the slim build that does not request a PostHog script. `script-src` stays `'self'` plus the Cloudflare Turnstile host. `connect-src` allows `https://us.i.posthog.com` for events and `https://us-assets.i.posthog.com` for the remote config JSON.

Set `VITE_POSTHOG_PROJECT_TOKEN` to the public US project token and rebuild. The token is meant to be in the browser bundle. Leave it blank to disable capture. Production Vercel already provides this variable.

Capture runs only on `small.design` and `www.small.design`. Preview deployments and localhost do not send events. `www.small.design` permanently redirects to `https://small.design`, keeping the path and query string. The www hostname remains in the allowlist for any response that is still served there.

The client uses `api_host` `https://us.i.posthog.com`, `person_profiles: 'identified_only'`, `persistence: 'localStorage+cookie'`, automatic pageviews and pageleaves, and PostHog's default IP and geo capture. Autocapture, rageclicks, and session recording are off. The distinct id is stored in localStorage and a cookie.

Custom events are unchanged:

- `small_landing_viewed` on `/`
- `small_diagnostic_clicked` when the diagnostic CTA is clicked, sent with `sendBeacon` and immediate dispatch so the request survives navigation
- `small_diagnostic_submitted` after intake confirms receipt

PostHog attaches `$referrer`, `$referring_domain`, and the initial referrer, plus `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_term` when those parameters are in the URL. Use campaign slugs such as `linkedin`, `outreach`, and `small-launch`. Keep recipient identifiers out of campaign tags.

In PostHog, the ordered funnel is `small_landing_viewed`, `small_diagnostic_clicked`, and `small_diagnostic_submitted`. `$pageview` is captured as well. A submission is counted after intake confirms receipt. Verify the funnel in Live Events with one tagged production visit and a marked test request, then exclude that test campaign from reporting.
