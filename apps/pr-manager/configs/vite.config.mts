import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Arr } from 'ts-data-forge';
import type { PluginOption, UserConfig, Plugin as VitePlugin } from 'vite';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { defineViteAppConfig } from '../../../tools/configs/vite-app-config.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { pagesAppBase } from '../../../tools/configs/pages-apps.mjs';

/**
 * What the page is allowed to talk to, written into the built `index.html`.
 *
 * A reader may paste a GitHub token into this page, and `connect-src` is
 * what keeps that from becoming a way to send it somewhere else: with one
 * host named and `default-src 'none'` behind it, no script this bundle ever
 * comes to contain can reach anywhere but `api.github.com`. That is a
 * property of the page rather than a promise about its code, which is the
 * only kind worth making about a secret somebody else typed in.
 *
 * `'unsafe-inline'` for styles and not for scripts, which is the asymmetry
 * that matters: the label chips and the ahead/behind bars carry `style`
 * attributes computed from the report, and an inline style cannot fetch
 * anything under this policy. `img-src data:` is for the SVG a chip may
 * inline. `frame-ancestors` is left out because a `<meta>` policy is not
 * allowed to set it — it needs a real header, and GitHub Pages sends
 * `X-Frame-Options: deny` on its own.
 *
 * Build-only, because the dev server's HMR talks to it over a websocket,
 * which `connect-src` would then have to name, and a policy loosened for that
 * would not be worth shipping.
 */
const contentSecurityPolicy: VitePlugin = {
  name: 'pr-manager:content-security-policy',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: () => [
      {
        tag: 'meta',
        injectTo: 'head-prepend',
        attrs: {
          'http-equiv': 'Content-Security-Policy',
          content: [
            "default-src 'none'",
            'connect-src https://api.github.com',
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            "base-uri 'none'",
            "form-action 'none'",
          ].join('; '),
        },
      },
    ],
  },
};

const shared: UserConfig = defineViteAppConfig({
  packageRoot: workspaceRootPath,
  framework: 'synstate-dom',
  // This app is served from the repository's Pages site rather than a host of
  // its own, so the asset URLs have to carry the whole prefix. The table it
  // comes from is the same one `build-pages-site.mts` copies by.
  base: pagesAppBase(workspaceRootPath),
});

/**
 * Copied because Vite declares `plugins` mutable while everything that builds
 * an array under the strict standard library hands back a readonly one.
 */
const plugins: PluginOption[] = Array.from(
  Arr.toPushed(shared.plugins ?? [], contentSecurityPolicy),
);

/**
 * A name for this build's sources, which the report kept for the next visit
 * is keyed by (`src/report-cache.mts`): a report is the page's own shape, so
 * one kept by other code is not read. A hash of the sources that shape it —
 * this app's and `pr-report-core`'s — rather than of the moment, so that the
 * same sources build the same bundle, and a deploy that changed neither
 * keeps every report kept before it.
 */
const sourcesHash = (dirs: readonly string[]): string => {
  const hash = createHash('sha256');

  for (const dir of dirs) {
    // The paths are this repository's own source directories.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const files = readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(entry.parentPath, entry.name))
      .toSorted();

    for (const file of files) {
      hash.update(path.relative(dir, file));

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      hash.update(readFileSync(file));
    }
  }

  return hash.digest('hex').slice(0, 16);
};

const define = {
  PR_MANAGER_BUILD_ID: JSON.stringify(
    sourcesHash([
      path.resolve(workspaceRootPath, 'src'),
      path.resolve(workspaceRootPath, '../../libs/pr-report-core/src'),
    ]),
  ),
} as const;

export default { ...shared, plugins, define } satisfies UserConfig;
