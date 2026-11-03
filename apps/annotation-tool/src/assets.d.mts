/**
 * The app imports its sample image as a URL and `main.tsx` imports
 * `./index.css` for its side effect; a bundler resolves both, TypeScript does
 * not. The CSS Modules beside the components need no such declaration:
 * `gen:css-module-types` writes a typed `*.module.d.css.ts` for each.
 */
declare module '*.jpg' {
  const url: string;

  // This declaration describes what a bundler gives the importer, and that is a
  // default.
  // eslint-disable-next-line import-x/no-default-export
  export default url;
}

/** Imported for its side effect by `main.tsx`; a bundler resolves it. */
declare module '*.css' {}
