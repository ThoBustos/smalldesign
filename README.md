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

Set `VITE_POSTHOG_PROJECT_TOKEN` to the public project token for Small Design in the US PostHog workspace and rebuild production. Events are sent only from `small.design`. The capture endpoint receives an anonymous ID scoped to the browser tab, event names and optional campaign slugs (`utm_source`, `utm_medium`, `utm_campaign`). Use campaign slugs such as `linkedin`, `outreach` and `small-launch`. Keep recipient identifiers out of campaign tags.

In PostHog, create an ordered funnel with `small_landing_viewed`, `small_diagnostic_clicked` and `small_diagnostic_submitted`. A submission is counted after intake confirms receipt. Verify the funnel in Live Events using one tagged production visit and a marked test request, then exclude that test campaign from reporting.
