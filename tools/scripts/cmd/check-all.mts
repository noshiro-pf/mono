import { Result } from 'ts-data-forge';
import { $ } from 'ts-repo-utils';

/**
 * Runs all validation and build steps for the project.
 */
const checkAll = async (): Promise<void> => {
  console.info('Starting full project validation and build...\n');

  await logStep({
    startMessage: 'Installing dependencies',
    action: () => runCmdStep('pnpm i', 'Failed to install dependencies'),
    successMessage: 'Dependencies installed',
  });

  await logStep({
    startMessage: 'Running spell check',
    action: () => runCmdStep('pnpm run check:cspell', 'Spell check failed'),
    successMessage: 'Spell check passed',
  });

  await logStep({
    startMessage: 'Running Markdown check',
    action: () => runCmdStep('pnpm run check:md', 'Markdown check failed'),
    successMessage: 'Markdown check passed',
  });

  // The checks whose inputs are documents rather than code. They are not part
  // of `check:root` on purpose — `check:root` runs under the `code` diff gate,
  // whose ignore list drops the very paths these three read. Here they need no
  // `dist/`, so they come before the build.
  await logStep({
    startMessage: 'Checking the documents',
    action: () => runCmdStep('pnpm run check:prose', 'Document checks failed'),
    successMessage: 'Documents validated',
  });

  await logStep({
    startMessage: 'Checking file extensions',
    action: () =>
      runCmdStep('pnpm run ws:check:ext', 'Checking file extensions failed'),
    successMessage: 'File extensions validated',
  });

  await logStep({
    startMessage: 'Building project',
    action: () => runCmdStep('pnpm run ws:build', 'Build failed'),
    successMessage: 'Build succeeded',
  });

  // `build` emits and nothing else, so the committed sources it used to
  // regenerate on every run are regenerated here instead, once. CI does the
  // same and then asserts the tree is clean — see "Build" in CLAUDE.md. It
  // needs `dist/`: the re-export generators import their sibling
  // by name, and `gen:rule-types` lints what it wrote.
  await logStep({
    startMessage: 'Regenerating the generated sources',
    action: () => runCmdStep('pnpm run ws:gen', 'Source generation failed'),
    successMessage: 'Generated sources regenerated',
  });

  // What the build emitted, reached by package name through the `exports`
  // map — the way a consumer reaches it — plus the API consistency checks
  // that need a built sibling to read.
  await logStep({
    startMessage: 'Checking the build output',
    action: () =>
      runCmdStep('pnpm run ws:check:dist', 'Build output checks failed'),
    successMessage: 'Build output validated',
  });

  // A package's `build` only type-checks what it publishes; everything else
  // (tests, scripts, configs, lint config) imports siblings that are built
  // later, so it is checked here, once every `dist/` exists.
  await logStep({
    startMessage: 'Running type checking',
    action: () => runCmdStep('pnpm run ws:check:types', 'Type checking failed'),
    successMessage: 'Type checking passed',
  });

  // The Sumi lint check of the dogfood packages (`check:sumi` scripts): the
  // locked compilerOptions, the native type check and the oxlint preset, in
  // one command per package (languages/sumi/docs/decisions.md, D-46).
  await logStep({
    startMessage: 'Running the Sumi check',
    action: () => runCmdStep('pnpm run ws:check:sumi', 'Sumi check failed'),
    successMessage: 'Sumi check passed',
  });

  // The root lints itself with the workspace copies of eslint-config-typed and
  // the eslint-plugin-ts-* packages, which resolve to their `dist/`.
  await logStep({
    startMessage: 'Checking scripts and configs',
    action: () =>
      runCmdStep('pnpm run check:root', 'Checking scripts and configs failed'),
    successMessage: 'Scripts and configs validated',
  });

  // `strict-lib/` is a directory rather than a workspace member, so the `ws:*`
  // commands never reach its generator and scripts. It carries its own ESLint
  // config and tooling tsconfig; these run them.
  await logStep({
    startMessage: 'Checking the strict standard library tooling',
    action: () =>
      runCmdStep(
        'pnpm run strict-lib:check:types',
        'Type checking strict-lib failed',
      ),
    successMessage: 'strict-lib types validated',
  });

  await logStep({
    startMessage: 'Linting the strict standard library tooling',
    action: () =>
      runCmdStep('pnpm run strict-lib:check:lint', 'Linting strict-lib failed'),
    successMessage: 'strict-lib lint passed',
  });

  // Both need `dist/`: knip executes each package's vitest config, which
  // imports siblings through their `exports` map.
  await logStep({
    startMessage: 'Checking for unused dependencies',
    action: () =>
      runCmdStep('pnpm run check:knip', 'knip found unused declarations'),
    successMessage: 'No unused declarations',
  });

  await logStep({
    startMessage: 'Checking what the packages publish',
    action: () =>
      runCmdStep(
        'pnpm run check:published-deps',
        'A published module imports something consumers do not get',
      ),
    successMessage: 'Published imports validated',
  });

  await logStep({
    startMessage: 'Regenerating the package documentation',
    action: () => runCmdStep('pnpm run ws:doc', 'Document generation failed'),
    successMessage: 'Documentation regenerated',
  });

  await logStep({
    startMessage: 'Regenerating the dependency graph',
    action: () =>
      runCmdStep(
        'pnpm run gen:deps-graph',
        'Dependency graph generation failed',
      ),
    successMessage: 'Dependency graph regenerated',
  });

  await logStep({
    startMessage: 'Running tests',
    action: () => runCmdStep('pnpm run ws:check:test:cov', 'Tests failed'),
    successMessage: 'Tests passed',
  });

  // Packs every package and installs it into `verify-npm-packages/local`, so
  // it needs the build above. Slow, and the last thing CI would tell you.
  await logStep({
    startMessage: 'Installing and running the packed packages',
    action: () =>
      runCmdStep(
        'pnpm run verify:npm-packages',
        'A packed package does not install or run',
      ),
    successMessage: 'Packed packages install and run',
  });

  await logStep({
    startMessage: 'Running lint fixes',
    action: () => runCmdStep('pnpm run ws:fix:lint', 'Linting failed'),
    successMessage: 'Lint fixes applied',
  });

  await logStep({
    startMessage: 'Running codemod',
    action: () => runCmdStep('pnpm run fix:codemod:full', 'Codemod failed'),
    successMessage: 'Codemod applied',
  });

  await logStep({
    startMessage: 'Formatting code',
    action: () => runCmdStep('pnpm run fix:fmt:diff', 'File formatting failed'),
    successMessage: 'Code formatted',
  });

  // The other half of the formatting pass. `strict-lib/` is in
  // `.prettierignore` — oxfmt owns it — so the step above does not reach a
  // single file under it, and `style-check (strict-lib:fix:fmt)` was the only
  // thing that noticed. Six seconds over 5,914 files, and a no-op on a tree
  // that is already formatted.
  await logStep({
    startMessage: 'Formatting the strict standard library',
    action: () =>
      runCmdStep('pnpm run strict-lib:fix:fmt', 'Formatting strict-lib failed'),
    successMessage: 'strict-lib formatted',
  });

  // What CI runs and this deliberately does not:
  //
  // - `ws:check:test:browser` and `ws:check:e2e` need Playwright's browsers,
  //   which `pnpm install` does not fetch — `code-check.yml` runs
  //   `playwright install chromium` before them. Run them directly, or let CI.
  // - `verify:npm-packages:published` installs the versions pinned in
  //   `verify-npm-packages/published/`, so it says nothing about the working
  //   tree; CI runs it only when those pins change.
  // - `strict-lib:gen:with-codemod-fixed` and `strict-lib:gen:version-diff`,
  //   which are the whole of `strict-lib-gen.yml`, rewrite ~7,800 files.
  //   Whether that belongs in a local command is issue #1965.
  //
  // Two narrower-than-CI steps above are worth knowing about as well.
  // `fix:fmt:diff` formats what differs from `origin/main`, where CI runs
  // `fix:fmt:full`, so a file outside the diff that Prettier would rewrite
  // passes here. And
  // nothing here asserts the tree is clean afterwards — the fixers above
  // write, and CI's `z:assert-repo-is-clean` is what turns an uncommitted
  // rewrite into a failure. Read `git status` before pushing; #1965 again.
  console.info('✅ All checks completed successfully!\n');
};

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

await checkAll();
