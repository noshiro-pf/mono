import { Result } from 'ts-data-forge';
import { $, isDirectlyExecuted } from 'ts-repo-utils';

/**
 * Runs all validation and build steps for the project: `pnpm i`, then each of
 * {@link CHECK_ALL_STEPS} in order.
 */
const checkAll = async (): Promise<void> => {
  console.info('Starting full project validation and build...\n');

  await logStep({
    startMessage: 'Installing dependencies',
    action: () => runCmdStep('pnpm i', 'Failed to install dependencies'),
    successMessage: 'Dependencies installed',
  });

  for (const { script, start, failure, success } of CHECK_ALL_STEPS) {
    await logStep({
      startMessage: start,
      action: () => runCmdStep(`pnpm run ${script}`, failure),
      successMessage: success,
    });
  }

  console.info('✅ All checks completed successfully!\n');
};

/**
 * The root scripts `check-all` runs after `pnpm i`, in order.
 *
 * `check:root:ci-commands` holds this list to the check workflows: every
 * command one of them runs has to be reached by a step here, or be named in
 * {@link LEFT_TO_CI}.
 */
export const CHECK_ALL_STEPS: readonly CheckAllStep[] = [
  {
    script: 'check:cspell',
    start: 'Running spell check',
    failure: 'Spell check failed',
    success: 'Spell check passed',
  },
  {
    script: 'check:md',
    start: 'Running Markdown check',
    failure: 'Markdown check failed',
    success: 'Markdown check passed',
  },
  {
    // The checks whose inputs are documents rather than code. They are not part
    // of `check:root` on purpose — `check:root` runs under the `code` diff gate,
    // whose ignore list drops the very paths these three read. Here they need no
    // `dist/`, so they come before the build.
    script: 'check:prose',
    start: 'Checking the documents',
    failure: 'Document checks failed',
    success: 'Documents validated',
  },
  {
    script: 'ws:check:ext',
    start: 'Checking file extensions',
    failure: 'Checking file extensions failed',
    success: 'File extensions validated',
  },
  {
    // Writes each published package's `LICENSE` from the license its manifest
    // declares, as `style-check.yml` does before it asserts a clean tree, so a
    // reformatted or hand-edited copy shows up in `git status`. It needs no
    // `dist/` and no network (`--verify-upstream` is left to a person), so it
    // comes before the build, where a package missing its `license` field fails
    // at once.
    script: 'gen:license-files',
    start: 'Regenerating the LICENSE files',
    failure: 'LICENSE file generation failed',
    success: 'LICENSE files regenerated',
  },
  {
    script: 'ws:build',
    start: 'Building project',
    failure: 'Build failed',
    success: 'Build succeeded',
  },
  {
    // `build` emits and nothing else, so the committed sources it used to
    // regenerate on every run are regenerated here instead, once. CI does the
    // same and then asserts the tree is clean — see "Build" in CLAUDE.md. It
    // needs `dist/`: the re-export generators import their sibling by name, and
    // `gen:rule-types` lints what it wrote.
    script: 'ws:gen',
    start: 'Regenerating the generated sources',
    failure: 'Source generation failed',
    success: 'Generated sources regenerated',
  },
  {
    // What the build emitted, reached by package name through the `exports` map —
    // the way a consumer reaches it — plus the API consistency checks that need a
    // built sibling to read.
    script: 'ws:check:dist',
    start: 'Checking the build output',
    failure: 'Build output checks failed',
    success: 'Build output validated',
  },
  {
    // A package's `build` only type-checks what it publishes; everything else
    // (tests, scripts, configs, lint config) imports siblings that are built
    // later, so it is checked here, once every `dist/` exists.
    script: 'ws:check:types',
    start: 'Running type checking',
    failure: 'Type checking failed',
    success: 'Type checking passed',
  },
  {
    // The Sumi lint check of the dogfood packages (`check:sumi` scripts): the
    // locked compilerOptions, the native type check and the oxlint preset, in one
    // command per package (languages/sumi/docs/decisions.md, D-46).
    script: 'ws:check:sumi',
    start: 'Running the Sumi check',
    failure: 'Sumi check failed',
    success: 'Sumi check passed',
  },
  {
    // The root lints itself with the workspace copies of eslint-config-typed and
    // the eslint-plugin-ts-* packages, which resolve to their `dist/`.
    script: 'check:root',
    start: 'Checking scripts and configs',
    failure: 'Checking scripts and configs failed',
    success: 'Scripts and configs validated',
  },
  {
    // `strict-lib/` is a directory rather than a workspace member, so the `ws:*`
    // commands never reach its generator and scripts. It carries its own ESLint
    // config and tooling tsconfig; these run them.
    script: 'strict-lib:check:types',
    start: 'Checking the strict standard library tooling',
    failure: 'Type checking strict-lib failed',
    success: 'strict-lib types validated',
  },
  {
    script: 'strict-lib:check:lint',
    start: 'Linting the strict standard library tooling',
    failure: 'Linting strict-lib failed',
    success: 'strict-lib lint passed',
  },
  {
    // Both need `dist/`: knip executes each package's vitest config, which
    // imports siblings through their `exports` map.
    script: 'check:knip',
    start: 'Checking for unused dependencies',
    failure: 'knip found unused declarations',
    success: 'No unused declarations',
  },
  {
    script: 'check:published-deps',
    start: 'Checking what the packages publish',
    failure: 'A published module imports something consumers do not get',
    success: 'Published imports validated',
  },
  {
    script: 'ws:doc',
    start: 'Regenerating the package documentation',
    failure: 'Document generation failed',
    success: 'Documentation regenerated',
  },
  {
    script: 'gen:deps-graph',
    start: 'Regenerating the dependency graph',
    failure: 'Dependency graph generation failed',
    success: 'Dependency graph regenerated',
  },
  {
    script: 'ws:check:test:cov',
    start: 'Running tests',
    failure: 'Tests failed',
    success: 'Tests passed',
  },
  {
    // Packs every package and installs it into `verify-npm-packages/local`, so it
    // needs the build above. Slow, and the last thing CI would tell you.
    script: 'verify:npm-packages',
    start: 'Installing and running the packed packages',
    failure: 'A packed package does not install or run',
    success: 'Packed packages install and run',
  },
  {
    script: 'ws:fix:lint',
    start: 'Running lint fixes',
    failure: 'Linting failed',
    success: 'Lint fixes applied',
  },
  {
    script: 'fix:codemod:full',
    start: 'Running codemod',
    failure: 'Codemod failed',
    success: 'Codemod applied',
  },
  {
    script: 'fix:fmt:diff',
    start: 'Formatting code',
    failure: 'File formatting failed',
    success: 'Code formatted',
  },
  {
    // The other half of the formatting pass. `strict-lib/` is in
    // `.prettierignore` — oxfmt owns it — so the step above does not reach a
    // single file under it, and style-check's `strict-lib:fix:fmt` was the only
    // thing that noticed. Six seconds over 5,914 files, and a no-op on a tree
    // that is already formatted.
    script: 'strict-lib:fix:fmt',
    start: 'Formatting the strict standard library',
    failure: 'Formatting strict-lib failed',
    success: 'strict-lib formatted',
  },
] as const;

