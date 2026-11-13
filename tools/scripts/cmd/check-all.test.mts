import { Arr } from 'ts-data-forge';
import { projectRootPath } from '../project-root-path.mjs';
import {
  describeSkipped,
  NO_BUILDS,
  notRunMessage,
  planBuild,
  rememberBuild,
  selectEntries,
  summarizeRun,
  type BuildMemory,
} from './check-all.mjs';
import { ignoredBy, readGateList } from './workflow-steps.mjs';

const entries = [
  { command: 'ws:fix:lint:apps', build: 'ws:build:deps' },
  { command: 'ws:check:test:browser', build: 'ws:build:deps', browser: 'true' },
  {
    command: 'z:ci:bundle',
    build: 'ws:build:deps',
    browser: 'true',
    java: 'true',
  },
] as const;

const scripts = {
  'z:ci:bundle':
    'run-s --continue-on-error ws:check:types:non-strict-lib ws:check:test:rules',
} as const;

const needs = { 'ws:check:test:rules': 'Java' } as const;

describe('selectEntries', () => {
  test('an entry that needs a browser or Java is skipped, and says why', () => {
    const selected = selectEntries(entries, { all: false, scripts, needs });

    assert.deepStrictEqual(selected.skipped.map(describeSkipped), [
      'ws:check:test:browser (needs Chromium; run with --all)',
      'ws:check:test:rules, part of z:ci:bundle (needs Java; run with --all)',
    ]);
  });

  test('of a skipped bundle, the parts that need neither still run', () => {
    const selected = selectEntries(entries, { all: false, scripts, needs });

    assert.deepStrictEqual(selected.run, [
      { command: 'ws:fix:lint:apps', build: 'ws:build:deps', entry: 0 },
      {
        command: 'ws:check:types:non-strict-lib',
        build: 'ws:build:deps',
        partOf: 'z:ci:bundle',
        entry: 2,
      },
    ]);
  });

  test('`browser: full` needs the full Chromium build', () => {
    const selected = selectEntries(
      [{ command: 'ws:check:e2e:shard-2', build: 'ws:build', browser: 'full' }],
      { all: false, scripts, needs: {} },
    );

    assert.deepStrictEqual(selected.run, []);

    assert.deepStrictEqual(selected.skipped.map(describeSkipped), [
      'ws:check:e2e:shard-2 (needs the full Chromium build; run with --all)',
    ]);
  });

  test('--all runs every entry whole', () => {
    const selected = selectEntries(entries, { all: true, scripts, needs });

    assert.deepStrictEqual(
      selected.run.map(({ command }) => command),
      ['ws:fix:lint:apps', 'ws:check:test:browser', 'z:ci:bundle'],
    );

    assert.deepStrictEqual(selected.skipped, []);
  });

  test('a part the table names that no skipped bundle has is an error', () => {
    assert.throws(
      () =>
        selectEntries(entries, {
          all: false,
          scripts,
          needs: { ...needs, 'ws:check:gone': 'Java' },
        }),
      /ws:check:gone/u,
    );
  });
});

const summary = (
  selected: ReturnType<typeof selectEntries>,
  notRun: readonly ReturnType<typeof selectEntries>['run'][number][] = [],
): string =>
  summarizeRun({
    entries: Arr.toPushed(entries, {
      name: 'a matrix entry naming no command',
    }),
    ran: selected.run.filter((run) => !notRun.includes(run)),
    notRun,
    skipped: selected.skipped,
  });

