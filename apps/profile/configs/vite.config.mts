// `@mdx-js/rollup`'s default export is named `rollup`; `import-x/no-rename-default`
// asks for that name, so the call below reads as `rollup(...)`.
import rollup from '@mdx-js/rollup';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Plugin as VitePlugin } from 'vite';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
import { routeList } from '../src/constants/routes.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteAppConfig } from '../../../tools/configs/vite-app-config.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { pagesAppBase } from '../../../tools/configs/pages-apps.mjs';

/**
 * A copy of the built `index.html` at each tab's path (`career/index.html`, …).
 *
 * The tabs are paths, and GitHub Pages has no rewrites: opening or reloading
 * `/mono/profile/skills/` asks for a file there, and without one it is the
 * site's 404. The site's single `404.html` belongs to the whole of
 * `noshiro-pf.github.io/mono/`, so it cannot be this app's fallback. The
 * routes are a fixed handful, so each gets the page itself — the asset URLs in
 * it are absolute (they carry `base`), so the copy loads from any depth.
 */
const routeEntryPages: VitePlugin = {
  name: 'profile:route-entry-pages',
  apply: 'build',
  writeBundle: ({ dir }): void => {
    if (dir === undefined) {
      throw new Error('profile: the build has no output directory.');
    }

    for (const route of routeList) {
      const routeDir = path.resolve(dir, `.${route}`);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.mkdirSync(routeDir, { recursive: true });

      fs.copyFileSync(
        path.resolve(dir, 'index.html'),
        path.resolve(routeDir, 'index.html'),
      );
    }
  },
};

const base = defineViteAppConfig({
  packageRoot: workspaceRootPath,
  framework: 'preact',
  // Served from the repository's Pages site rather than a host of its own,
  // so the asset URLs carry the whole prefix. The table it comes from is the
  // one `build-pages-site.mts` copies by.
  base: pagesAppBase(workspaceRootPath),
});

export default {
  ...base,

  // `src/assets/*.mdx` is the page copy. `jsxImportSource` has to match the
  // package's tsconfig so the compiled MDX uses preact's runtime. A Preact app
  // has no framework plugin, so this replaces an empty list.
  plugins: [rollup({ jsxImportSource: 'preact' }), routeEntryPages],
};
