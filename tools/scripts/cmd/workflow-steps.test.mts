// cspell:ignore ture flase docsx libsx xcspell

import { execFile, execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Arr, isRecord, isString } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  firstFileToCheck,
  ignoredBy,
  installArgs,
  matchesGatePattern,
  parseGateLists,
  parseShouldRunArgs,
  planDiffCheck,
  readBoolean,
  readChoice,
  readGateList,
} from './workflow-steps.mjs';

const scriptPath = fileURLToPath(
  new URL('workflow-steps.mts', import.meta.url),
);

const gateListsFile = fileURLToPath(
  new URL('../../configs/gate-ignore-lists.json', import.meta.url),
);

const projectRoot = fileURLToPath(new URL('../../..', import.meta.url));

describe('readChoice / readBoolean', () => {
  test('reads an input from the environment variable named after it', () => {
    assert.deepStrictEqual(
      readChoice({ DIFF_SCOPE: 'style' }, 'diff-scope', [
        'code',
        'style',
        'strict-lib',
      ]),
      { ok: true, value: 'style' },
    );
  });

  test('names the input, the value and the choices when it is none of them', () => {
    assert.deepStrictEqual(
      readChoice({ DIFF_SCOPE: 'cod' }, 'diff-scope', [
        'code',
        'style',
        'strict-lib',
      ]),
      {
        ok: false,
        message:
          'Input diff-scope is "cod"; expected one of code, style, strict-lib.',
      },
    );
  });

  test('a missing variable is a value like any other, and not a choice', () => {
    assert.deepStrictEqual(readChoice({}, 'diff-scope', ['code']), {
      ok: false,
      message: 'Input diff-scope is ""; expected one of code.',
    });
  });

  test('a boolean is `true` or `false` and nothing else', () => {
    // A misspelt flag would otherwise read as `false`, and drop the difference
    // the caller asked for without a word.
    assert.deepStrictEqual(
      readBoolean({ ENGINE_STRICT: 'true' }, 'engine-strict'),
      {
        ok: true,
        value: true,
      },
    );

    assert.deepStrictEqual(
      readBoolean({ ENGINE_STRICT: 'false' }, 'engine-strict'),
      { ok: true, value: false },
    );

    assert.deepStrictEqual(
      readBoolean({ ENGINE_STRICT: 'ture' }, 'engine-strict'),
      {
        ok: false,
        message: 'Input engine-strict is "ture"; expected one of true, false.',
      },
    );
  });
});

/** The setup action's inputs at their defaults, with `overrides` on top. */
const inputs = (
  overrides: ReadonlyRecord<string, string> = {},
): ReadonlyRecord<string, string> =>
  ({
    PNPM: 'true',
    INSTALL: 'true',
    ENGINE_STRICT: 'false',
    IGNORE_SCRIPTS: 'false',
    ...overrides,
  }) as const;

describe('install', () => {
  test('installs the lockfile as it is by default', () => {
    assert.deepStrictEqual(installArgs(inputs()), {
      ok: true,
      value: ['install', '--frozen-lockfile'],
    });
  });

  test('adds each flag the caller asked for', () => {
    assert.deepStrictEqual(
      installArgs(inputs({ ENGINE_STRICT: 'true', IGNORE_SCRIPTS: 'true' })),
      {
        ok: true,
        value: [
          'install',
          '--frozen-lockfile',
          '--engine-strict',
          '--ignore-scripts',
        ],
      },
    );
  });

  test('`install: false` installs nothing', () => {
    assert.deepStrictEqual(installArgs(inputs({ INSTALL: 'false' })), {
      ok: true,
      value: undefined,
    });
  });

  test('every input is read, whichever of them is misspelt', () => {
    assert.deepStrictEqual(installArgs(inputs({ INSTALL: 'flase' })), {
      ok: false,
      message: 'Input install is "flase"; expected one of true, false.',
    });

    assert.deepStrictEqual(installArgs(inputs({ IGNORE_SCRIPTS: 'yes' })), {
      ok: false,
      message: 'Input ignore-scripts is "yes"; expected one of true, false.',
    });

    assert.deepStrictEqual(installArgs(inputs({ PNPM: 'no' })), {
      ok: false,
      message: 'Input pnpm is "no"; expected one of true, false.',
    });
  });

  test('`pnpm: false` installs nothing, and refuses an install it cannot run', () => {
    assert.deepStrictEqual(
      installArgs(inputs({ PNPM: 'false', INSTALL: 'false' })),
      { ok: true, value: undefined },
    );

    assert.deepStrictEqual(installArgs(inputs({ PNPM: 'false' })), {
      ok: false,
      message: 'Input install is true with pnpm false; set install: false too.',
    });
  });
});

