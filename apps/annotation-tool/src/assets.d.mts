/**
 * The app imports its sample image as a URL and `main.tsx` imports
 * `./index.css` for its side effect; a bundler resolves both, TypeScript does
 * not. The pre-restoration app got this from
 * `/// <reference types="vite/client" />` in `src/vite-env.d.ts`, alongside the
 * `@noshiro/global-*` references that made `styled`, `memoNamed`, `Arr` and the
 * rest implicit globals. Those are gone and the imports are explicit now;
 * `vite` is not a dependency here, because nothing in this package builds.
 */
declare module '*.jpg' {
  const url: string;

  // This declaration describes what a bundler gives the importer, and that is
  // a default.
  // eslint-disable-next-line import-x/no-default-export
  export default url;
}

/** Imported for its side effect by `main.tsx`; a bundler resolves it. */
declare module '*.css' {}
