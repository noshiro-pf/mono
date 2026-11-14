import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { projectRootPath } from '../project-root-path.mjs';
import {
  COMMAND_FAILED_ANNOTATION,
  commandFailedAnnotation,
  commandFailureOf,
  diffInvocations,
  diffOutcome,
  dirtyStartFailures,
  filesNotShown,
  jobFailures,
  jobSteps,
  notShownHeading,
  pathsOf,
  writesToShow,
} from './ci-job.mjs';

describe('commandFailureOf', () => {
  test('says the step that exited non-zero', () => {
    assert.strictEqual(
      commandFailureOf(
        [
          { title: 'ws:build:deps', exitCode: 0, wrote: ['a'] },
          { title: 'check:cspell', exitCode: 1, wrote: [] },
        ],
        false,
      ),
      'check:cspell exited with 1.',
    );
  });

  test('a step that only left a diff is not a failed command', () => {
    assert.isUndefined(
      commandFailureOf(
        [{ title: 'fix:fmt:full', exitCode: 0, wrote: ['a'] }],
        false,
      ),
    );
  });

  test('a failed build, and a tree the setup changed, are more than a diff', () => {
    assert.strictEqual(
      commandFailureOf(
        [{ title: 'ws:build:deps', exitCode: 2, wrote: [] }],
        false,
      ),
      'ws:build:deps exited with 2.',
    );

    assert.include(
      commandFailureOf(
        [{ title: 'fix:fmt:full', exitCode: 0, wrote: [] }],
        true,
      ),
      'before the first step',
    );
  });
});

describe('commandFailedAnnotation', () => {
  test('is one workflow command, a notice, titled what unblock-prs declines by', () => {
    assert.strictEqual(
      commandFailedAnnotation('check:cspell exited with 1.'),
      '::notice title=command failed::check:cspell exited with 1.',
    );

    assert.strictEqual(
      commandFailedAnnotation('100% of it\r\n'),
      '::notice title=command failed::100%25 of it%0D%0A',
    );
  });

  test('.github/unblock-prs.json names the same title', async () => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed file under the repository root.
    const config = await fs.readFile(
      path.join(projectRootPath, '.github/unblock-prs.json'),
      'utf8',
    );

    assert.include(
      config,
      `"notFixableAnnotation": "${COMMAND_FAILED_ANNOTATION}"`,
    );
  });
});

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
        cleanStart: false,
      }),
      { shown: ['libs/a/src/index.mts'], alreadyChanged: ['docs/a.md'] },
    );
  });

  test('on a tree that started clean, every write is diffed', () => {
    assert.deepStrictEqual(
      writesToShow({
        written: ['docs/a.md'],
        changedAtStart: new Map<string, string>(),
        cleanStart: false,
      }),
      { shown: ['docs/a.md'], alreadyChanged: [] },
    );
  });

  // In CI the checkout starts clean, so a file changed before the first step
  // was changed by the setup, and its diff from the index is the setup's and
  // the step's writes, nothing else.
  test('on a checkout required to start clean, a file the setup changed is diffed too', () => {
    assert.deepStrictEqual(
      writesToShow({
        written: ['docs/a.md', 'libs/a/src/index.mts'],
        changedAtStart: new Map<string, string>([['docs/a.md', 'abc']]),
        cleanStart: true,
      }),
      { shown: ['docs/a.md', 'libs/a/src/index.mts'], alreadyChanged: [] },
    );
  });
});

