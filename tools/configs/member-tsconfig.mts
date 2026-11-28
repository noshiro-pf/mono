import type { ReadonlyRecord, StrictPick } from 'ts-type-forge';

/**
 * What `gen:tsconfig` (`tools/scripts/cmd/gen-tsconfig.mts`) cannot read off a
 * workspace member when it writes the member's `tsconfig.json`: the JSX
 * factory, whether the member runs under Node.js alone, and every departure
 * from the derived file, each with the note the generator writes above it.
 *
 * A member with no entry gets the derived file. An entry that adds compiler
 * options, leaves out a directory, excludes a file, maps the package's own name
 * without `samples/` or drops the Vite base has to say why in `notes`; the
 * generator refuses one that does not.
 */
export type MemberTsconfig = Readonly<{
  /**
   * The `jsxImportSource`. The shared base already sets `jsx: 'react-jsx'`,
   * whose default source is React, so a React member needs no entry.
   */
  jsx?: 'synstate-dom' | 'preact' | '@emotion/react';

  /** Adds `tsconfig.node-only.json`, which drops the DOM lib, to `extends`. */
  nodeOnly?: true;

  /** Leaves `tsconfig.vite.json` out of `extends`. Needs `notes.extends`. */
  withoutVite?: true;

  /**
   * Maps the package's own name to its source though it has no `samples/`.
   * Needs `notes.paths`.
   */
  selfPaths?: true;

  /** Further compiler options. Needs `notes.compilerOptions`. */
  compilerOptions?: ReadonlyRecord<string, unknown>;

  /** Files and directories beside the derived directories. */
  includeFiles?: readonly string[];

  /** Directories that exist but are checked elsewhere. Needs `notes.include`. */
  omitDirs?: readonly MemberDir[];

  /** Needs `notes.exclude`. */
  exclude?: readonly string[];

  /**
   * The comment written above each block. `libReplacement` is written after the
   * standard note on the strict standard library; `include` replaces the
   * derived note on `./test`, if there is one.
   */
  notes?: Readonly<{
    extends?: string;
    libReplacement?: string;
    jsx?: string;
    compilerOptions?: string;
    paths?: string;
    include?: string;
    exclude?: string;
  }>;
}>;

/** The directories `include` is derived from, in the order it lists them. */
export const memberDirs = [
  'src',
  'test',
  'e2e',
  'samples',
  'scripts',
  'configs',
] as const;

export type MemberDir = (typeof memberDirs)[number];

const cssModules = {
  compilerOptions: { allowArbitraryExtensions: true },
  notes: {
    compilerOptions:
      'CSS Modules: `allowArbitraryExtensions` lets an import of `x.module.css` resolve to the `x.module.d.css.ts` that `gen:css-module-types` writes.',
  },
} as const satisfies MemberTsconfig;

const chromeTypes = {
  compilerOptions: {
    types: [
      'eslint-config-typed/vitest-globals',
      'vitest/importMeta',
      'node',
      'chrome',
    ],
  },
  notes: {
    compilerOptions:
      '`chrome` on top of what tsconfig.vite.json lists: the extension APIs are global, so they arrive through `types` rather than through an import.',
  },
} as const satisfies MemberTsconfig;

const astroDocs = (
  includeNote: string,
): StrictPick<
  MemberTsconfig,
  'exclude' | 'includeFiles' | 'notes' | 'omitDirs'
> =>
  ({
    includeFiles: ['./astro.config.mjs'],
    omitDirs: ['src'],
    exclude: ['./src/content.config.ts'],
    notes: {
      include: `${includeNote} The pages under \`src/\` are Astro's, which \`astro check\` reads.`,
      exclude:
        "It imports `astro:content`, a module only Astro's own type generation declares, so `tsc` cannot resolve it.",
    },
  }) as const;