describe('check-diff', () => {
  const zeroSha = '0'.repeat(40);

  const beforeSha = 'a'.repeat(40);

  test('diffs a pull request against origin/main', () => {
    assert.deepStrictEqual(
      planDiffCheck({
        DIFF_SCOPE: 'code',
        GITHUB_REF_NAME: '2058/merge',
        BASE_REF: 'main',
        BEFORE: '',
      }),
      {
        ok: true,
        value: {
          fetch: '+refs/heads/main:refs/remotes/origin/main',
          scope: 'code',
          base: 'origin/main',
        },
      },
    );
  });

  test('diffs a stacked pull request against the branch it is stacked on', () => {
    assert.deepStrictEqual(
      planDiffCheck({
        DIFF_SCOPE: 'code',
        GITHUB_REF_NAME: '2070/merge',
        BASE_REF: 'feat/lower-layer',
        BEFORE: '',
      }),
      {
        ok: true,
        value: {
          fetch:
            '+refs/heads/feat/lower-layer:refs/remotes/origin/feat/lower-layer',
          scope: 'code',
          base: 'origin/feat/lower-layer',
        },
      },
    );
  });

  test('diffs a push to main against what main pointed at before it', () => {
    assert.deepStrictEqual(
      planDiffCheck({
        DIFF_SCOPE: 'strict-lib',
        GITHUB_REF_NAME: 'main',
        BEFORE: beforeSha,
      }),
      {
        ok: true,
        value: {
          fetch: beforeSha,
          scope: 'strict-lib',
          base: beforeSha,
        },
      },
    );
  });

  test('runs everything on main when there is nothing to compare against', () => {
    // A manual run, or the first push to the branch: skipping would report
    // `skipped`, which satisfies a required check.
    for (const before of ['', zeroSha]) {
      assert.deepStrictEqual(
        planDiffCheck({
          DIFF_SCOPE: 'style',
          GITHUB_REF_NAME: 'main',
          BEFORE: before,
        }),
        { ok: true, value: 'run-everything' },
      );
    }
  });

  // A queue stacks the queued pull requests on `main`, one commit each, and
  // judges each layer on its own commit against the layer below, as a stacked
  // pull request is: the commit and its parent, wherever the run is.
  test('diffs a run asked to against its parent', () => {
    for (const ref of ['queue/2', 'main']) {
      assert.deepStrictEqual(
        planDiffCheck({
          DIFF_SCOPE: 'code',
          GITHUB_REF_NAME: ref,
          GITHUB_SHA: beforeSha,
          BEFORE: '',
          DIFF_PARENT: 'true',
        }),
        {
          ok: true,
          value: { fetch: beforeSha, depth: 2, scope: 'code', base: 'HEAD^' },
        },
      );
    }
  });

  test('refuses to diff against a parent it cannot name', () => {
    for (const sha of ['', 'HEAD', 'abc123']) {
      assert.isFalse(
        planDiffCheck({
          DIFF_SCOPE: 'code',
          GITHUB_REF_NAME: 'queue/1',
          GITHUB_SHA: sha,
          BEFORE: '',
          DIFF_PARENT: 'true',
        }).ok,
      );
    }
  });

  test('diffs a manual run as before when not asked to', () => {
    assert.deepStrictEqual(
      planDiffCheck({
        DIFF_SCOPE: 'code',
        GITHUB_REF_NAME: 'main',
        GITHUB_SHA: beforeSha,
        BEFORE: '',
        DIFF_PARENT: 'false',
      }),
      { ok: true, value: 'run-everything' },
    );
  });

  test('refuses a scope it does not know', () => {
    assert.deepStrictEqual(
      planDiffCheck({
        DIFF_SCOPE: 'none',
        GITHUB_REF_NAME: 'main',
        BEFORE: '',
      }),
      {
        ok: false,
        message:
          'Input diff-scope is "none"; expected one of code, style, strict-lib.',
      },
    );
  });
});

