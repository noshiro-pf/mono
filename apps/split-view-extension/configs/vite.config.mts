import * as fs from 'node:fs';
import * as path from 'node:path';
import { Arr, isRecord } from 'ts-data-forge';
import { defineConfig, type Plugin as VitePlugin } from 'vite';
import { makeBuildId } from '../scripts/build-id.mjs';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';

/**
 * The permissions the diagnostics need, and nothing else needs.
 *
 * They are added to the manifest of a development build only: `webRequest` and
 * `webNavigation` see every frame in the browser, and an extension that keeps
 * them around for a panel nobody opens is asking for more than it uses. The
 * code behind them is compiled out of a production build by
 * `SPLIT_VIEW_DIAGNOSTICS`, so the two go together.
 */
const diagnosticPermissions: readonly string[] = [
  'declarativeNetRequestFeedback',
  'webNavigation',
  'webRequest',
];

/** Adds those permissions to the manifest Vite has just copied. */
const addDiagnosticPermissions = (outDir: string): VitePlugin => ({
  name: 'split-view:diagnostic-permissions',
  writeBundle: (): void => {
    const manifestPath = path.resolve(outDir, 'manifest.json');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const manifest: unknown = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    if (!isRecord(manifest) || !Arr.isArray(manifest['permissions'])) {
      throw new Error('manifest.json has no permissions array');
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(
      manifestPath,
      `${JSON.stringify(
        {
          ...manifest,
          permissions: [...manifest['permissions'], ...diagnosticPermissions],
        },
        undefined,
        2,
      )}\n`,
    );
  },
});

/**
 * Vite marks the tags it injects into the HTML `crossorigin`, which makes the
 * browser fetch them in CORS mode. Same-origin `chrome-extension://` responses
 * carry no CORS headers, so this is at best redundant and at worst a load
 * failure; the attribute means nothing for an extension page either way.
 *
 * Declared above the config because that is what uses it.
 */
const stripCrossOriginAttribute = (): VitePlugin => ({
  name: 'split-view:strip-crossorigin',
  transformIndexHtml: (html: string): string =>
    html.replaceAll(' crossorigin', ''),
});

/**
 * The build of everything that runs as an ES module: the split-view page and
 * the service worker. The content script is a separate build — a content
 * script cannot be a module, so it needs its own format. See
 * `vite.content.config.mts`.
 *
 * `public/manifest.json` is copied verbatim by Vite's `publicDir` handling, so
 * `dist/` is what `chrome://extensions` loads as-is.
 */
export default defineConfig(({ mode }) => {
  /** A development build carries the diagnostics; a production build does not. */
  const diagnostics = mode !== 'production';

  const plugins = diagnostics
    ? [
        stripCrossOriginAttribute(),
        addDiagnosticPermissions(path.resolve(workspaceRootPath, 'dist')),
      ]
    : [stripCrossOriginAttribute()];

  return {
    root: workspaceRootPath,

    // Every build gets a name, which the page shows. See `scripts/build-id.mts`.
    define: {
      SPLIT_VIEW_BUILD_ID: JSON.stringify(
        `${makeBuildId()}${diagnostics ? ' dev' : ''}`,
      ),
      SPLIT_VIEW_DIAGNOSTICS: JSON.stringify(diagnostics),
    },

    // A page loaded from `chrome-extension://<id>/split.html` resolves
    // `./main.js` against the extension root, which is what `dist/` is. An
    // absolute `/main.js` would work too; a relative base keeps the output
    // independent of where it is mounted.
    base: './',

    build: {
      outDir: path.resolve(workspaceRootPath, 'dist'),
      emptyOutDir: true,
      sourcemap: true,

      // The extension page's CSP is `script-src 'self'`, which forbids inline
      // scripts — and Vite's module-preload polyfill is an inline script. Chrome
      // supports `modulepreload` natively, so there is nothing to polyfill.
      modulePreload: false,

      // Only ever loaded by the Chrome the manifest's `minimum_chrome_version`
      // names, so there is no reason to down-level anything.
      target: 'chrome116',

      rollupOptions: {
        input: {
          split: path.resolve(workspaceRootPath, 'split.html'),
          background: path.resolve(workspaceRootPath, 'src/background.mts'),
        },
        output: {
          // The manifest names `background.js` by path, so the entry file names
          // have to be predictable rather than hashed.
          entryFileNames: '[name].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },

    plugins,
  };
});
