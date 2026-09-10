/**
 * `main.tsx` imports `./style.css` for its side effect, which Vite resolves and
 * TypeScript does not.
 */
declare module '*.css' {}
