import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import nodeSupport from './tools/configs/node-support.json' with { type: 'json' };
import { scriptsRunBeforeInstall } from './tools/configs/scripts-run-before-install.mjs';
import { projectRootPath } from './tools/scripts/project-root-path.mjs';

// The repository's own tooling runs on `volta.node`, which is
// `targets.current` (`check:root:node-support`), not on the `engines.node`
// floor the published packages promise.
const toolingNodeMajor = Number(nodeSupport.targets.current.split('.')[0]);

export default [
  {
    // Legacy monorepo contents. Excluded from the pnpm workspace, so its
    // dependencies are never installed and type-aware linting cannot resolve
    // them. Revived package by package into libs/ / apps/ over time.
    ignores: ['experimental/**', 'articles/**', 'books/**', 'docs/**'],
  },

  ...eslintConfigForTypeScript({
    tsconfigRootDir: projectRootPath,
    tsconfigFileName: 'tsconfig.json',
    packageDirs: [projectRootPath],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForNodeJs(['tools/**'], { nodeMajor: toolingNodeMajor }),
  {
    files: ['tools/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-await-in-loop': 'off',
      'import-x/no-unassigned-import': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-default-export': 'off',
    }),
  },
  {
    // A `**` in a glob pattern walks every directory below where the pattern
    // starts, the ones `.gitignore` ignores included. From the repository
    // root that is a whole copy of the repository for each git worktree a
    // session keeps under `.claude/worktrees/`, and a guard that walked them
    // ran out of heap. Read here: a string or template with `**` anywhere in
    // the first argument of a call to a function or method named `glob` or
    // `globSync`, whatever it comes from (`ts-repo-utils`'s `glob`, `fs.glob`,
    // `fs.globSync`), inside an array, a cast or a call such as `path.join`
    // too. A pattern held in a variable is not seen, nor a walk by other
    // means, such as `fs.readdir` with `recursive`.
    files: ['tools/scripts/**'],
    rules: defineKnownRules({
      'ts-restrictions/no-restricted-syntax': [
        'error',
        {
          selector: [
            'Literal.arguments:first-child[value=/\\*\\*/]',
            '.arguments:first-child Literal[value=/\\*\\*/]',
            '.arguments:first-child TemplateElement[value.raw=/\\*\\*/]',
          ]
            .map(
              (pattern) =>
                `CallExpression:matches([callee.name=/^glob(?:Sync)?$/u], [callee.property.name=/^glob(?:Sync)?$/u]) > ${pattern}`,
            )
            .join(', '),
          message:
            'A `**` in a glob pattern walks every directory below where it starts, the ignored ones included (from the root, each worktree under `.claude/worktrees/`). List the files with `listCheckoutFiles` from `tools/scripts/lib/repo-files.mts`, which asks git. A walk under one directory with nothing ignored in it may disable this on the line reported, naming the directory.',
        },
      ],
    }),
  },
  {
    // These run before ts-data-forge can be imported, so they import `node:*`
    // alone. Every rule of this plugin is about ts-data-forge's API, and its
    // fixes write an import of a package that is not there yet, so all of them
    // are off here, the ones it adds later included.
    files: [...scriptsRunBeforeInstall],
    rules: Object.fromEntries(
      Object.keys(eslintPluginTsDataForge.configs.recommended.rules).map(
        (rule) => [rule, 'off'] as const,
      ),
    ),
  },
] satisfies readonly FlatConfig[];