/** Keyed by member directory, repository-relative. */
export const memberTsconfigs: ReadonlyRecord<string, MemberTsconfig> = {
  'apps/algo-app': { jsx: 'synstate-dom', ...cssModules },
  'apps/annotation-tool': { jsx: 'synstate-dom', ...cssModules },
  'apps/cant-stop-probability': { jsx: 'synstate-dom', ...cssModules },
  'apps/catan-dice': { jsx: 'synstate-dom', ...cssModules },
  'apps/color-demo': { jsx: 'synstate-dom', ...cssModules },
  'apps/event-schedule-app': { jsx: 'synstate-dom', ...cssModules },
  'apps/event-schedule-app-functions': { nodeOnly: true },
  'apps/event-schedule-app-shared': { nodeOnly: true },
  'apps/github-view-defaults-extension': chromeTypes,
  'apps/housing-loan-calculator': { jsx: 'synstate-dom', ...cssModules },
  'apps/lambda-calculus-interpreter-core': { nodeOnly: true },
  'apps/lambda-calculus-interpreter-preact': { jsx: 'preact' },
  'apps/lambda-calculus-interpreter-react': {
    jsx: '@emotion/react',
    notes: {
      jsx: "Emotion's `css` prop: the JSX factory has to come from @emotion/react.",
    },
  },
  'apps/lambda-calculus-interpreter-synstate-dom': {
    jsx: 'synstate-dom',
    ...cssModules,
  },
  'apps/life-plan-simulator': { jsx: 'synstate-dom' },
  'apps/mahjong-calculator-app': { jsx: 'synstate-dom', ...cssModules },
  'apps/mui-look': { jsx: 'synstate-dom' },
  'apps/poll-discord-app': { nodeOnly: true },
  'apps/pr-manager': { jsx: 'synstate-dom' },
  'apps/pr-manager-v2': { jsx: 'synstate-dom' },
  'apps/preact-utils': { jsx: 'preact' },
  'apps/profile': { jsx: 'synstate-dom', ...cssModules },
  'apps/slack-archive-tools': { nodeOnly: true },
  'apps/split-view-extension': { jsx: 'synstate-dom', ...chromeTypes },
  'apps/split-view-extension-v2': { jsx: 'synstate-dom', ...chromeTypes },
  'apps/split-view-link': {
    compilerOptions: { lib: ['ES2023', 'DOM', 'DOM.Iterable'] },
    notes: {
      compilerOptions:
        'Runs in the extension, whose manifest asks for Chrome 116: ES2023 is the newest ECMAScript edition it implements whole, so a newer language API, such as the iterator helpers of Chrome 122, does not type-check here. The DOM lib is not capped: a DOM API newer than Chrome 116 still does.',
    },
  },
  'apps/synstate-docs': {
    includeFiles: ['./astro.config.mjs'],
    exclude: ['./src/content.config.ts'],
    notes: {
      exclude:
        "It imports `astro:content`, a module only Astro's own type generation declares, so `tsc` cannot resolve it.",
    },
  },
  'apps/synstate-dom-benchmark': {
    jsx: 'synstate-dom',
    notes: {
      jsx: 'The default for the files with no pragma. `frameworks/solid.tsx` and `frameworks/preact-signals.tsx` name their own with `@jsxImportSource`.',
    },
  },
  'apps/synstate-dom-docs': {
    jsx: 'synstate-dom',
    ...astroDocs(
      "Every code block on the site is a file in `samples/`, checked as a consumer would write it: against synstate-dom's published types.",
    ),
  },
  'apps/synstate-dom-sample-app': { jsx: 'synstate-dom' },
  'apps/synstate-router-dom-sample-app': { jsx: 'synstate-dom' },
  'apps/task-manager': { jsx: 'synstate-dom' },
  'apps/ts-fortress-types': { nodeOnly: true },
  'apps/ts-utils-additional': { nodeOnly: true },
  'languages/sumi/conformance': {
    notes: {
      include:
        "`fixtures/` is deliberately NOT included: invalid fixtures contain code that violates the language rules (and sometimes the repository's own compiler settings) on purpose. The runner reads them as text.",
    },
  },
  'libs/better-preact-use-state': { jsx: 'preact' },
  'libs/blueprint-synstate': { jsx: 'synstate-dom' },
  'libs/eslint-config-typed': {
    nodeOnly: true,
    includeFiles: ['vitest-globals.d.ts'],
  },
  'libs/eslint-plugin-synstate': {
    notes: {
      include:
        '`./test` holds `strict-lib-active.mts`, the probe that fails when the replacement above stops happening, and `fixtures/`, the modules a typed rule test lints against: they have to be in this project for the project service to find them. Neither is published — `files` lists `src` and `dist`.',
    },
  },
  'libs/eslint-plugin-ts-data-forge': {
    notes: {
      include:
        '`./test` holds no test, only files this type check is the test of: `strict-lib-active.mts`, the probe that fails when the replacement above stops happening, `arr-tail-ts2590.mts`, whose header says what it watches, `range-for-loop-fix-output.mts`, the fixes of `prefer-range-for-loop` compiled against `range`, `as-int-fix-output.mts`, the fixes of `prefer-as-int` compiled against the cast functions, and `largest-literal-count.mts`, the largest literal count `prefer-canonical-array-slicing` fixes. It is not published — `files` lists `src` and `dist`.',
    },
  },
  'libs/eslint-plugin-ts-type-forge': {
    compilerOptions: { lib: ['ESNext'] },
    notes: {
      libReplacement:
        '`ts-type-forge` itself is deliberately opted *out*, and `paths` below resolves it from source, so its declarations are checked here under the replacement. That is safe only as far as it is measured — see the note in docs/strict-typescript-lib-integration.md.',
      compilerOptions:
        'ts-type-forge asserts exact type equality against Node types (e.g. DeepReadonly<URL>); pulling in the DOM lib resolves those globals to the DOM shapes instead and breaks the assertions.',
    },
  },
  'libs/github-settings-as-code': { nodeOnly: true },
  'libs/synstate-dom': {
    jsx: 'synstate-dom',
    selfPaths: true,
    notes: {
      paths:
        '`jsxImportSource` names this package itself, and the tests import it by name the way a consumer does. Mapped to the source so that they are checked against the code being edited rather than against the last build. See docs/workspace-package-linking.md.',
    },
  },
  'libs/synstate-i18n': { jsx: 'synstate-dom' },
  'libs/synstate-preact-hooks': { jsx: 'preact' },
  'libs/synstate-preact-signals': { jsx: 'preact' },
  'libs/synstate-router-dom': { jsx: 'synstate-dom' },
  'libs/synstate-router-preact': { jsx: 'preact' },
  'libs/ts-codemod-lib': {
    includeFiles: ['./test-code'],
  },
  'libs/ts-repo-utils': { nodeOnly: true },
} as const;

/** Members whose `tsconfig.json` is written by hand, each with its reason. */
export const handWritten: ReadonlyRecord<string, string> = {
  'libs/ts-type-forge':
    '`libReplacement: false` with its own `lib`, `exclude` and a long measured note: see the comments in the file.',
} as const;
