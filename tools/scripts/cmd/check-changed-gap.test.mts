import { Arr, Result } from 'ts-data-forge';
import { codeTouched, describeGap } from './check-changed-gap.mjs';
import type { Area, Step } from './check-changed/plan.mjs';
import { buildCoverageGraph, type Manifest } from './check-ci-commands.mjs';

const manifests: readonly Manifest[] = [
  {
    directory: '.',
    scripts: {
      'z:ci:bundle':
        'run-s --continue-on-error ws:fix:lint ws:check:e2e check:root check:cspell',
      'ws:fix:lint': 'pnpm run --recursive --if-present fix:lint',
      'ws:check:e2e': 'pnpm run --recursive --if-present check:e2e',
      'check:root': "pnpm run '/check:root:.*/'",
      'check:root:a': 'tsx a.mts',
      'check:root:b': 'tsx b.mts',
      'check:cspell': 'cspell "**" && pnpm run check:cspell:changeset',
      'check:cspell:changeset': 'tsx cspell-changeset.mts',
    },
  },
  {
    directory: 'apps/touched',
    name: 'touched',
    scripts: {
      'fix:lint': 'eslint . --fix',
      'check:lint': 'eslint .',
      'check:e2e': 'playwright test',
    },
  },
  {
    directory: 'apps/untouched',
    name: 'untouched',
    scripts: { 'fix:lint': 'eslint . --fix', 'check:lint': 'eslint .' },
  },
] as const;

const graph = buildCoverageGraph(manifests);

const step = (cwd: string, script: string): Step =>
  ({ title: script, kind: 'check', cwd, args: ['run', script] }) as const;

const cspellOverTheDiff: Step = {
  title: 'cspell over the changed files',
  kind: 'check',
  cwd: '.',
  args: ['exec', 'cspell', './a.md'],
  narrows: 'check:cspell',
} as const;

const plan = [
  step('apps/touched', 'fix:lint'),
  step('.', 'check:root:a'),
  step('.', 'check:cspell:changeset'),
  cspellOverTheDiff,
] as const;

const gap = (given: readonly Step[] = plan, job = 'z:ci:bundle'): string => {
  const described = describeGap({
    job,
    graph,
    manifests,
    plan: given,
    touched: new Set<string>(['apps/touched']),
  });

  assert.isTrue(Result.isOk(described));

  return described.value;
};

describe('describeGap', () => {
  test('the commands the plan runs are listed as planned', () => {
    assert.match(
      gap(),
      /\*\*Planned\*\* \(3\): `check:cspell:changeset` in the root; `check:root:a` in the root; `fix:lint` in apps\/touched\./u,
    );
  });

  test('a command the plan runs over the diff alone is listed apart', () => {
    assert.match(
      gap(),
      /\*\*Planned over the diff only\*\* \(1\): `check:cspell` in the root/u,
    );
  });

  test('a CI-only command is listed with its reason', () => {
    assert.match(
      gap(),
      /\*\*Left to CI by design\*\* \(1\):\n\n- `check:e2e` in apps\/touched: Needs Playwright/u,
    );
  });

  test('a command in a package the diff does not touch is listed apart', () => {
    assert.match(
      gap(),
      /\*\*In packages whose code this diff does not touch\*\* \(1\): `fix:lint` in apps\/untouched\./u,
    );
  });

  test('what the plan runs for other diffs and not this one is the gap', () => {
    assert.match(
      gap(),
      /\*\*Not planned for this diff\*\* \(1\): `check:root:b` in the root/u,
    );
  });

  // `fix:lint` covers `check:lint` (DECLARED_COVERAGE in check-ci-commands.mts),
  // and `check:cspell` covers `check:cspell:changeset`, which is planned: a
  // command is left out only when another one of its own group covers it.
  test('a command another one of its group covers is not listed again', () => {
    assert.notInclude(gap(), 'check:lint');
  });

  test('the count is of the commands listed', () => {
    assert.include(gap(), 'Of the 7 commands `z:ci:bundle` runs');
  });

  test('what the narrowed script covers counts as narrowed too', () => {
    const fmtManifests: readonly Manifest[] = [
      {
        directory: '.',
        scripts: {
          'fix:fmt:full': 'prettier --write .',
          'fix:fmt:diff': 'pnpm run z:format-diff-from origin/main',
        },
      },
    ] as const;

    const described = describeGap({
      job: 'fix:fmt:full',
      graph: buildCoverageGraph(fmtManifests),
      manifests: fmtManifests,
      plan: [
        {
          title: 'format',
          kind: 'format',
          cwd: '.',
          args: ['run', 'z:format-diff-from', 'abc'],
          narrows: 'fix:fmt:full',
        },
      ],
      touched: new Set<string>(),
    });

    assert.isTrue(Result.isOk(described));

    assert.notInclude(described.value, 'Not planned');
  });

  test('a group with nothing in it is left out', () => {
    assert.notInclude(
      gap(Arr.toPushed(plan, step('.', 'check:root:b'))),
      'Not planned',
    );
  });

  test('a job that is not a root script is an error', () => {
    assert.isTrue(
      Result.isErr(
        describeGap({
          job: 'no-such-script',
          graph,
          manifests,
          plan,
          touched: new Set<string>(),
        }),
      ),
    );
  });

  test('a step of an unknown form is an error', () => {
    assert.isTrue(
      Result.isErr(
        describeGap({
          job: 'z:ci:bundle',
          graph,
          manifests,
          plan: [{ ...step('.', 'x'), args: ['exec', 'eslint'] }],
          touched: new Set<string>(),
        }),
      ),
    );
  });
});

describe('codeTouched', () => {
  test('a package touched by documents alone is not one whose code changed', () => {
    const pkg = (dir: string) =>
      ({
        name: dir,
        dir,
        scripts: new Set<string>(),
        isPrivate: false,
        workspaceDependencies: new Set<string>(),
        buildDependencies: new Set<string>(),
        exportsBuild: false,
      }) as const;

    assert.deepStrictEqual(
      Array.from(
        codeTouched({
          packages: [
            { pkg: pkg('libs/code'), code: true },
            { pkg: pkg('libs/readme'), code: false },
          ],
          dependents: [],
          areas: new Set<Area>(),
          ignored: [],
        }),
      ),
      ['libs/code'],
    );
  });
});
