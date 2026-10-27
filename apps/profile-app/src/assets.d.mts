/**
 * What Vite gives the source beyond TypeScript: `import.meta.env.BASE_URL`,
 * which `router.mts` reads, the screenshots imported as URLs, and the
 * side-effect import of `./index.css` in `main.tsx`.
 */
/// <reference types="vite/client" />

/**
 * Prose sections authored as MDX. They are rendered with no props
 * (`<CareerMdx />`), so the component type says exactly that rather than
 * repeating the pre-restoration `(props) => JSX.Element`, whose `props` was an
 * implicit `any`.
 */
declare module '*.mdx' {
  // `import('preact')` rather than a top-level `import`: this file's wildcard
  // declaration only works while it stays a script. One top-level import turns
  // it into a module, and `*.mdx` stops resolving.
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const MdxComponent: import('preact').FunctionComponent<
    ReadonlyRecord<string, never>
  >;

  // As above: what the loader hands the importer is a default export.
  // eslint-disable-next-line import-x/no-default-export
  export default MdxComponent;
}
