import viteReact from '@vitejs/plugin-react';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { parseSync, type UserConfig, type Plugin as VitePlugin } from 'vite';
import { appDevPort } from './app-dev-ports.mjs';

/**
 * Builds the Vite config for an app under `apps/` whose configs live in
 * `<package-root>/configs`.
 *
 * What every app shares is the shape: the package directory is the Vite root
 * (so `index.html` and `public/` are found where they sit), and the output goes
 * to `build/` — the directory `build-pages-site.mts` copies for an app on the
 * GitHub Pages site, and the one `firebase.json` serves for an app on
 * Firebase Hosting.
 *
 * Preact and synstate-dom apps pass no plugin. Vite's esbuild transform reads
 * `jsx` and `jsxImportSource` from the package's `tsconfig.json`, which already
 * say `react-jsx` and `preact` (or `synstate-dom`), so the build matches what
 * the type check sees.
 * `@vitejs/plugin-react` is here for React's Fast Refresh; the Preact
 * equivalent would pull Babel in, which is not worth it for a dev-server
 * nicety.
 *
 * The dev-server port comes from `app-dev-ports.mts`, keyed by the package
 * directory name, so that this config and the app's Playwright config cannot
 * disagree about it.
 */
export const defineViteAppConfig = ({
  packageRoot,
  framework,
  jsxImportSource,
  base,
  routePaths,
}: Readonly<{
  /** The package's root directory, i.e. the parent of `configs`. */
  packageRoot: string;
  framework: 'preact' | 'react' | 'synstate-dom';
  /**
   * Passed to `@vitejs/plugin-react` so that the build agrees with the
   * package's `tsconfig.json`. Emotion's `css` prop needs `'@emotion/react'`;
   * leave it off where the tsconfig does.
   */
  jsxImportSource?: string;
  /**
   * The path the built site is served under, for an app published to GitHub
   * Pages rather than to a Firebase host of its own. Pages serves this
   * repository at `/mono/`, and `build-pages-site.mts` puts each app in a
   * directory below that, so the asset URLs Vite writes have to carry the whole
   * prefix — the default `/` would ask the browser for
   * `noshiro-pf.github.io/assets/…` and get the user page's 404.
   *
   * Left off by the Firebase-hosted apps, which are served at the root of their
   * own domain.
   *
   * Given, it also brings {@link staleBuildRecovery}: the next deploy of the
   * Pages site removes the chunks of this build.
   */
  base?: string;
  /**
   * The app's screens, as paths below `base` (`/create/`, `/plan/edit/`):
   * the build writes a copy of `index.html` at each, so that GitHub Pages,
   * which has no rewrites, has a page for a direct visit or a reload there.
   * Only the finite set of screens goes here; a dynamic value such as an ID
   * goes in the query string. See `docs/frontend-hosting.md`.
   */
  routePaths?: readonly string[];
}>): UserConfig => {
  // `strictPort` so that a port already taken is an error rather than Vite
  // quietly moving to the next one — the e2e config points at this exact
  // number, and a silent move would leave it waiting on an empty port.
  const port = appDevPort(packageRoot);

  return {
    root: packageRoot,

    ...(base === undefined ? {} : { base }),

    build: {
      outDir: path.resolve(packageRoot, 'build'),
      emptyOutDir: true,
    },

    server: { port, strictPort: true },
    preview: { port, strictPort: true },

    plugins: [
      ...(framework === 'react' ? [viteReact({ jsxImportSource })] : []),
      ...(base === undefined ? [] : [staleBuildRecovery(base)]),
      ...(routePaths === undefined ? [] : [routeEntryPages(routePaths)]),
    ],
  };
};

/**
 * Copies the built `index.html` to `<route>/index.html` under `outDir` for each
 * of `routePaths`.
 *
 * The copies are the page itself: its asset URLs carry `base`, so it loads from
 * any depth, and the app stays one page — it routes with `history.pushState`,
 * and a copy is only what a direct visit or a reload of that path receives, as
 * a server rewrite would serve it.
 */
export const writeRouteEntryPages = (
  outDir: string,
  routePaths: readonly string[],
): void => {
  const indexHtml = path.resolve(outDir, 'index.html');

  for (const route of routePaths) {
    const relative = route.slice(1, -1);

    if (
      relative === '' ||
      !route.startsWith('/') ||
      !route.endsWith('/') ||
      relative.split('/').some((segment) => segment === '' || segment === '..')
    ) {
      throw new Error(
        `routePaths: "${route}" is not a route below the root, like "/create/".`,
      );
    }

    const routeDir = path.resolve(outDir, relative);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(routeDir, { recursive: true });

    fs.copyFileSync(indexHtml, path.resolve(routeDir, 'index.html'));
  }
};

/**
 * Recovers the page from a chunk an older build left behind, and fails the
 * build on an `import()` it would not recover from.
 *
 * Every push to `main` replaces the whole Pages site, so a page opened from the
 * browser's cache can run a build whose chunks are no longer served. What the
 * page does then is `stale-build-recovery.mts`; this puts it in the entry
 * chunk, as a module script ahead of the app's own in `index.html`, so it
 * listens before any of the app's own code runs. It learns of a failed `import()`
 * from Vite's preload helper, which wraps the `import()` calls Vite can see the
 * target of; {@link unwrappedDynamicImports} is what fails the build on any
 * other.
 *
 * Build-only: the dev server serves every module itself, from no older build.
 */
