import * as fs from 'node:fs';
import * as path from 'node:path';
import { Arr, isRecord } from 'ts-data-forge';
import { defineConfig, type Plugin as VitePlugin } from 'vite';
import { makeBuildId } from '../scripts/build-id.mjs';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { appDevPort } from '../../../tools/configs/app-dev-ports.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import { writeManifestVersion } from '../../../tools/configs/chrome-extension-manifest.mjs';

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
 * The pr-manager-app dev server, `pnpm run dev` and `pnpm run preview` alike,
 * as the origins its "split view" links come from while it is being worked on.
 *
 * `public/manifest.json` lets `https://noshiro-pf.github.io` open `split.html`;
 * a link clicked on the same page served from `localhost` is otherwise refused
 * with `ERR_BLOCKED_BY_CLIENT`, while the same URL pasted into the address bar
 * opens, which makes it look like a fault in the link. Added here rather than
 * written into the manifest so that the port has one source,
 * `app-dev-ports.mts`, and so that it is one port rather than all of
 * `localhost`.
 *
 * **A development build only.** Whatever else runs on that port on a
 * machine with the extension installed could open a split view of its
 * choosing, so a production build — the one `pack` and `pack:crx` make, and
 * the one the README installs — lists the published origin and nothing else.
 */
const addPrManagerDevOrigins = (outDir: string): VitePlugin => ({
  name: 'split-view:pr-manager-dev-origins',
  writeBundle: (): void => {
    const port = appDevPort(
      path.resolve(workspaceRootPath, '../pr-manager-app'),
    );

    const manifestPath = path.resolve(outDir, 'manifest.json');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const manifest: unknown = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    if (
      !isRecord(manifest) ||
      !Arr.isArray(manifest['web_accessible_resources'])
    ) {
      throw new Error('manifest.json has no web_accessible_resources array');
    }

    const devOrigins = [
      `http://localhost:${port}/*`,
      `http://127.0.0.1:${port}/*`,
    ] as const;

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(
      manifestPath,
      `${JSON.stringify(
        {
          ...manifest,
          web_accessible_resources: manifest['web_accessible_resources'].map(
            (entry) =>
              isRecord(entry) && Arr.isArray(entry['matches'])
                ? { ...entry, matches: [...entry['matches'], ...devOrigins] }
                : entry,
          ),
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
 * `public/manifest.json` is copied by Vite's `publicDir` handling and given the
 * `package.json` version on the way, so `dist/` is what `chrome://extensions`
 * loads as-is.
 */
export default defineConfig(({ mode }) => {
  /**
   * A development build carries the diagnostics and the pr-manager-app dev
   * server's origins; a production build carries neither.
   */
  const diagnostics = mode !== 'production';

  const outDir = path.resolve(workspaceRootPath, 'dist');

  const manifestVersion = writeManifestVersion({
    packageRoot: workspaceRootPath,
    outDir,
  });

  const plugins = diagnostics
    ? [
        stripCrossOriginAttribute(),
        manifestVersion,
        addPrManagerDevOrigins(outDir),
        addDiagnosticPermissions(outDir),
      ]
    : [stripCrossOriginAttribute(), manifestVersion];

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
      outDir,
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
