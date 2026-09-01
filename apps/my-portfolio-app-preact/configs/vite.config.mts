// `@mdx-js/rollup`'s default export is named `rollup`; `import-x/no-rename-default`
// asks for that name, so the call below reads as `rollup(...)`.
import rollup from '@mdx-js/rollup';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteAppConfig } from '../../../tools/configs/vite-app-config.mjs';

const base = defineViteAppConfig({
  packageRoot: workspaceRootPath,
  framework: 'preact',
});

export default {
  ...base,

  // `src/assets/*.mdx` is the page copy. `jsxImportSource` has to match the
  // package's tsconfig so the compiled MDX uses preact's runtime. A Preact app
  // has no framework plugin, so this replaces an empty list.
  plugins: [rollup({ jsxImportSource: 'preact' })],
};
