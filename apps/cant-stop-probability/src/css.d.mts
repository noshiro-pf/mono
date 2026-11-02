/**
 * `main.tsx` imports `./index.css` for its side effect, which Vite resolves but
 * TypeScript does not. The CSS Modules beside the components need no such
 * declaration: `gen:css-module-types` writes a typed `*.module.d.css.ts` for
 * each.
 */
declare module '*.css' {}