describe('summarizeRun', () => {
  test('a bundle opened into its parts counts as one entry, not as its parts', () => {
    assert.strictEqual(
      summary(selectEntries(entries, { all: false, scripts, needs })),
      'Ran 1 of the 3 matrix entries whole, and 1 part of 1 other; skipped 1 whole.',
    );
  });

  test('every entry run whole says so alone', () => {
    assert.strictEqual(
      summary(selectEntries(entries, { all: true, scripts, needs })),
      'Ran 3 of the 3 matrix entries whole.',
    );
  });

  test('a bundle whose every part was skipped counts as skipped', () => {
    assert.strictEqual(
      summary(
        selectEntries(entries, {
          all: false,
          scripts,
          needs: { ...needs, 'ws:check:types:non-strict-lib': 'Chromium' },
        }),
      ),
      'Ran 1 of the 3 matrix entries whole; skipped 2 whole.',
    );
  });

  test('the parts of a bundle whose build failed count as one entry not run', () => {
    const selected = selectEntries(entries, {
      all: false,
      scripts: {
        'z:ci:bundle':
          'run-s ws:check:types:non-strict-lib ws:check:md ws:check:test:rules',
      },
      needs,
    });

    assert.strictEqual(
      summary(selected, selected.run),
      'Ran 0 of the 3 matrix entries whole; 2 not run after their build failed; skipped 1 whole.',
    );
  });

  // Two matrix workflows can list one command.
  test('entries run whole under one command count once each', () => {
    const twice = [
      { command: 'check:root', build: 'ws:build:deps' },
      { command: 'check:root', build: 'ws:build:deps' },
    ] as const;

    const { run } = selectEntries(twice, { all: true, scripts, needs: {} });

    assert.strictEqual(
      summarizeRun({ entries: twice, ran: run, notRun: [], skipped: [] }),
      'Ran 2 of the 2 matrix entries whole.',
    );

    assert.strictEqual(
      summarizeRun({ entries: twice, ran: [], notRun: run, skipped: [] }),
      'Ran 0 of the 2 matrix entries whole; 2 not run after their build failed.',
    );
  });

  test('a bundle listed twice and opened up counts as two entries', () => {
    const twice = [entries[2], entries[2]] as const;

    const selected = selectEntries(twice, { all: false, scripts, needs });

    assert.strictEqual(
      summarizeRun({
        entries: twice,
        ran: selected.run,
        notRun: [],
        skipped: selected.skipped,
      }),
      'Ran 0 of the 2 matrix entries whole, and 2 parts of 2 others.',
    );
  });

  // A part that wrote a source clears the builds, and the next part's rebuild
  // can fail.
  test('a bundle one part of which ran and another not counts as run', () => {
    const selected = selectEntries(entries, {
      all: false,
      scripts: {
        'z:ci:bundle':
          'run-s ws:check:types:non-strict-lib ws:check:md ws:check:test:rules',
      },
      needs,
    });

    const [whole, part, notRunPart] = selected.run;

    assert.isDefined(whole);

    assert.isDefined(part);

    assert.isDefined(notRunPart);

    assert.strictEqual(
      summarizeRun({
        entries,
        ran: [whole, part],
        notRun: [notRunPart],
        skipped: selected.skipped,
      }),
      'Ran 1 of the 3 matrix entries whole, and 1 part of 1 other; skipped 1 whole.',
    );
  });

  test('an entry run whole is not taken for a bundle of its name', () => {
    assert.strictEqual(
      summarizeRun({
        entries: [{ command: 'z:ci:bundle' }, { command: 'z:ci:bundle' }],
        ran: [
          { command: 'z:ci:bundle', build: undefined, entry: 0 },
          {
            command: 'check:a',
            build: undefined,
            partOf: 'z:ci:bundle',
            entry: 1,
          },
          {
            command: 'check:b',
            build: undefined,
            partOf: 'z:ci:bundle',
            entry: 1,
          },
        ],
        notRun: [],
        skipped: [
          {
            command: 'check:c',
            partOf: 'z:ci:bundle',
            needs: 'Java',
            entry: 1,
          },
        ],
      }),
      'Ran 1 of the 2 matrix entries whole, and 2 parts of 1 other.',
    );
  });

  test('an entry not run for a failed build is not counted as run', () => {
    const selected = selectEntries(entries, { all: true, scripts, needs });

    const [, ...notRun] = selected.run;

    assert.strictEqual(
      summary(selected, notRun),
      'Ran 1 of the 3 matrix entries whole; 2 not run after their build failed.',
    );
  });
});

/** As `check-all` reads it: every path the code gate does not ignore. */
const readByBuilds = (file: string): boolean => !isUnreadByBuilds(file);

const codeGate = readGateList('code', projectRootPath);

const isUnreadByBuilds = ignoredBy(codeGate.ok ? codeGate.value : []);

const after = (
  steps: readonly Readonly<{
    build: string | undefined;
    failed?: boolean;
    wrote?: readonly string[];
  }>[],
): BuildMemory =>
  steps.reduce(
    (memory, { build, failed = false, wrote = [] }) =>
      rememberBuild(memory, { build, failed, wrote, readByBuilds }),
    NO_BUILDS,
  );