const lists = (value: unknown): string => JSON.stringify(value);

describe('the ignore lists', () => {
  test('reads the three lists', () => {
    assert.deepStrictEqual(
      parseGateLists(
        lists({ code: ['docs/', '**.md'], style: [], 'strict-lib': ['apps/'] }),
      ),
      {
        ok: true,
        value: { code: ['docs/', '**.md'], style: [], 'strict-lib': ['apps/'] },
      },
    );
  });

  test('a lists file it cannot read is an error, not a throw', () => {
    assert.deepStrictEqual(readGateList('code', '/nonexistent'), {
      ok: false,
      message:
        'Could not read /nonexistent/tools/configs/gate-ignore-lists.json: ENOENT',
    });
  });

  test('refuses a file that is not exactly the three lists of strings', () => {
    for (const text of [
      'not json',
      lists(['docs/']),
      lists({ code: [], style: [] }),
      lists({ code: [], style: [], 'strict-lib': [], extra: [] }),
      lists({ code: 'docs/', style: [], 'strict-lib': [] }),
      lists({ code: [1], style: [], 'strict-lib': [] }),
    ]) {
      assert.isFalse(parseGateLists(text).ok);
    }
  });

  test('refuses a pattern of a shape it does not match', () => {
    assert.deepStrictEqual(
      parseGateLists(
        lists({ code: ['src/*/x.ts'], style: [], 'strict-lib': [] }),
      ),
      {
        ok: false,
        message:
          'tools/configs/gate-ignore-lists.json, list code: Unsupported ignore pattern "src/*/x.ts": only `dir/` (whose segments may be `*`), `**.ext`, `**/name`, `*.ext`, `dir/**/*.ext` and a plain path are understood, each optionally after a `!` that excepts what it matches.',
      },
    );
  });

  // Each answer is micromatch's with `{ dot: true }`, which `check-should-run`
  // of ts-repo-utils gave before the gate read the lists itself.
  test.each([
    ['docs/a/b.ts', 'docs/', true],
    ['docsx/a.ts', 'docs/', false],
    ['.changeset/a.md', '.changeset/', true],
    ['README.md', '**.md', true],
    ['libs/a/README.md', '**.md', true],
    ['.changeset/a.md', '**.md', true],
    ['a/.md', '**.md', true],
    ['a/b.mdx', '**.md', false],
    ['cspell.config.yaml', '**/cspell.config.yaml', true],
    ['libs/a/cspell.config.yaml', '**/cspell.config.yaml', true],
    ['libs/a/xcspell.config.yaml', '**/cspell.config.yaml', false],
    ['README.md', '*.md', true],
    ['.x.md', '*.md', true],
    ['libs/README.md', '*.md', false],
    ['libs/x.md', 'libs/**/*.md', true],
    ['libs/a/.b/x.md', 'libs/**/*.md', true],
    ['libsx/a.md', 'libs/**/*.md', false],
    ['LICENSE', 'LICENSE', true],
    ['libs/a/LICENSE', 'LICENSE', false],
    ['apps/a/src/x.md', 'apps/*/src/', true],
    ['apps/a/src/b/.x.md', 'apps/*/src/', true],
    ['apps/.a/src/x.md', 'apps/*/src/', true],
    ['apps/a/x.md', 'apps/*/src/', false],
    ['apps/src/x.md', 'apps/*/src/', false],
    ['apps/a/src-old/x.md', 'apps/*/src/', false],
    ['apps/a/b/src/x.md', 'apps/*/src/', false],
  ] as const)('%s against %s: %s', (file, pattern, expected) => {
    assert.strictEqual(matchesGatePattern(file, pattern), expected);
  });

  test.each([
    'apps/a*/',
    'apps/**/src/',
    'apps//src/',
    '*/',
    '!*/*/',
    '!',
    '!!docs/',
    '!src/*/x.ts',
  ])('refuses %s', (pattern) => {
    assert.isFalse(
      parseGateLists(lists({ code: [pattern], style: [], 'strict-lib': [] }))
        .ok,
    );
  });

  // An exception is not an ignore pattern of its own, so it is read only
  // together with the list (`ignoredBy`).
  test('a single exception is not matched on its own', () => {
    assert.throws(
      () => matchesGatePattern('apps/a/src/x.md', '!apps/*/src/'),
      /Unsupported/u,
    );
  });

  test.each([
    ['apps/a/src/x.md', false],
    ['apps/a/README.md', true],
    ['apps/a/src/x.mts', false],
    ['docs/a.md', false],
  ] as const)(
    'a file on a `!` pattern counts whatever else matches it: %s is ignored: %s',
    (file, expected) => {
      assert.strictEqual(
        ignoredBy(['**.md', 'docs/', '!apps/*/src/', '!docs/'])(file),
        expected,
      );
    },
  );

  test('the order of the patterns does not matter', () => {
    assert.isFalse(ignoredBy(['!apps/*/src/', '**.md'])('apps/a/src/x.md'));

    assert.isFalse(ignoredBy(['**.md', '!apps/*/src/'])('apps/a/src/x.md'));
  });

  test('an exception alone ignores nothing', () => {
    assert.isFalse(ignoredBy(['!apps/*/src/'])('docs/a.md'));
  });

  test("the repository's lists are read", () => {
    const parsed = parseGateLists(
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFileSync(gateListsFile, 'utf8'),
    );

    assert.deepStrictEqual(parsed.ok ? undefined : parsed.message, undefined);
  });

  test('the first file on no pattern is what makes the checks run', () => {
    assert.strictEqual(
      firstFileToCheck(['docs/a.md', 'libs/a/src/x.mts'], ['docs/']),
      'libs/a/src/x.mts',
    );

    assert.isUndefined(
      firstFileToCheck(['docs/a.md', 'README.md'], ['docs/', '*.md']),
    );

    assert.isUndefined(firstFileToCheck([], ['docs/']));

    assert.strictEqual(
      firstFileToCheck(
        ['README.md', 'apps/a/src/x.md'],
        ['**.md', '!apps/*/src/'],
      ),
      'apps/a/src/x.md',
    );
  });

  test("the repository's code list counts an app's pages and nothing else under **.md", () => {
    const code = readGateList('code', projectRoot);

    const patterns = code.ok ? code.value : ([] as const);

    assert.isNotEmpty(patterns);

    assert.isFalse(
      ignoredBy(patterns)(
        'apps/synstate-docs/src/content/docs/ja/getting-started/installation.md',
      ),
    );

    assert.isTrue(ignoredBy(patterns)('apps/synstate-docs/README.md'));

    assert.isTrue(ignoredBy(patterns)('libs/ts-data-forge/README.md'));
  });
});

