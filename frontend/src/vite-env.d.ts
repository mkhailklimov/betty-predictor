/// <reference types="vite/client" />

// Without this, `import.meta.env` is untyped and `tsc --noEmit` fails on
// services/api.ts — which nobody noticed, because `npm run build` is `vite build`
// alone and never typechecks. See package.json: `build` now runs tsc first.
