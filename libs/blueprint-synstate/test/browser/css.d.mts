/**
 * `visual-parity.test.tsx` imports Blueprint's style sheets for their side
 * effect, which Vite resolves and TypeScript does not.
 */
declare module '*.css' {}