describe('should-run', () => {
  test('reads the patterns and the base, origin/main by default', () => {
    assert.deepStrictEqual(
      parseShouldRunArgs(['--paths-ignore', 'docs/', '--paths-ignore', '*.md']),
      {
        ok: true,
        value: {
          patterns: ['docs/', '*.md'],
          base: 'origin/main',
          label: 'the --paths-ignore list',
        },
      },
    );

    assert.deepStrictEqual(
      parseShouldRunArgs(['--base-branch', 'abc', '--paths-ignore', 'docs/']),
      {
        ok: true,
        value: {
          patterns: ['docs/'],
          base: 'abc',
          label: 'the --paths-ignore list',
        },
      },
    );
  });

  test('reads a scope as that list of the repository', () => {
    const parsed = parseShouldRunArgs(['--scope', 'style']);

    // The file itself, read apart from the code under test.
    const file: unknown = JSON.parse(
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the repository's lists file.
      fs.readFileSync(gateListsFile, 'utf8'),
    );

    // A malformed file is reported as one, not as the parser disagreeing.
    assert.isTrue(isRecord(file));

    const style = file['style'];

    assert.isTrue(Arr.isArray(style) && style.every(isString));

    assert.deepStrictEqual(parsed.ok ? undefined : parsed.message, undefined);

    assert.deepStrictEqual(parsed.ok ? parsed.value : undefined, {
      patterns: style,
      base: 'origin/main',
      label: 'the style list',
    });
  });

  test('refuses what the gate would not read', () => {
    for (const args of [
      ['--scope', 'none'],
      ['--scope', 'code', '--paths-ignore', 'docs/'],
      ['--paths-ignore'],
      ['--base', 'x'],
      ['--paths-ignore', 'docs/', 'extra'],
      ['--paths-ignore', 'src/*/x.ts'],
    ]) {
      assert.isFalse(parseShouldRunArgs(args).ok);
    }
  });
});

