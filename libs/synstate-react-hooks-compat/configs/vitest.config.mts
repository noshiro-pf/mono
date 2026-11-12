import { playwright } from '@vitest/browser-playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Arr, isRecord } from 'ts-data-forge';
import type { TestProjectConfiguration, ViteUserConfig } from 'vitest/config';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';
// eslint-disable-next-line import-x/no-relative-packages
import * as viteConfig from '../../../tools/configs/vite-config.mjs';

const alias = {
  'synstate-react-hooks-compat': path.resolve(
    workspaceRootPath,
    './src/index.mts',
  ),
  synstate: path.resolve(workspaceRootPath, '../synstate/src/index.mts'),
} as const;

const browser = {
  provider: playwright(),
  includeSource: ['src/**/*.mts'],
  include: ['src/**/*.test.mts', 'test/**/*.test.mts'],
  // The legacy React projects' own tests, which need React before 18.
  exclude: Arr.toPushed(viteConfig.defaultExclude, 'test/legacy-react/**'),
  optimizeDepsInclude: [
    '@testing-library/react',
    'react',
    'react-dom',
    'react-dom/client',
    'react-dom/server',
    'use-sync-external-store/shim',
  ],
} as const;

const config = viteConfig.defineViteConfig({
  packageRoot: workspaceRootPath,
  alias,
  // `test/browser/` renders components, so it belongs to the browser project
  // alone; everything directly under `test/` runs in both.
  node: {
    include: ['src/**/*.test.mts', 'test/*.test.mts'],
  },
  browser,
});

/**
 * The directory of a package of version `version`, given the URL of its
 * `package.json`, which `import.meta.resolve` finds under the aliased name this
 * package installs it as. Throws for another version, as `pnpm update
 * --latest` would leave it: the project would run on the latest React, skip
 * what only the latest React does, and pass.
 */
const installedDir = (packageJsonUrl: string, version: string): string => {
  const file = fileURLToPath(packageJsonUrl);

  const manifest: unknown = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(file, 'utf8'),
  );

  if (
    !isRecord(manifest) ||
    typeof manifest['version'] !== 'string' ||
    !manifest['version'].startsWith(`${version}.`)
  ) {
    throw new Error(
      `${file}: the React ${version} browser project needs version ${version}.x.`,
    );
  }

  return path.dirname(file);
};

const reactVersions = [
  {
    version: '17',
    react: installedDir(import.meta.resolve('react-17/package.json'), '17'),
    reactDom: installedDir(
      import.meta.resolve('react-dom-17/package.json'),
      '17',
    ),
  },
  {
    version: '16.8',
    react: installedDir(import.meta.resolve('react-16/package.json'), '16.8'),
    reactDom: installedDir(
      import.meta.resolve('react-dom-16/package.json'),
      '16.8',
    ),
  },
] as const;

/**
 * A browser project that runs the tests on an older React, one of those this
 * package exists for (`peerDependencies.react`), installed under the aliased
 * names in {@link reactVersions}.
 *
 * The aliases below, not pnpm, pair them: pnpm gives `react-dom-16`,
 * `react-dom-17` and `@testing-library/react-12` the workspace's React as their
 * peer, and the aliases redirect every import of `react` and `react-dom`,
 * theirs included, as Vite bundles them. `@testing-library/react` becomes
 * `test/legacy-react/testing-library-react.mts`.
 *
 * A test of what only a later React does skips itself by `React.version`, or
 * expects what these versions do instead.
 *
 * The Node.js project has no such twin: there React is loaded by Node.js, which
 * no alias reaches. The files directly under `test/`, server rendering
 * included, run in these projects all the same.
 */
const legacyReactProject = ({
  version,
  react,
  reactDom,
}: (typeof reactVersions)[number]): TestProjectConfiguration =>
  viteConfig.defineBrowserProject({
    packageRoot: workspaceRootPath,
    name: `Browser (React ${version})`,
    alias: [
      ...Object.entries(alias).map(([find, replacement]) => ({
        find,
        replacement,
      })),
      {
        find: /^@testing-library\/react$/u,
        replacement: path.resolve(
          workspaceRootPath,
          './test/legacy-react/testing-library-react.mts',
        ),
      },
      { find: /^react(?=$|\/)/u, replacement: react },
      { find: /^react-dom(?=$|\/)/u, replacement: reactDom },
    ],
    browser: {
      ...browser,
      // `react-dom/client` came in React 18; `test/legacy-react/` hydrates the
      // way React 16.8 and 17 do instead.
      exclude: Arr.toPushed(
        viteConfig.defaultExclude,
        'test/browser/hydrate.test.mts',
      ),
      optimizeDepsInclude: [
        '@testing-library/react-12',
        'react',
        'react-dom',
        'react-dom/server',
        'react-dom/test-utils',
        'use-sync-external-store/shim',
      ],
    },
  });

export default {
  ...config,
  test: {
    ...config.test,
    projects: [
      ...config.test.projects,
      ...reactVersions.map(legacyReactProject),
    ],
  },
} satisfies ViteUserConfig;
