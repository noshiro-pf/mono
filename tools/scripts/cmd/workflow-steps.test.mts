// cspell:ignore ture flase

import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Arr } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import {
  installArgs,
  planDiffCheck,
  readBoolean,
  readChoice,
} from './workflow-steps.mjs';

const scriptPath = fileURLToPath(
  new URL('workflow-steps.mts', import.meta.url),
);

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
    // A misspelt flag would otherwise read as `false`, and drop the
    // difference the caller asked for without a word.
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
        value: { run: ['run', 'z:check-should-run:code-checks'] },
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
          run: [
            'run',
            'z:check-should-run:code-checks',
            '--base-branch',
            'origin/feat/lower-layer',
          ],
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
          run: [
            'run',
            'z:check-should-run:strict-lib-checks',
            '--base-branch',
            beforeSha,
          ],
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

/**
 * Fake `pnpm` and `git` on `PATH` that echo what they were asked to do, so
 * the run shows the exact command lines without touching anything.
 */
const makeBinDir = (): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-steps-'));

  for (const name of ['pnpm', 'git']) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(
      path.join(dir, name),
      `#!/bin/sh\necho "fake ${name}: $*"\n`,
      { mode: 0o755 },
    );
  }

  return dir;
};

/** The script under `node`, as a workflow step runs it; never rejects. */
const run = async (
  args: readonly string[],
  env: ReadonlyRecord<string, string>,
): Promise<Readonly<{ code: number | string | undefined; stdout: string }>> => {
  const binDir = makeBinDir();

  return new Promise((resolve) => {
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
};

describe('the script, run the way the workflows run it', () => {
  test('`install` runs pnpm with the flags it was given', async () => {
    const result = await run(['install'], {
      INSTALL: 'true',
      ENGINE_STRICT: 'true',
      IGNORE_SCRIPTS: 'false',
    });

    assert.deepStrictEqual(result, {
      code: 0,
      stdout:
        'pnpm install --frozen-lockfile --engine-strict\nfake pnpm: install --frozen-lockfile --engine-strict\n',
    });
  });

  test('a misspelt input stops the step with an error annotation', async () => {
    const result = await run(['install'], {
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

  test('`check-diff` fetches the old tip of main before diffing against it', async () => {
    const before = 'b'.repeat(40);

    const result = await run(['check-diff'], {
      DIFF_SCOPE: 'code',
      GITHUB_REF_NAME: 'main',
      BEFORE: before,
    });

    assert.deepStrictEqual(result, {
      code: 0,
      stdout: [
        `fake git: fetch --depth=1 origin ${before}`,
        `fake pnpm: run z:check-should-run:code-checks --base-branch ${before}`,
        '',
      ].join('\n'),
    });
  });

  test('an unknown command is a usage error', async () => {
    const result = await run(['nope'], {});

    assert.deepStrictEqual(result.code, 2);
  });

  test('the script needs nothing but Node itself', () => {
    // It runs before anything is installed, and on every Node the setup
    // action is given — the `minimum` of tools/configs/node-support.json
    // included, which has no `Temporal`.

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
