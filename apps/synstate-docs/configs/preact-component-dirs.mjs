/**
 * The directories under `src/components/` rendered with Preact; every other
 * component is React. `astro.config.mjs` excludes them from the React
 * integration and includes them in the Preact one, since a Preact component
 * the React plugin also claims gets React Fast Refresh injected into it, and
 * `eslint.config.mts` lints them with the Preact rules instead of the React
 * ones. A new Preact directory is added here and nowhere else.
 */
export const preactComponentDirs = [
  'preact-signals-demo',
  'signals-operators-demo',
];
