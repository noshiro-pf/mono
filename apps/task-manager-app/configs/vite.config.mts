import { type UserConfig } from 'vite';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteAppConfig } from '../../../tools/configs/vite-app-config.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { pagesAppBase } from '../../../tools/configs/pages-apps.mjs';

const shared: UserConfig = defineViteAppConfig({
  packageRoot: workspaceRootPath,
  framework: 'preact',
  // Served from the repository's Pages site rather than a host of its own,
  // so the asset URLs carry the whole prefix. The table it comes from is the
  // one `build-pages-site.mts` copies by.
  base: pagesAppBase(workspaceRootPath),
});

/**
 * ELK is under the Eclipse Public License 2.0, which asks that a distributed
 * copy keep its notice and say where the source is. The minifier drops the
 * notice the file carries, so it is put back in front of the chunk ELK ends
 * up in, after minification. See the elkjs entry in
 * `tools/configs/license-policy.mts`.
 */
const ELK_NOTICE = [
  '/*! elkjs (Eclipse Layout Kernel): Copyright (c) Kiel University and others.',
  ' * Available under the Eclipse Public License 2.0 (https://www.eclipse.org/legal/epl-2.0)',
  ' * or GPL-3.0-or-later. Source: https://github.com/kieler/elkjs */',
].join('\n');

export default {
  ...shared,
  build: {
    ...shared.build,
    rolldownOptions: {
      output: {
        postBanner: (chunk) =>
          chunk.moduleIds.some((id) => id.includes('/elkjs/'))
            ? ELK_NOTICE
            : '',
      },
    },
  },
  // Every third-party module the page reaches, named up front. The dev
  // server otherwise finds some only when they are first loaded — those
  // behind `main.tsx`'s dynamic imports (the backend, ELK), those behind the
  // dialog's (the date picker), and those the workspace siblings import —
  // optimizes them then and reloads the page, mid-run for the e2e suite. One
  // this package does not depend on itself is named through the sibling that
  // does. Blueprint's `react` and `react-dom` are `@preact/compat` (see
  // `package.json`), so they are bundled with it and need no entry.
  optimizeDeps: {
    include: [
      'ts-data-forge > @sindresorhus/is',
      'preact',
      'preact/hooks',
      'preact/jsx-runtime',
      'preact/compat',
      '@preact/signals',
      'elkjs/lib/elk.bundled.js',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      '@blueprintjs/datetime',
      'date-fns/locale',
    ],
  },
} satisfies UserConfig;