describe('diffInvocations', () => {
  const base = [
    '--no-pager',
    '--literal-pathspecs',
    'diff',
    '--exit-code',
    '--no-ext-diff',
    '--no-color',
  ] as const;

  // `git diff` alone lists nothing for a file the index does not have.
  test('a new file is diffed from nothing, a tracked one from the index', () => {
    assert.deepStrictEqual(
      diffInvocations({
        files: ['docs/a.md', 'docs/new.md'],
        untracked: new Set<string>(['docs/new.md']),
        isFile: () => true,
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
      diffInvocations({
        files,
        untracked: new Set<string>(),
        isFile: () => true,
      }).invocations.map((args) => args.length - base.length - 1),
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
      isFile: () => true,
    });

    assert.lengthOf(invocations, 20);

    assert.deepStrictEqual(newFilesNotShown, ['new/f20', 'new/f21']);
  });

  // `git diff --no-index` exits 1 on a path it cannot read, as on a difference,
  // so the path would be neither shown nor named.
  test('a new path that is not a regular file is named, not diffed', () => {
    assert.deepStrictEqual(
      diffInvocations({
        files: ['docs/new.md', 'sub/'],
        untracked: new Set<string>(['docs/new.md', 'sub/']),
        isFile: (file) => file !== 'sub/',
      }),
      {
        invocations: [
          [...base, '--no-index', '--', '/dev/null', 'docs/new.md'],
        ],
        newFilesNotShown: ['sub/'],
      },
    );
  });

  test('a path that is not a regular file takes none of the 20 places', () => {
    const files = Array.from({ length: 21 }, (_, i) => `new/f${i}`);

    const { invocations, newFilesNotShown } = diffInvocations({
      files: Arr.toUnshifted('sub/')(files),
      untracked: new Set<string>(Arr.toUnshifted('sub/')(files)),
      isFile: (file) => file !== 'sub/',
    });

    assert.lengthOf(invocations, 20);

    assert.deepStrictEqual(newFilesNotShown, ['sub/', 'new/f20']);
  });
});

describe('filesNotShown', () => {
  const invocations = [
    ['diff', '--', 'a', 'b'],
    ['diff', '--', 'c'],
    ['diff', '--no-index', '--', '/dev/null', 'new'],
  ] as const;

  // One failed git hides no later diff: the others ran, and only its files are
  // named.
  test('names the files of each failed invocation alone, wherever it stands', () => {
    assert.deepStrictEqual(
      filesNotShown({
        invocations,
        outcomes: ['failed', 'shown', 'failed'],
        newFilesNotShown: ['more'],
      }),
      ['a', 'b', 'new', 'more'],
    );
  });

  test('with none failed, only the new files not diffed', () => {
    assert.deepStrictEqual(
      filesNotShown({
        invocations,
        outcomes: ['shown', 'empty', 'shown'],
        newFilesNotShown: ['more'],
      }),
      ['more'],
    );
  });
});

describe('notShownHeading', () => {
  test('says "more" only below a diff that was shown', () => {
    assert.strictEqual(
      notShownHeading(2, true),
      'And 2 more files whose diff is not shown:',
    );

    // After a failed `git ls-files`, nothing was shown above it.
    assert.strictEqual(
      notShownHeading(2, false),
      '2 files whose diff is not shown:',
    );
  });
});

describe('diffOutcome', () => {
  // `--exit-code` is what tells a diff printed from none.
  test('exit 1 printed a diff, exit 0 nothing, anything else failed', () => {
    assert.strictEqual(diffOutcome({ status: 1, error: undefined }), 'shown');

    assert.strictEqual(diffOutcome({ status: 0, error: undefined }), 'empty');

    assert.strictEqual(
      diffOutcome({ status: 128, error: undefined }),
      'failed',
    );

    assert.strictEqual(
      diffOutcome({ status: null, error: new Error('spawn git ENOENT') }),
      'failed',
    );
  });
});

describe('pathsOf', () => {
  test('the paths after the `--`, not the `/dev/null` a new file is diffed from', () => {
    assert.deepStrictEqual(
      pathsOf(['diff', '--no-index', '--', '/dev/null', 'docs/new.md']),
      ['docs/new.md'],
    );

    assert.deepStrictEqual(pathsOf(['diff', '--', 'a', 'b']), ['a', 'b']);
  });
});
