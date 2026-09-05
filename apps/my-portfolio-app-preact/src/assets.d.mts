/**
 * The app imports its screenshots as URLs, which a bundler resolves but
 * TypeScript does not. The pre-restoration app got this from
 * `/// <reference types="vite/client" />` in `src/vite-env.d.ts`, alongside the
 * `@noshiro/global-*` references that made `styled`, `memoNamed`, `Arr` and the
 * rest implicit globals. Those are gone and the imports are explicit now;
 * `vite` is not a dependency here, because nothing in this package builds.
 */
declare module '*.png' {
  const url: string;

  // This declaration describes what a bundler gives the importer, and that is
  // a default.
  // eslint-disable-next-line import-x/no-default-export
  export default url;
}

/**
 * Prose sections authored as MDX. They are rendered with no props
 * (`<CareerMdx />`), so the component type says exactly that rather than
 * repeating the pre-restoration `(props) => JSX.Element`, whose `props` was an
 * implicit `any`.
 */
declare module '*.mdx' {
  // `import('preact')` rather than a top-level `import`: this file's wildcard
  // declarations only work while it stays a script. One top-level import turns
  // it into a module, and `*.png` / `*.mdx` / `*.css` all stop resolving.
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const MdxComponent: import('preact').FunctionComponent<
    ReadonlyRecord<string, never>
  >;

  // As above: what the loader hands the importer is a default export.
  // eslint-disable-next-line import-x/no-default-export
  export default MdxComponent;
}

/** Imported for its side effect by `main.tsx`; a bundler resolves it. */
declare module '*.css' {}
