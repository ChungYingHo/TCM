// Test stub for the `astro:middleware` virtual module (only exists at Astro
// build time). Aliased in vitest.config.ts so middleware.ts can be unit-tested.
// defineMiddleware is just an identity helper for typing in the real module.
export const defineMiddleware = <T>(fn: T): T => fn