/**
 * Fake `pnpm` and `git` on `PATH` that echo what they were asked to do, so the
 * run shows the exact command lines without touching anything.
 */
const makeBinDir = (): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-steps-'));

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(
    path.join(dir, 'pnpm'),
    '#!/bin/sh\necho "fake pnpm: $*"\n',
    { mode: 0o755 },
  );

  // `git diff` answers with the newline-separated `FAKE_DIFF`, NUL-separated as
  // `-z` asks, and leaves its command line in `diff-args`.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(
    path.join(dir, 'git'),
    [
      '#!/bin/sh',
      'if [ "$1" = diff ]; then',
      '  echo "$*" > diff-args',
      String.raw`  printf '%s' "$FAKE_DIFF" | tr '\n' '\0'`,
      'else',
      '  echo "fake git: $*"',
      'fi',
      '',
    ].join('\n'),
    { mode: 0o755 },
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.mkdirSync(path.join(dir, 'tools/configs'), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(
    path.join(dir, 'tools/configs/gate-ignore-lists.json'),
    JSON.stringify({ code: ['docs/', '**.md'], style: [], 'strict-lib': [] }),
  );

  return dir;
};

const git = (repo: string, args: readonly string[]): void => {
  execFileSync('git', args, {
    cwd: repo,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'test',
      GIT_AUTHOR_EMAIL: 'test@example.com',
      GIT_COMMITTER_NAME: 'test',
      GIT_COMMITTER_EMAIL: 'test@example.com',
    },
  });
};

/** A repository with `files` committed, for the real `git` to diff. */
const makeRepo = (files: ReadonlyRecord<string, string>): string => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-steps-repo-'));

  git(repo, ['init', '-q']);

  for (const [file, content] of Object.entries(files)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(path.join(repo, file), content);
  }

  git(repo, ['add', '.']);

  git(repo, ['-c', 'core.hooksPath=/dev/null', 'commit', '-q', '-m', 'base']);

  return repo;
};

/** The script under `node` in `cwd`, with the real `git`; never rejects. */
const runIn = async (
  cwd: string,
  args: readonly string[],
): Promise<Readonly<{ code: number | string | undefined; stdout: string }>> =>
  new Promise((resolve) => {
    execFile(
      process.execPath,
      Arr.toUnshifted(scriptPath)(args),
      { cwd, encoding: 'utf8' },
      (error, stdout) => {
        resolve({ code: error === null ? 0 : error.code, stdout });
      },
    );
  });

/**
 * `should-run`'s answer, against the real `git`, for a repository of
 * `docs/a.md` and `libs/x.mts` with `docs/` ignored, after `change`.
 */
const shouldRunAfter = async (
  change: (dir: string) => void,
): Promise<string | undefined> => {
  const repo = makeRepo({ 'docs/a.md': 'a', 'libs/x.mts': 'x' });

  change(repo);

  const { stdout } = await runIn(repo, [
    'should-run',
    '--base-branch',
    'HEAD',
    '--paths-ignore',
    'docs/',
  ]);

  return /should_run=(?<answer>\w+)/u.exec(stdout)?.groups?.['answer'];
};

/** A fresh path for `GITHUB_OUTPUT`. */
const makeOutput = (): string =>
  path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-steps-output-')),
    'output',
  );

/** An existing, empty file to stand for pnpm's verification record. */
const makeRecord = (): string => {
  const record = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-steps-record-')),
    'lockfile-verified.jsonl',
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(record, '');

  return record;
};

