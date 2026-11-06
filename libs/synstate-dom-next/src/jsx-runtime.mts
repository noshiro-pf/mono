/**
 * The module `"jsxImportSource": "synstate-dom-next"` makes TypeScript import
 * for `"jsx": "react-jsx"`. `jsxs` is the call for an element with several
 * children; both are the same factory.
 */
export {
  Fragment,
  createDescription as jsx,
  createDescription as jsxs,
  type JSX,
} from './jsx/index.mjs';