export const staleBuildRecovery = (base: string): VitePlugin =>
  ({
    name: 'vite-app-config:stale-build-recovery',
    apply: 'build',
    resolveId: (id) => (id === RECOVERY_SRC ? RECOVERY_ID : undefined),
    load: (id) =>
      id === RECOVERY_ID
        ? [
            `import { installStaleBuildRecovery } from ${JSON.stringify(RECOVERY_MODULE)};`,
            `installStaleBuildRecovery(${JSON.stringify(`stale-build-reloaded-at:${base}`)});`,
          ].join('\n')
        : undefined,
    // A tag of the `pre` hook is written into the page before Vite bundles its
    // scripts, so the recovery is bundled with them, and `head-prepend` puts it
    // first in document order.
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => ({
        html,
        tags: [
          {
            tag: 'script',
            attrs: { type: 'module', src: RECOVERY_SRC },
            injectTo: 'head-prepend',
          },
        ],
      }),
    },
    generateBundle: {
      order: 'post',
      handler: (_options, bundle): void => {
        const outputs = Object.values(bundle);

        const holdsRecovery = outputs.some(
          (output) =>
            output.type === 'chunk' && output.moduleIds.includes(RECOVERY_ID),
        );

        if (!holdsRecovery) {
          throw new Error(
            'stale-build-recovery: no chunk of the build holds the recovery that was put into index.html.',
          );
        }

        const unwrapped = outputs.flatMap((output) =>
          // Most chunks have no import() at all, and parsing is not free.
          output.type === 'chunk' && output.code.includes('import(')
            ? unwrappedDynamicImports(output.code).map(
                (call) => `${output.fileName}: ${call}` as const,
              )
            : [],
        );

        if (Arr.isNonEmpty(unwrapped)) {
          throw new Error(
            Arr.toUnshifted(
              "stale-build-recovery: Vite's preload helper does not wrap these import() calls, so a page whose build is gone from the site would not reload when they fail (tools/configs/stale-build-recovery.mts). Give each a string literal path Vite can resolve:",
            )(unwrapped.map((line) => `  ${line}`)).join('\n'),
          );
        }
      },
    },
  }) as const;

/**
 * The `import()` calls in a built chunk that Vite's preload helper does not
 * wrap, as written there. The helper is called as
 * `__vitePreload(() => import('./chunk.js'), deps)`; the function it is given
 * is sometimes an `async` one that picks names out of the module. Once
 * minified, the helper is called by a plain name, or is itself the function
 * called where the build is one chunk. So an `import()` passes when the
 * function nearest around it is the first argument, of two or more, of a call
 * to a plain name or a function, and its path is a string written out.
 * Anything else is reported, including shapes the helper may take in a later
 * Vite, which this would then have to learn.
 */
export const unwrappedDynamicImports = (code: string): readonly string[] => {
  const mut_found: string[] = [];

  const visit = (node: AstNode, wrapped: boolean): void => {
    if (
      node.type === 'ImportExpression' &&
      (!wrapped || !isStaticString(node['source']))
    ) {
      mut_found.push(code.slice(Number(node['start']), Number(node['end'])));
    }

    const helperFactory = helperFactoryOf(node);

    for (const value of Object.values(node)) {
      for (const child of Arr.isArray(value) ? value : [value]) {
        if (isAstNode(child)) {
          visit(
            child,
            child === helperFactory ||
              (!FUNCTION_TYPES.has(child.type) && wrapped),
          );
        }
      }
    }
  };

  const { program, errors } = parseSync('chunk.js', code);

  if (Arr.isNonEmpty(errors) || !isAstNode(program)) {
    throw new Error(
      `stale-build-recovery: a built chunk does not parse: ${errors.map((error) => error.message).join('; ')}`,
    );
  }

  visit(program, false);

  return mut_found;
};

/** The `src` `index.html` names the recovery by, and the module behind it. */
const RECOVERY_SRC = '/@stale-build-recovery';

const RECOVERY_ID = '\0vite-app-config:stale-build-recovery';

const RECOVERY_MODULE = path.resolve(
  import.meta.dirname,
  'stale-build-recovery.mts',
);

const FUNCTION_TYPES: ReadonlySet<string> = new Set<string>([
  'ArrowFunctionExpression',
  'FunctionExpression',
  'FunctionDeclaration',
]);

type AstNode = ReadonlyRecord<string, unknown> & Readonly<{ type: string }>;

const isAstNode = (value: unknown): value is AstNode =>
  isRecord(value) && hasKey(value, 'type') && typeof value.type === 'string';

/**
 * The function handed to what may be the preload helper, if `node` is a call of
 * one.
 */
const helperFactoryOf = (node: AstNode): unknown => {
  if (node.type !== 'CallExpression') {
    return undefined;
  }

  const callee = node['callee'];

  const args = node['arguments'];

  if (
    !isAstNode(callee) ||
    (callee.type !== 'Identifier' && callee.type !== 'FunctionExpression') ||
    !Arr.isArray(args) ||
    args.length < 2
  ) {
    return undefined;
  }

  const [factory] = args;

  return isAstNode(factory) && FUNCTION_TYPES.has(factory.type)
    ? factory
    : undefined;
};

const isStaticString = (node: unknown): boolean =>
  isAstNode(node) &&
  ((node.type === 'Literal' && typeof node['value'] === 'string') ||
    (node.type === 'TemplateLiteral' &&
      Arr.isArray(node['expressions']) &&
      Arr.isEmpty(node['expressions'])));

const routeEntryPages = (routePaths: readonly string[]): VitePlugin =>
  ({
    name: 'vite-app-config:route-entry-pages',
    apply: 'build',
    writeBundle: ({ dir }): void => {
      if (dir === undefined) {
        throw new Error(
          'route-entry-pages: the build has no output directory.',
        );
      }

      writeRouteEntryPages(dir, routePaths);
    },
  }) as const;