/** The script under `node`, as a workflow step runs it; never rejects. */
const run = async (
  args: readonly string[],
  env: ReadonlyRecord<string, string>,
  binDir: string = makeBinDir(),
): Promise<Readonly<{ code: number | string | undefined; stdout: string }>> =>
  new Promise((resolve) => {
    execFile(
      process.execPath,
      Arr.toUnshifted(scriptPath)(args),
      {
        cwd: binDir,
        encoding: 'utf8',
        env: {
          PATH: `${binDir}${path.delimiter}${process.env['PATH'] ?? ''}`,
          ...env,
        },
      },
      (error, stdout) => {
        resolve({ code: error === null ? 0 : error.code, stdout });
      },
    );
  });

describe('the script, run the way the workflows run it', () => {
  test('`install` runs pnpm with the flags it was given', async () => {
    const result = await run(['install'], {
      PNPM: 'true',
      INSTALL: 'true',
      ENGINE_STRICT: 'true',
      IGNORE_SCRIPTS: 'false',
      LOCKFILE_RECORD: makeRecord(),
    });

    assert.deepStrictEqual(result, {
      code: 0,
      stdout:
        'pnpm install --frozen-lockfile --engine-strict\nfake pnpm: install --frozen-lockfile --engine-strict\n',
    });
  });

  test('`install` warns when pnpm left no verification record to cache', async () => {
    // The setup action caches the record so that the jobs after the first skip
    // pnpm's lockfile verification. A pnpm that writes it elsewhere would make
    // that cache save nothing, and every job pay for the verification again,
    // with nothing failing.
    const record = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-steps-record-')),
      'lockfile-verified.jsonl',
    );

    const result = await run(['install'], {
      PNPM: 'true',
      INSTALL: 'true',
      ENGINE_STRICT: 'false',
      IGNORE_SCRIPTS: 'false',
      LOCKFILE_RECORD: record,
    });

    assert.deepStrictEqual(result, {
      code: 0,
      stdout: [
        'pnpm install --frozen-lockfile',
        'fake pnpm: install --frozen-lockfile',
        `::warning::pnpm left no lockfile verification record at ${record}, so the setup action's cache of it saves nothing and every job verifies the lockfile again. Point the "Locate pnpm's lockfile verification record" step of .github/actions/setup/action.yml at the file this pnpm writes.`,
        '',
      ].join('\n'),
    });
  });

  test('`install` without a record path stops before installing', async () => {
    // Empty is what a skipped step's output reads as.
    const unset: readonly ReadonlyRecord<string, string>[] = [
      {},
      { LOCKFILE_RECORD: '' },
    ] as const;

    const results = await Promise.all(
      unset.map(async (record) =>
        run(['install'], {
          PNPM: 'true',
          INSTALL: 'true',
          ENGINE_STRICT: 'false',
          IGNORE_SCRIPTS: 'false',
          ...record,
        }),
      ),
    );

    for (const result of results) {
      assert.deepStrictEqual(result, {
        code: 1,
        stdout: '::error::LOCKFILE_RECORD is not set.\n',
      });
    }
  });

  test('a misspelt input stops the step with an error annotation', async () => {
    const result = await run(['install'], {
      PNPM: 'true',
      INSTALL: 'true',
      ENGINE_STRICT: 'ture',
      IGNORE_SCRIPTS: 'false',
    });

    assert.deepStrictEqual(result, {
      code: 1,
      stdout:
        '::error::Input engine-strict is "ture"; expected one of true, false.\n',
    });
  });

  test('`check-diff` answers `should_run` itself when it cannot diff', async () => {
    const outputDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'workflow-steps-output-'),
    );

    const output = path.join(outputDir, 'output');

    const result = await run(['check-diff'], {
      DIFF_SCOPE: 'code',
      GITHUB_REF_NAME: 'main',
      BEFORE: '',
      GITHUB_OUTPUT: output,
    });

    assert.deepStrictEqual(result.code, 0);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const written = fs.readFileSync(output, 'utf8');

    assert.deepStrictEqual(written, 'should_run=true\n');
  });

  test('`check-diff` fetches the old tip of main and diffs against it', async () => {
    const before = 'b'.repeat(40);

    const output = makeOutput();

    const binDir = makeBinDir();

    const result = await run(
      ['check-diff'],
      {
        DIFF_SCOPE: 'code',
        GITHUB_REF_NAME: 'main',
        BEFORE: before,
        GITHUB_OUTPUT: output,
        FAKE_DIFF: 'docs/a.ts\nlibs/a/src/x.mts\nREADME.md',
      },
      binDir,
    );

    assert.deepStrictEqual(result, {
      code: 0,
      stdout: [
        `fake git: fetch --depth=1 origin ${before}`,
        'should_run=true: the code list does not ignore libs/a/src/x.mts (3 changed files).',
        '',
      ].join('\n'),
    });

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    assert.strictEqual(fs.readFileSync(output, 'utf8'), 'should_run=true\n');

    assert.strictEqual(
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFileSync(path.join(binDir, 'diff-args'), 'utf8'),
      `diff --name-only -z --no-renames ${before} --\n`,
    );
  });

  test('`check-diff` skips when every changed file is on a pattern', async () => {
    const output = makeOutput();

    const result = await run(['check-diff'], {
      DIFF_SCOPE: 'code',
      GITHUB_REF_NAME: '2058/merge',
      BASE_REF: 'main',
      GITHUB_OUTPUT: output,
      FAKE_DIFF: 'docs/a.ts\nREADME.md',
    });

    assert.deepStrictEqual(result, {
      code: 0,
      stdout: [
        'fake git: fetch --depth=1 origin +refs/heads/main:refs/remotes/origin/main',
        'should_run=false: the code list ignores every one of the 2 changed files.',
        '',
      ].join('\n'),
    });

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    assert.strictEqual(fs.readFileSync(output, 'utf8'), 'should_run=false\n');
  });

  test('`check-diff` stops on a lists file it cannot read', async () => {
    const binDir = makeBinDir();

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(
      path.join(binDir, 'tools/configs/gate-ignore-lists.json'),
      JSON.stringify({ code: [] }),
    );

    const result = await run(
      ['check-diff'],
      {
        DIFF_SCOPE: 'style',
        GITHUB_REF_NAME: '2058/merge',
        BASE_REF: 'main',
        GITHUB_OUTPUT: makeOutput(),
        FAKE_DIFF: 'docs/a.ts',
      },
      binDir,
    );

    assert.deepStrictEqual(result, {
      code: 1,
      stdout: [
        'fake git: fetch --depth=1 origin +refs/heads/main:refs/remotes/origin/main',
        '::error::tools/configs/gate-ignore-lists.json holds the lists code, style and strict-lib and nothing else, each an array of strings.',
        '',
      ].join('\n'),
    });
  });

  test('`should-run` counts a deletion and both names of a rename', async () => {
    // Against a real repository: a diff that only deletes code, or moves it
    // onto a pattern, has to run the checks, which a filter on the diff would
    // quietly undo.
    assert.strictEqual(
      await shouldRunAfter((dir) => {
        git(dir, ['rm', '-q', 'libs/x.mts']);
      }),
      'true',
    );

    assert.strictEqual(
      await shouldRunAfter((dir) => {
        git(dir, ['mv', 'libs/x.mts', 'docs/x.mts']);
      }),
      'true',
    );

    assert.strictEqual(
      await shouldRunAfter((dir) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(path.join(dir, 'docs/a.md'), 'b');
      }),
      'false',
    );
  });

  test('an unknown command is a usage error', async () => {
    const result = await run(['nope'], {});

    assert.deepStrictEqual(result.code, 2);
  });

  test('the script needs nothing but Node itself', () => {
    // It runs before anything is installed, and on every Node the setup action
    // is given — the `minimum` of tools/configs/node-support.json included,
    // which has no `Temporal`.

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const source = fs.readFileSync(scriptPath, 'utf8');

    const specifiers = source
      .matchAll(/^import (?!type )[^;]* from '([^']+)';$/gmu)
      .map((m) => m[1])
      .toArray();

    assert.isNotEmpty(specifiers);

    assert.deepStrictEqual(
      specifiers.filter((s) => !(s?.startsWith('node:') ?? false)),
      [],
    );

    assert.notMatch(source, /\bTemporal\./u);
  });
});
