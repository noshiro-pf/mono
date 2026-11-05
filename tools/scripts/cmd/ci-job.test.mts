import {
  diffInvocations,
  dirtyStartFailures,
  jobFailures,
  jobSteps,
  writesToShow,
} from './ci-job.mjs';

describe('jobSteps', () => {
  test('the build, then the command', () => {
    assert.deepStrictEqual(
      jobSteps({ command: 'check:root', build: 'ws:build:deps' }).map(
        ({ title }) => title,
      ),
      ['ws:build:deps', 'check:root'],
    );
  });

  test('the command alone when there is no build', () => {
    assert.deepStrictEqual(
      jobSteps({ command: 'check:root', build: undefined }).map(
        ({ title }) => title,
      ),
      ['check:root'],
    );
  });
});

describe('jobFailures', () => {
  test('a step that exited non-zero fails the job', () => {
    assert.deepStrictEqual(
      jobFailures([
        { title: 'ws:build:deps', exitCode: 0, wrote: [] },
        { title: 'check:root', exitCode: 1, wrote: [] },
      ]),
      ['check:root exited with 1.'],
    );
  });

  // What `z:assert-repo-is-clean` reported, with the step that wrote it named.
  test('a step that changed the tree fails the job, naming the files', () => {
    assert.deepStrictEqual(
      jobFailures([
        { title: 'ws:build:deps', exitCode: 0, wrote: [] },
        {
          title: 'z:ci:style-check:checks-and-generators',
          exitCode: 0,
          wrote: ['docs/package-dependencies.md', 'libs/a/src/index.mts'],
        },
      ]),
      [
        [
          '`z:ci:style-check:checks-and-generators` changed the tree; run it locally and commit what it writes:',
          '      docs/package-dependencies.md',
          '      libs/a/src/index.mts',
        ].join('\n'),
      ],
    );
  });

  test('a job whose steps passed and wrote nothing passes', () => {
    assert.deepStrictEqual(
      jobFailures([{ title: 'check:root', exitCode: 0, wrote: [] }]),
      [],
    );
  });
});

describe('dirtyStartFailures', () => {
  // What `z:assert-repo-is-clean` at the end of the job also caught.
  test('a tree changed before the first step fails the job', () => {
    assert.deepStrictEqual(dirtyStartFailures(['pnpm-workspace.yaml']), [
      [
        'The tree was changed before the first step ran (by the setup or `pnpm install`):',
        '      pnpm-workspace.yaml',
      ].join('\n'),
    ]);
  });

  test('a clean start is no failure', () => {
    assert.deepStrictEqual(dirtyStartFailures([]), []);
  });
});

describe('writesToShow', () => {
  // A local run, or a later `check-all` entry: the diff from the index of a
  // file already changed would show those edits as the step's.
  test('a file changed before the first step is named, not diffed', () => {
    assert.deepStrictEqual(
      writesToShow({
        written: ['docs/a.md', 'libs/a/src/index.mts'],
        changedAtStart: new Map<string, string>([['docs/a.md', 'abc']]),
      }),
      { shown: ['libs/a/src/index.mts'], alreadyChanged: ['docs/a.md'] },
    );
  });

  test('on a tree that started clean, every write is diffed', () => {
    assert.deepStrictEqual(
      writesToShow({
        written: ['docs/a.md'],
        changedAtStart: new Map<string, string>(),
      }),
      { shown: ['docs/a.md'], alreadyChanged: [] },
    );
  });
});

describe('diffInvocations', () => {
  const base = [
    '--no-pager',
    '--literal-pathspecs',
    'diff',
    '--no-ext-diff',
    '--no-color',
  ] as const;

  // `git diff` alone lists nothing for a file the index does not have.
  test('a new file is diffed from nothing, a tracked one from the index', () => {
    assert.deepStrictEqual(
      diffInvocations({
        files: ['docs/a.md', 'docs/new.md'],
        untracked: new Set<string>(['docs/new.md']),
      }),
      {
        invocations: [
          [...base, '--', 'docs/a.md'],
          [...base, '--no-index', '--', '/dev/null', 'docs/new.md'],
        ],
        newFilesNotShown: [],
      },
    );
  });

  test('tracked files are diffed in batches of 500', () => {
    const files = Array.from({ length: 501 }, (_, i) => `f${i}`);

    assert.deepStrictEqual(
      diffInvocations({ files, untracked: new Set<string>() }).invocations.map(
        (args) => args.length - base.length - 1,
      ),
      [500, 1],
    );
  });

  // A generator that writes a directory of new files would otherwise bury the
  // failure under their content.
  test('new files past the first 20 are named, not shown', () => {
    const files = Array.from({ length: 22 }, (_, i) => `new/f${i}`);

    const { invocations, newFilesNotShown } = diffInvocations({
      files,
      untracked: new Set<string>(files),
    });

    assert.lengthOf(invocations, 20);

    assert.deepStrictEqual(newFilesNotShown, ['new/f20', 'new/f21']);
  });
});
