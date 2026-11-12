import { Arr } from 'ts-data-forge';
import {
  BENCHMARK_DIRS,
  collectImportViolations,
  collectKeyStepViolations,
  isBenchmarkSource,
  runtimeClosure,
} from './check-synstate-benchmark-imports.mjs';

describe('runtimeClosure', () => {
  const manifests = [
    {
      name: '@synstate/docs',
      manifest: {
        dependencies: { synstate: 'workspace:*', react: '^19.0.0' },
        devDependencies: { 'eslint-config-typed': 'workspace:*' },
      },
    },
    {
      name: 'synstate',
      manifest: {
        dependencies: { 'ts-data-forge': 'workspace:^' },
        peerDependencies: { 'ts-type-forge': 'workspace:^' },
      },
    },
    { name: 'ts-data-forge', manifest: {} },
    { name: 'ts-type-forge', manifest: {} },
    {
      name: 'eslint-config-typed',
      manifest: { dependencies: { 'eslint-rule-forge': 'workspace:*' } },
    },
    { name: 'eslint-rule-forge', manifest: {} },
  ] as const;

  test('follows dependencies, optional and peer dependencies, not dev ones', () => {
    assert.deepStrictEqual(
      Array.from(runtimeClosure(manifests, '@synstate/docs')).toSorted(),
      ['synstate', 'ts-data-forge', 'ts-type-forge'],
    );
  });
});

describe('collectImportViolations', () => {
  const workspaceNames = new Set<string>([
    '@synstate/docs',
    'synstate',
    'ts-data-forge',
    'eslint-config-typed',
  ]);

  const closure = new Set<string>(['synstate', 'ts-data-forge']);

  test('accepts imports of packages in the closure, of npm packages and relative ones', () => {
    assert.deepStrictEqual(
      collectImportViolations({
        files: [
          {
            file: 'libs/synstate/samples/docs-site/benchmark/a.mts',
            source: [
              "import { createState } from 'synstate';",
              "import { Arr } from 'ts-data-forge';",
              "import { atom } from 'jotai';",
              "import { shared } from './shared.mjs';",
              "const lazy = await import('ts-data-forge');",
            ].join('\n'),
          },
        ],
        workspaceNames,
        closure,
      }),
      [],
    );
  });

  test('names the file and the package of a workspace import outside the closure', () => {
    assert.deepStrictEqual(
      collectImportViolations({
        files: [
          {
            file: 'apps/synstate-docs/scripts/benchmark/run.mts',
            source: [
              "import { x } from 'eslint-config-typed';",
              "export { y } from '@synstate/docs';",
              "const z = await import('eslint-config-typed/sub');",
            ].join('\n'),
          },
        ],
        workspaceNames,
        closure,
      }),
      [
        'apps/synstate-docs/scripts/benchmark/run.mts: imports `eslint-config-typed`',
        'apps/synstate-docs/scripts/benchmark/run.mts: imports `@synstate/docs`',
      ],
    );
  });

  test('names a relative import of a file the key does not digest', () => {
    assert.deepStrictEqual(
      collectImportViolations({
        files: [
          {
            file: 'apps/synstate-docs/src/components/throughput-demo/adapters/a.mts',
            source: [
              "import { shared } from './shared.mjs';",
              "import { spring } from '../../spring-demo/types.mjs';",
              "import { demo } from '../../spring-demo/spring-demo.jsx';",
              "import { page } from '../index.mjs';",
            ].join('\n'),
          },
        ],
        workspaceNames,
        closure,
      }),
      [
        'apps/synstate-docs/src/components/throughput-demo/adapters/a.mts: imports `../../spring-demo/spring-demo.jsx`, a file the key does not digest',
        'apps/synstate-docs/src/components/throughput-demo/adapters/a.mts: imports `../index.mjs`, a file the key does not digest',
      ],
    );
  });

  test('reads a type-only import too', () => {
    assert.deepStrictEqual(
      collectImportViolations({
        files: [
          {
            file: 'f.mts',
            source: "import type { T } from 'eslint-config-typed';",
          },
        ],
        workspaceNames,
        closure,
      }),
      ['f.mts: imports `eslint-config-typed`'],
    );
  });
});

describe('isBenchmarkSource', () => {
  test.each([
    'libs/synstate/samples/docs-site/benchmark/00-single-state.jotai.mts',
    'apps/synstate-docs/scripts/benchmark/run-deep-chain.mts',
    'apps/synstate-docs/src/components/throughput-demo/adapters/jotai-adapter.mts',
    'apps/synstate-docs/src/components/spring-demo/types.mts',
    'apps/synstate-docs/src/components/spring-demo/adapters/x.mts',
  ])('takes %s', (file) => {
    assert.isTrue(isBenchmarkSource(file));
  });

  test.each([
    'apps/synstate-docs/scripts/benchmark/median.test.mts',
    'apps/synstate-docs/src/components/spring-demo/spring-demo.tsx',
    'apps/synstate-docs/src/components/throughput-demo/index.mts',
    'apps/synstate-docs/scripts/benchmark/README.md',
  ])('leaves out %s', (file) => {
    assert.isFalse(isBenchmarkSource(file));
  });
});

describe('collectKeyStepViolations', () => {
  const step = Arr.toUnshifted(
    "mapfile -t packages < <(pnpm --filter-prod '@synstate/docs^...' ls --depth -1 --parseable)",
  )(BENCHMARK_DIRS).join('\n');

  test('accepts a key step naming the closure and every benchmark directory', () => {
    assert.deepStrictEqual(collectKeyStepViolations(step), []);
  });

  test('names what the key step no longer has', () => {
    assert.deepStrictEqual(
      collectKeyStepViolations(
        step
          .replace(BENCHMARK_DIRS[0], '')
          .replace('--filter-prod', '--filter'),
      ),
      [
        "the key no longer reads `pnpm --filter-prod '@synstate/docs^...'`",
        `the key no longer digests \`${BENCHMARK_DIRS[0]}\``,
      ],
    );
  });
});
