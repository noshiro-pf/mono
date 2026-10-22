/**
 * The module `"jsxImportSource": "synstate-dom"` makes TypeScript import for
 * `"jsx": "react-jsx"`. `jsxs` is the call for an element with several
 * children; both are the same factory.
 */
export {
  Fragment,
  createMountable as jsx,
  createMountable as jsxs,
  type JSX,
} from './jsx/index.mjs';
