// `@mdx-js/rollup`'s default export is named `rollup`; `import-x/no-rename-default`
// asks for that name, so the call below reads as `rollup(...)`.
import rollup from '@mdx-js/rollup';
import { Arr } from 'ts-data-forge';
import type { PluginOption, UserConfig } from 'vite';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
import { routeList } from '../src/constants/routes.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteAppConfig } from '../../../tools/configs/vite-app-config.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { pagesAppBase } from '../../../tools/configs/pages-apps.mjs';

const base: UserConfig = defineViteAppConfig({
  packageRoot: workspaceRootPath,
  framework: 'synstate-dom',
  // Served from the repository's Pages site rather than a host of its own, so
  // the asset URLs carry the whole prefix. The table it comes from is the one
  // `build-pages-site.mts` copies by.
  base: pagesAppBase(workspaceRootPath),
  // Each tab is a path, which Pages can only answer with a page there.
  routePaths: routeList,
});

/**
 * `src/assets/*.mdx` is the page copy. `jsxImportSource` has to match the
 * package's tsconfig so the compiled MDX uses synstate-dom's runtime. That
 * runtime takes attribute names as HTML spells them (`class`, `for`) and style
 * properties as CSS does (`font-size`), so MDX is told to keep both: its
 * default React spelling would hand it `className`, set as an attribute of that
 * name, and `fontSize`, which `style.setProperty` ignores.
 *
 * Copied because Vite declares `plugins` mutable while everything that builds
 * an array under the strict standard library hands back a readonly one.
 */
const plugins: PluginOption[] = Array.from(
  Arr.toPushed(
    base.plugins ?? [],
    rollup({
      jsxImportSource: 'synstate-dom',
      elementAttributeNameCase: 'html',
      stylePropertyNameCase: 'css',
    }),
  ),
);

export default { ...base, plugins } satisfies UserConfig;
