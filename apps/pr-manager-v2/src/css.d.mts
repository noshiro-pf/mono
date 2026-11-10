/**
 * `main.tsx` imports `./index.css` for its side effect, which a bundler
 * resolves but TypeScript does not.
 */
declare module '*.css' {}
