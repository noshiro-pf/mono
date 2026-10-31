import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForPlaywright,
  eslintConfigForPreact,
  eslintConfigForReact,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  eslintImportsRules,
  mergeRestrictedImportsOptions,
  restrictedImportsOptions,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';
import {
  preactComponentDirs,
  synstateDomComponentDirs,
} from './configs/component-dirs.mjs';

const preactComponentGlobs = preactComponentDirs.map(
  (dir) => `src/components/${dir}/**/*.tsx`,
);

const synstateDomComponentGlobs = synstateDomComponentDirs.map(
  (dir) => `src/components/${dir}/**/*.tsx`,
);

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: import.meta.dirname,
    tsconfigFileName: 'tsconfig.json',
    packageDirs: [import.meta.dirname],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  {
    ignores: ['.astro/**', 'src/content.config.ts', 'astro.config.mjs'],
  },

  eslintConfigForVitest(),

  eslintConfigForPlaywright(['e2e/**']),

  // `eslintConfigForReact` takes `files` only, so the Preact and synstate-dom
  // directories are taken out through `ignores` on each of its entries; a `!`
  // inside a `files` glob is not a negation, and matches nothing.
  ...eslintConfigForReact(['src/components/**/*.tsx']).map((config) => ({
    ...config,
    ignores: [...preactComponentGlobs, ...synstateDomComponentGlobs],
  })),

  ...eslintConfigForPreact(preactComponentGlobs),

  {
    rules: defineKnownRules({
      'import-x/no-internal-modules': [
        'error',
        {
          allow: [
            ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
            '@astrojs/**',
            'jotai/utils',
            // The benchmark numbers the charts draw. `libs/synstate` does not
            // publish `samples/`, so there is no package entry point to
            // reach them through; see benchmark-chart/benchmark-data.mts.
            '**/libs/synstate/samples/docs-site/benchmark/*',
          ],
        },
      ],
    }),
  },

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-await-in-loop': 'off',
      'import-x/no-unassigned-import': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-default-export': 'off',
    }),
  },

  // Solid's root export is its server build under Node, where nothing
  // reacts; the benchmark imports the client build through one shim
  // (`throughput-demo/adapters/solid-js-client.mts`), and a bare import
  // would measure a graph that never updates. The spring demo's adapters
  // are loaded by the benchmark too, through `spring-demo/index.mts`.
  {
    files: [
      'src/components/throughput-demo/adapters/**',
      'src/components/spring-demo/adapters/**',
    ],
    ignores: ['**/*.d.mts'],
    rules: defineKnownRules({
      'no-restricted-imports': [
        'error',
        mergeRestrictedImportsOptions(restrictedImportsOptions, {
          // `solid-js/store`, `solid-js/web` and the rest resolve to server
          // builds too. The shim's own deep import is exempted beside it, and
          // a type-only import is allowed, since it is erased.
          patterns: [
            {
              regex: String.raw`^solid-js(?:/|$)`,
              allowTypeImports: true,
              message:
                "Import Solid through 'throughput-demo/adapters/solid-js-client.mjs', whose client build reacts under Node.",
            },
          ],
        }),
      ],
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
