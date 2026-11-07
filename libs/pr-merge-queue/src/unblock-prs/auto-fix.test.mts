import type { ContextState } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import { ownedPaths, planAutoFix } from './auto-fix.mjs';
import { readConfig } from './config.mjs';

// The repository's own `.github/unblock-prs.json`: these tests are what its
// rules mean for the matrices it has.
const config = await readConfig().then((read) =>
  Result.isOk(read) ? read.value?.autoFix : undefined,
);

const build = 'pnpm run ws:build';

const states = (
  entries: readonly (readonly [string, ContextState])[],
): ReadonlyMap<string, ContextState> => new Map(entries);

describe(planAutoFix, () => {
  test('declines a context whose job said its command failed, naming it', () => {
    const job = 'style-check (z:ci:style-check:checks-and-generators)';

    const plan = planAutoFix(states([[job, 'failed']]), config, [job]);

    assert.isTrue(Result.isErr(plan));

    assert.include(plan.value, job);

    assert.include(plan.value, 'in its command');

    // The same failure leaving only a diff is still fixed.
    assert.isTrue(Result.isOk(planAutoFix(states([[job, 'failed']]), config)));
  });

  test('one of several declined declines them all', () => {
    const job = 'style-check (z:ci:style-check:checks-and-generators)';

    const other = 'code-check (fix:codemod:full)';

    assert.isTrue(
      Result.isErr(
        planAutoFix(
          states([
            [job, 'failed'],
            [other, 'failed'],
          ]),
          config,
          [other],
        ),
      ),
    );
  });

  test('runs the command a failed matrix entry names, with the build CI gave it', () => {
    const plan = planAutoFix(
      states([
        ['code-check (fix:codemod:full)', 'failed'],
        ['code-check (ws:check:types)', 'passed'],
        ['code-check-result / result', 'failed'],
        ['style-check (fix:fmt:full)', 'passed'],
      ]),
      config,
    );

    assert.isTrue(Result.isOk(plan));

    assert.deepStrictEqual(plan.value, {
      before: ['pnpm install --frozen-lockfile'],
      prepare: [build],
      commands: ["pnpm run 'fix:codemod:full'"],
      after: ['pnpm run fix:fmt:diff'],
    });
  });

  test('builds for a style-check entry only where CI does', () => {
    const formatOnly = planAutoFix(
      states([
        ['style-check (fix:fmt:full)', 'failed'],
        ['style-check (strict-lib:fix:fmt)', 'failed'],
        ['style-check-result / result', 'failed'],
      ]),
      config,
    );

    assert.isTrue(Result.isOk(formatOnly));

    assert.deepStrictEqual(formatOnly.value.prepare, []);

    const generated = planAutoFix(
      states([
        ['style-check (z:ci:style-check:checks-and-generators)', 'failed'],
      ]),
      config,
    );

    assert.isTrue(Result.isOk(generated));

    assert.deepStrictEqual(generated.value.prepare, [build]);
  });

  test('reruns the style-check bundle, which fixes its own formatters and generators', () => {
    // `z:ci:style-check:checks-and-generators` holds Prettier, oxfmt, the
    // generators and `ws:gen` beside checks, one of which (markdownlint) fixes
    // what it can. Rerun, it rewrites what those own and exits non-zero only
    // when something it cannot fix failed, which is what declines the fix.
    // `ws:gen` reads its siblings' dist/, so it is built first.
    const plan = planAutoFix(
      states([
        ['style-check (z:ci:style-check:checks-and-generators)', 'failed'],
        ['style-check-result / result', 'failed'],
      ]),
      config,
    );

    assert.isTrue(Result.isOk(plan));

    assert.deepStrictEqual(plan.value, {
      before: ['pnpm install --frozen-lockfile'],
      prepare: [build],
      commands: ["pnpm run 'z:ci:style-check:checks-and-generators'"],
      after: ['pnpm run fix:fmt:diff'],
    });
  });

  test('runs Prettier for the format-and-doc bundle, and builds nothing for it', () => {
    // `z:ci:style-check:format-and-doc` is `fix:fmt:full` then `ws:doc`. Only
    // Prettier writes tracked files there (`doc`'s output is untracked), so
    // Prettier is the fix; a failed `ws:doc` leaves nothing changed, which
    // declines it.
    const plan = planAutoFix(
      states([
        ['style-check (z:ci:style-check:format-and-doc)', 'failed'],
        ['style-check-result / result', 'failed'],
      ]),
      config,
    );

    assert.isTrue(Result.isOk(plan));

    assert.deepStrictEqual(plan.value, {
      before: ['pnpm install --frozen-lockfile'],
      prepare: [],
      commands: ['pnpm run fix:fmt:full'],
      after: ['pnpm run fix:fmt:diff'],
    });
  });

  test('reruns the style-check bundle before any other fixer, on the tree as committed', () => {
    // Its `check:prose` diffs the tree against the base, so a generator's or a
    // lint fix's rewrite would read as lines the change touched.
    const plan = planAutoFix(
      states([
        ['code-check (fix:codemod:full)', 'failed'],
        ['code-check (ws:fix:lint:apps)', 'failed'],
        ['style-check (z:ci:style-check:checks-and-generators)', 'failed'],
      ]),
      config,
    );

    assert.isTrue(Result.isOk(plan));

    assert.deepStrictEqual(plan.value.commands, [
      "pnpm run 'z:ci:style-check:checks-and-generators'",
      "pnpm run 'fix:codemod:full'",
      "pnpm run 'ws:fix:lint:apps'",
    ]);
  });

  test('runs generators first and formatters last', () => {
    const plan = planAutoFix(
      states([
        ['style-check (fix:fmt:full)', 'failed'],
        ['code-check (ws:fix:lint)', 'failed'],
        ['style-check (ws:gen)', 'failed'],
        ['style-check (strict-lib:fix:fmt)', 'failed'],
        ['code-check (fix:codemod:full)', 'failed'],
        ['style-check (gen:license-files)', 'failed'],
      ]),
      config,
    );

    assert.isTrue(Result.isOk(plan));

    assert.deepStrictEqual(plan.value.commands, [
      "pnpm run 'gen:license-files'",
      "pnpm run 'ws:gen'",
      "pnpm run 'fix:codemod:full'",
      "pnpm run 'ws:fix:lint'",
      "pnpm run 'fix:fmt:full'",
      "pnpm run 'strict-lib:fix:fmt'",
    ]);
  });

  test('declines when any failure is not a fixer, naming it', () => {
    const plan = planAutoFix(
      states([
        ['code-check (fix:codemod:full)', 'failed'],
        ['code-check (ws:check:types)', 'failed'],
        ['code-check-result / result', 'failed'],
      ]),
      config,
    );

    assert.isTrue(Result.isErr(plan));

    expect(plan.value).toContain('code-check (ws:check:types)');

    expect(plan.value).not.toContain('fix:codemod:full');
  });

  test.each([
    ['a check command', 'code-check (ws:check:test:cov)'],
    ['`ws:doc`, whose output is untracked', 'style-check (ws:doc)'],
    ['a job of another workflow', 'Validate commit count'],
    ['a matrix entry of another workflow', 'test-node-versions (fix:x)'],
  ] as const)('declines %s', (_, name) => {
    const plan = planAutoFix(states([[name, 'failed']]), config);

    assert.isTrue(Result.isErr(plan));

    expect(plan.value).toContain(name);
  });

  test('declines when nothing but an aggregate failed', () => {
    const plan = planAutoFix(
      states([
        ['code-check (fix:codemod:full)', 'passed'],
        ['code-check-result / result', 'failed'],
      ]),
      config,
    );

    assert.isTrue(Result.isErr(plan));
  });

  test('reads only what failed; pending and skipped entries are not a plan', () => {
    const plan = planAutoFix(
      states([
        ['style-check (fix:fmt:full)', 'failed'],
        ['code-check (ws:check:types)', 'pending'],
        ['code-check (ws:check:e2e)', 'skipped'],
      ]),
      config,
    );

    assert.isTrue(Result.isOk(plan));

    assert.deepStrictEqual(plan.value.commands, ["pnpm run 'fix:fmt:full'"]);
  });

  test('declines everything where the repository configures no auto-fix', () => {
    const plan = planAutoFix(
      states([['style-check (fix:fmt:full)', 'failed']]),
      undefined,
    );

    assert.isTrue(Result.isErr(plan));

    expect(plan.value).toContain('.github/unblock-prs.json');
  });
});

describe(ownedPaths, () => {
  const codeOwners = [
    '# enforced-by: Validate code owners',
    '/.github/workflows/ @owner',
    '/tools/configs/gate-ignore-lists.json @owner',
    '',
  ].join('\n');

  test('names the changed files CODEOWNERS gives owners', () => {
    assert.deepStrictEqual(
      ownedPaths(
        [
          'libs/a/src/x.mts',
          '.github/workflows/release.yml',
          'tools/configs/gate-ignore-lists.json',
        ],
        codeOwners,
      ),
      ['.github/workflows/release.yml', 'tools/configs/gate-ignore-lists.json'],
    );
  });

  test('names none when nothing changed is owned, or there is no file', () => {
    assert.deepStrictEqual(ownedPaths(['libs/a/src/x.mts'], codeOwners), []);

    assert.deepStrictEqual(ownedPaths(['.github/workflows/a.yml'], ''), []);
  });
});
