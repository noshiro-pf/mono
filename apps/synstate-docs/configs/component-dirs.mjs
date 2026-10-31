/**
 * The directories under `src/components/` that are not React; every other
 * component is. A new directory of either kind is added here and nowhere else.
 *
 * - Preact: `astro.config.mjs` excludes them from the React integration and
 *   includes them in the Preact one, since a Preact component the React plugin
 *   also claims gets React Fast Refresh injected into it, and
 *   `eslint.config.mts` lints them with the Preact rules instead of the React
 *   ones.
 * - synstate-dom: no integration renders them. Each file selects synstate-dom
 *   as its JSX runtime with a `jsxImportSource` pragma, and an `.astro`
 *   island mounts it with `render` from a `<script>`. They are excluded from the React
 *   integration and from the React lint rules for the same reasons.
 */
export const preactComponentDirs = [
  'preact-signals-demo',
  'signals-operators-demo',
];

export const synstateDomComponentDirs = ['synstate-dom-demo'];