/**
 * What CI runs and this deliberately does not, each with the reason.
 * `check:root:ci-commands` fails on a command a check workflow runs that no
 * step in {@link CHECK_ALL_STEPS} reaches and this does not name, and on a name
 * here that no check workflow runs or a step runs after all.
 */
export const LEFT_TO_CI: readonly string[] = [
  // These need Playwright's browsers, which `pnpm install` does not fetch —
  // `code-check.yml` runs `playwright install --only-shell chromium` before
  // them — and `ws:check:e2e:emulators` needs Java 21 for the Firebase
  // emulators as well. Run them directly, or let CI.
  'ws:check:test:browser',
  'ws:check:e2e',
  'ws:check:e2e:emulators',
  // Needs Java 21 for the Firestore emulator, which `code-check.yml` sets up
  // before it. Run it directly, or let CI.
  'ws:check:test:rules',
  // Installs the versions pinned in `verify-npm-packages/published/`, so it
  // says nothing about the working tree; CI runs it only when those pins
  // change.
  'verify:npm-packages:published',
  // The whole of `strict-lib-gen.yml`, which rewrites ~7,800 files. Whether
  // that belongs in a local command is issue #1965.
  'strict-lib:gen:with-codemod-fixed',
  'strict-lib:gen:version-diff',
  // Narrower here: the `fix:fmt:diff` step formats what differs from
  // `origin/main`, so a file outside the diff that Prettier would rewrite
  // passes here and fails CI.
  'fix:fmt:full',
  // Not run as such: the `ws:build` step builds every package, these among
  // them. A declared coverage edge would say the same, and would make
  // `style-check.yml`, which runs both in different jobs, redundant on paper.
  'ws:build:deps',
  // Nothing here asserts the tree is clean afterwards — the fixers write, and
  // this is what turns an uncommitted rewrite into a failure in CI. Read the
  // working tree's status before pushing; #1965 again.
  'z:assert-repo-is-clean',
] as const;

type CheckAllStep = Readonly<{
  /** A root script, run as `pnpm run <script>`. */
  script: string;
  start: string;
  failure: string;
  success: string;
}>;

const mut_step = { current: 1 };

const logStep = async ({
  startMessage,
  successMessage,
  action,
}: Readonly<{
  startMessage: string;
  action: () => Promise<void>;
  successMessage: string;
}>): Promise<void> => {
  console.info(`${mut_step.current}. ${startMessage}...`);

  await action();

  console.info(`✓ ${successMessage}.\n`);

  mut_step.current += 1;
};

const runCmdStep = async (cmd: string, errorMsg: string): Promise<void> => {
  const result = await $(cmd);

  if (!Result.isErr(result)) {
    return;
  }

  console.info(`${errorMsg}: ${result.value.message}`);

  console.info('❌ Check failed');

  process.exit(1);
};

if (isDirectlyExecuted(import.meta.url)) {
  await checkAll();
}
