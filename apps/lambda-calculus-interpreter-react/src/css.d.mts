/**
 * `main.tsx` imports `./index.css` for its side effect, which a bundler
 * resolves but TypeScript does not.
 *
 * The pre-restoration app got this from `/// <reference types="vite/client" />`
 * in `src/vite-env.d.ts`, together with the `@noshiro/global-*` references that
 * made `styled`, `css`, `pipe` and the rest implicit globals. Those are gone
 * and the imports are explicit now; `vite` is not a dependency here, because
 * nothing in this package builds. So the one declaration that was doing real
 * work is kept, on its own.
 */
declare module '*.css' {}
