/**
 * `main.tsx` imports `./index.css` for its side effect, which a bundler
 * resolves but TypeScript does not. The pre-restoration app got this from
 * `/// <reference types="vite/client" />` in `src/vite-env.d.ts`, alongside the
 * `@noshiro/global-*` references that made the styling helpers, the dictionary
 * and the rest implicit globals. Those are gone and the imports are explicit
 * now; `vite` is not a dependency here, because nothing in this package builds.
 */
declare module '*.css' {}
