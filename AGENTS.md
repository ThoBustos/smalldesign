# Small production workflow

Canonical production source: this React + Vite + TypeScript repository. Do not replace it with static HTML from smalldesign-v2. Keep `/diagnostic`, the existing Supabase functions/migrations, and the approved Canvas/video motion.

Use feature branches. Run lint, intake tests, build and browser release checks before release. `main` is the sole production release branch; use `npm run deploy:production` for manual releases. Keep migrations beside source; do not reapply existing migrations or expose backend credentials in browser builds. Preserve design explorations in docs/archives or the v2 design archive.