describe('planBuild and rememberBuild', () => {
  test('a build is run once, and `ws:build` stands for `ws:build:deps`', () => {
    assert.deepStrictEqual(planBuild(NO_BUILDS, 'ws:build:deps'), {
      kind: 'run',
      build: 'ws:build:deps',
    });

    assert.deepStrictEqual(
      planBuild(after([{ build: 'ws:build:deps' }]), 'ws:build:deps'),
      { kind: 'none' },
    );

    assert.deepStrictEqual(
      planBuild(after([{ build: 'ws:build' }]), 'ws:build:deps'),
      { kind: 'none' },
    );

    assert.deepStrictEqual(planBuild(NO_BUILDS, undefined), { kind: 'none' });
  });

  test('a build that failed is not run again, and its entries are reported', () => {
    assert.deepStrictEqual(
      planBuild(
        after([{ build: 'ws:build:deps', failed: true }]),
        'ws:build:deps',
      ),
      { kind: 'failed', build: 'ws:build:deps', failed: 'ws:build:deps' },
    );
  });

  // `ws:build` builds every package `ws:build:deps` does.
  test('a failed `ws:build:deps` is a failed `ws:build`, not the other way round', () => {
    assert.deepStrictEqual(
      planBuild(after([{ build: 'ws:build:deps', failed: true }]), 'ws:build'),
      { kind: 'failed', build: 'ws:build', failed: 'ws:build:deps' },
    );

    assert.deepStrictEqual(
      planBuild(after([{ build: 'ws:build', failed: true }]), 'ws:build:deps'),
      { kind: 'run', build: 'ws:build:deps' },
    );
  });

  // A package's build empties its `dist/` before it writes.
  test('a build that failed leaves no other built', () => {
    assert.deepStrictEqual(
      planBuild(
        after([
          { build: 'ws:build:deps' },
          { build: 'ws:build', failed: true },
        ]),
        'ws:build:deps',
      ),
      { kind: 'run', build: 'ws:build:deps' },
    );
  });

  test('a build named like an Object property is no covering build', () => {
    assert.deepStrictEqual(planBuild(NO_BUILDS, 'constructor'), {
      kind: 'run',
      build: 'constructor',
    });
  });

  test('an entry that changed the tree makes every build run afresh', () => {
    const memory = after([
      { build: 'ws:build' },
      { build: 'ws:build:deps', failed: true },
      { build: undefined, wrote: ['libs/a/src/index.mts'] },
    ]);

    assert.deepStrictEqual(planBuild(memory, 'ws:build'), {
      kind: 'run',
      build: 'ws:build',
    });

    assert.deepStrictEqual(planBuild(memory, 'ws:build:deps'), {
      kind: 'run',
      build: 'ws:build:deps',
    });
  });

  test('the code gate list is read', () => {
    assert.isTrue(codeGate.ok);
  });

  // No build reads what the code gate ignores, so no `dist/` is older than its
  // sources after such a write.
  test('a write no build reads keeps what was built and what failed', () => {
    assert.deepStrictEqual(
      planBuild(
        after([
          { build: 'ws:build:deps' },
          { build: undefined, wrote: ['docs/a.md'] },
        ]),
        'ws:build:deps',
      ),
      { kind: 'none' },
    );

    const memory = after([
      { build: 'ws:build:deps' },
      { build: 'ws:build', failed: true },
      { build: undefined, wrote: ['docs/a.md', 'libs/a/README.md'] },
    ]);

    assert.deepStrictEqual(planBuild(memory, 'ws:build'), {
      kind: 'failed',
      build: 'ws:build',
      failed: 'ws:build',
    });
  });

  test('a write a build reads, among others, makes every build run afresh', () => {
    const memory = after([
      { build: 'ws:build:deps' },
      { build: undefined, wrote: ['docs/a.md', 'libs/a/src/index.mts'] },
    ]);

    assert.deepStrictEqual(planBuild(memory, 'ws:build:deps'), {
      kind: 'run',
      build: 'ws:build:deps',
    });
  });

  test('a build that ran and whose command wrote what a build reads is not remembered', () => {
    assert.deepStrictEqual(
      planBuild(
        after([{ build: 'ws:build:deps', wrote: ['libs/a/src/index.mts'] }]),
        'ws:build:deps',
      ),
      { kind: 'run', build: 'ws:build:deps' },
    );
  });

  // Its entry ran nothing after it, so the write is the build's own, and
  // running it again would fail the same way.
  test('a build that failed after writing a file is remembered as failed', () => {
    assert.deepStrictEqual(
      planBuild(
        after([
          {
            build: 'ws:build:deps',
            failed: true,
            wrote: ['libs/a/src/index.mts'],
          },
        ]),
        'ws:build:deps',
      ),
      { kind: 'failed', build: 'ws:build:deps', failed: 'ws:build:deps' },
    );
  });
});

describe('notRunMessage', () => {
  test('names the build, and says when it failed for an earlier entry', () => {
    assert.strictEqual(
      notRunMessage({
        command: 'check:root',
        build: 'ws:build:deps',
        where: 'here',
      }),
      'check:root was not run: its build, ws:build:deps, failed.',
    );

    assert.strictEqual(
      notRunMessage({
        command: 'check:root',
        build: 'ws:build:deps',
        where: 'above',
        failed: 'ws:build:deps',
      }),
      'check:root was not run: its build, ws:build:deps, failed above.',
    );
  });

  test('names the covered build that failed when it is not its own', () => {
    assert.strictEqual(
      notRunMessage({
        command: 'ws:check:e2e',
        build: 'ws:build',
        failed: 'ws:build:deps',
        where: 'above',
      }),
      'ws:check:e2e was not run: its build, ws:build, covers ws:build:deps, which failed above.',
    );
  });
});
