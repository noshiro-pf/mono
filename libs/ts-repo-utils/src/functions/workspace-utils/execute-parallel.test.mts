import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import * as util from 'node:util';
import { isRecord, Num, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { executeParallel } from './execute-parallel.mjs';
import type { Package } from './types.mjs';

const execFileAsync = util.promisify(execFile);

// The scripts below are POSIX shell, which every machine running these tests
// has; the Windows branch of `executeParallel` is not run here. Each test
// starts npm at least once and some wait for seconds, past Vitest's default
// timeout on a loaded machine.
describe(executeParallel, { timeout: 60_000 }, () => {
  /**
   * Writes one package per entry of `scripts` to a new temporary directory, each
   * with a `package.json` declaring `t` as that script (`undefined` declares no
   * script), and passes them to `run` with the directory.
   */
  const withPackages = async <T,>(
    scripts: readonly (string | undefined)[],
    run: (packages: readonly Package[], dir: string) => Promise<T>,
  ): Promise<T> => {
    const root = await fs.mkdtemp(path.join(tmpdir(), 'execute-parallel-'));

    try {
      const packages = await Promise.all(
        scripts.map(async (script, index): Promise<Package> => {
          const name = `p${index}` as const;

          const pkgPath = path.join(root, name);

          const pkgScripts: ReadonlyRecord<string, string> =
            script === undefined ? ({} as const) : ({ t: script } as const);

          const packageJson = { name, scripts: pkgScripts } as const;

          // eslint-disable-next-line security/detect-non-literal-fs-filename
          await fs.mkdir(pkgPath);

          // eslint-disable-next-line security/detect-non-literal-fs-filename
          await fs.writeFile(
            path.join(pkgPath, 'package.json'),
            JSON.stringify(packageJson),
          );

          return { name, path: pkgPath, packageJson, dependencies: {} };
        }),
      );

      return await run(packages, root);
    } finally {
      // A script a failing test left running ends on its own: every wait and
      // sleep in them is bounded.
      await fs.rm(root, { recursive: true, force: true });
    }
  };

  /**
   * Keeps what the scripts and `executeParallel` print out of the test output,
   * and returns what was written to `process.stdout`, with `console.error` and
   * with `console.warn`.
   *
   * `vi.spyOn` is restricted to keep tests off mocks; what is observed here is
   * output, which nothing else exposes.
   */
  const captureOutput = (): Readonly<{
    stdout: () => string;
    errors: () => string;
    warnings: () => string;
    restore: () => void;
  }> => {
    // eslint-disable-next-line vitest/no-restricted-vi-methods
    const stdoutSpy = vi.spyOn(process.stdout, 'write').mockReturnValue(true);

    // eslint-disable-next-line vitest/no-restricted-vi-methods
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

    const consoleErrorSpy = vi
      // eslint-disable-next-line vitest/no-restricted-vi-methods
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const consoleWarnSpy = vi
      // eslint-disable-next-line vitest/no-restricted-vi-methods
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    return {
      stdout: () =>
        stdoutSpy.mock.calls
          .map(([chunk]) =>
            typeof chunk === 'string'
              ? chunk
              : Buffer.from(chunk).toString('utf8'),
          )
          .join(''),
      errors: () => consoleErrorSpy.mock.calls.flat().map(String).join(' '),
      warnings: () => consoleWarnSpy.mock.calls.flat().map(String).join(' '),
      restore: () => {
        stdoutSpy.mockRestore();

        stderrSpy.mockRestore();

        consoleErrorSpy.mockRestore();

        consoleWarnSpy.mockRestore();
      },
    };
  };

  /**
   * Records the pid of the shell running what follows it, which an `exec` after
   * it hands to the command it runs.
   */
  const recordPid = 'echo $$ > ../p1-pid.txt';

  /**
   * Shell that runs while `condition` holds, for `seconds * 10` rounds of
   * `sleep 0.1` at most (about `seconds`, longer on a loaded machine), so that
   * a script a failing test leaves behind ends on its own.
   */
  const whileBounded = (condition: string, seconds: number): string =>
    `i=0; while ${condition} && [ $i -lt ${seconds * 10} ]; do sleep 0.1; i=$((i + 1)); done` as const;

  /** Waits, for 10 s at most, until `p1` has recorded its pid. */
  const waitForP1 = whileBounded('[ ! -s ../p1-pid.txt ]', 10);

  /** A script that fails once `p1` has recorded its pid. */
  const failOnceP1Started = `${waitForP1}; exit 3` as const;

  /** The pid `p1` recorded, if it recorded one. */
  const readP1Pid = async (dir: string): Promise<number | undefined> => {
    const recorded = await Result.fromPromise(
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFile(path.join(dir, 'p1-pid.txt'), 'utf8'),
    );

    if (Result.isErr(recorded)) {
      return undefined;
    }

    const pid = Num.safeParseInt(recorded.value.trim());

    return Result.isOk(pid) ? pid.value : undefined;
  };

  /** Whether `pid` is a process still running, as `ps` lists it. */
  const isRunning = async (pid: number): Promise<boolean> => {
    const ps = await Result.fromPromise(
      execFileAsync('ps', ['-o', 'stat=', '-p', pid.toString()], {
        encoding: 'utf8',
      }),
    );

    // `ps -p` exits with 1, printing nothing, for a pid it does not list; any
    // other failure, such as a usage error, means nothing was checked.
    if (Result.isErr(ps)) {
      if (
        isRecord(ps.value) &&
        ps.value['code'] === 1 &&
        ps.value['stdout'] === '' &&
        ps.value['stderr'] === ''
      ) {
        return false;
      }

      throw new Error('ps could not tell whether the process runs', {
        cause: ps.value,
      });
    }

    // A zombie has exited.
    const stat = ps.value.stdout.trim();

    return stat !== '' && !stat.startsWith('Z');
  };

  /**
   * Asserts that the process `p1` recorded has gone: one that was not stopped
   * would still be running, as each runs for 30 s.
   */
  const expectP1Stopped = async (dir: string): Promise<void> => {
    const pid = await readP1Pid(dir);

    assert.isDefined(pid);

    // A process sent `SIGKILL` can take a moment to go.
    await vi.waitFor(
      async () => {
        assert.isFalse(await isRunning(pid));
      },
      { timeout: 2000, interval: 100 },
    );
  };

  /**
   * Puts first on `PATH`, while `run` runs, a `ps` that answers the first
   * `reads` reads of the process table (`ps -A …`, as `executeParallel` reads
   * it) and fails every read after them, by exiting with 1 (`'exit'`) or by not
   * answering for 30 s (`'hang'`); any other use of `ps` goes to the real one.
   */
  const withPsAnswering = async <T,>(
    reads: number,
    failure: 'exit' | 'hang',
    run: () => Promise<T>,
  ): Promise<T> => {
    const { stdout: realPs } = await execFileAsync(
      'sh',
      ['-c', 'command -v ps'],
      { encoding: 'utf8' },
    );

    const bin = await fs.mkdtemp(path.join(tmpdir(), 'execute-parallel-ps-'));

    try {
      const count = path.join(bin, 'reads');

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(
        path.join(bin, 'ps'),
        [
          '#!/bin/sh',
          'if [ "$1" = -A ]; then',
          `  n=$(cat '${count}' 2> /dev/null || echo 0)`,
          `  echo $((n + 1)) > '${count}'`,
          `  if [ "$n" -ge ${reads} ]; then ${failure === 'hang' ? 'exec sleep 30' : 'exit 1'}; fi`,
          'fi',
          `exec '${realPs.trim()}' "$@"`,
          '',
        ].join('\n'),
        { mode: 0o755 },
      );

      vi.stubEnv('PATH', `${bin}${path.delimiter}${process.env['PATH'] ?? ''}`);

      try {
        return await run();
      } finally {
        vi.unstubAllEnvs();
      }
    } finally {
      await fs.rm(bin, { recursive: true, force: true });
    }
  };

  // First in the file: Node emits a deprecation warning once per process, so
  // after any other test has spawned a script this one could not see it.
  test('spawns the script without a deprecation warning', async () => {
    const mut_warnings: string[] = [];

    const onWarning = (warning: Readonly<Error>): void => {
      mut_warnings.push(warning.message);
    };

    process.on('warning', onWarning);

    const output = captureOutput();

    try {
      await withPackages(['exit 0'], async (packages) => {
        await executeParallel(packages, 't');
      });
    } finally {
      output.restore();

      process.off('warning', onWarning);
    }

    assert.deepStrictEqual(mut_warnings, []);
  });

  test('rejects when the script is killed by a signal', async () => {
    const output = captureOutput();

    try {
      await withPackages(
        [
          // Kills the process `executeParallel` spawned: the shell running
          // `npm run t`, which is npm's parent ($PPID is npm), or npm itself
          // where that shell replaced itself with npm.
          [
            "shell=$(ps -o ppid= -p $PPID | tr -d ' ')",
            `if [ "$shell" = "${process.pid}" ]; then kill -9 $PPID; else kill -9 $shell; fi`,
            'sleep 1',
          ].join('; '),
        ],
        async (packages) => {
          await expect(executeParallel(packages, 't')).rejects.toThrow(
            'p0 was killed by SIGKILL',
          );
        },
      );
    } finally {
      output.restore();
    }
  });

  test('starts no further script after the first failure', async () => {
    const output = captureOutput();

    try {
      await withPackages(
        ['exit 3', 'echo started > ../p1-started.txt'],
        async (packages, dir) => {
          await expect(executeParallel(packages, 't', 1)).rejects.toThrow(
            'p0 exited with code 3',
          );

          await expect(
            fs.access(path.join(dir, 'p1-started.txt')),
          ).rejects.toThrow('ENOENT');
        },
      );
    } finally {
      output.restore();
    }
  });

  test('stops the scripts still running on the first failure', async () => {
    const output = captureOutput();

    try {
      await withPackages(
        [failOnceP1Started, `${recordPid} && exec sleep 30`],
        async (packages, dir) => {
          await expect(executeParallel(packages, 't')).rejects.toThrow(
            'p0 exited with code 3',
          );

          // Only the script that failed is reported.
          expect(output.errors()).toContain('Error in p0');

          expect(output.errors()).not.toContain('p1');

          await expectP1Stopped(dir);
        },
      );
    } finally {
      output.restore();
    }
  });

  test('fails a script whose shell cannot start', async () => {
    const output = captureOutput();

    try {
      await withPackages(['exit 0'], async ([p0], dir) => {
        assert.isDefined(p0);

        // A directory that does not exist: the shell cannot start there.
        const missing = { ...p0, path: path.join(dir, 'missing') } as const;

        await expect(executeParallel([missing], 't')).rejects.toThrow('ENOENT');

        expect(output.errors()).toContain('Error in p0');
      });
    } finally {
      output.restore();
    }
  });

  test('stops the scripts still running when a shell cannot start', async () => {
    const output = captureOutput();

    try {
      await withPackages(
        [
          // Holds the third package back until `p1` has started.
          `${waitForP1}; exit 0`,
          `${recordPid} && exec sleep 30`,
          'exit 0',
        ],
        async ([p0, p1, p2], dir) => {
          assert.isDefined(p0);

          assert.isDefined(p1);

          assert.isDefined(p2);

          // A directory that does not exist: the shell cannot start there.
          const missing = { ...p2, path: path.join(dir, 'missing') } as const;

          await expect(
            executeParallel([p1, p0, missing], 't', 2),
          ).rejects.toThrow('ENOENT');

          await expectP1Stopped(dir);

          expect(output.errors()).not.toContain('Error in p1');
        },
      );
    } finally {
      output.restore();
    }
  });

  test('kills a script that does not stop on SIGTERM', async () => {
    const output = captureOutput();

    try {
      await withPackages(
        [
          failOnceP1Started,
          // An ignored signal stays ignored in what the shell starts.
          `trap '' TERM && ${recordPid} && exec sleep 30`,
        ],
        async (packages, dir) => {
          await expect(executeParallel(packages, 't')).rejects.toThrow(
            'p0 exited with code 3',
          );

          await expectP1Stopped(dir);
        },
      );
    } finally {
      output.restore();
    }
  });

  test('kills what a stopped script left running without its output', async () => {
    const output = captureOutput();

    try {
      await withPackages(
        [
          failOnceP1Started,
          // The inner shell ignores SIGTERM and does not hold the script's
          // output, so the output closes while it runs on.
          String.raw`sh -c "trap '' TERM && echo \$\$ > ../p1-pid.txt && exec sleep 30" > /dev/null 2>&1 & sleep 30`,
        ],
        async (packages, dir) => {
          await expect(executeParallel(packages, 't')).rejects.toThrow(
            'p0 exited with code 3',
          );

          await expectP1Stopped(dir);
        },
      );
    } finally {
      output.restore();
    }
  });

  test('sends SIGTERM to what a stopped script starts after it', async () => {
    const output = captureOutput();

    try {
      await withPackages(
        [failOnceP1Started, 'sh ../p1.sh'],
        async (packages, dir) => {
          // On SIGTERM, `p1` starts a child, which records the SIGTERM it gets
          // in turn; `p1` itself runs on until `SIGKILL`. The child sets its
          // trap as soon as it is forked, and a signal reaches it only once
          // `ps` has listed it and answered, tens of milliseconds later.
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          await fs.writeFile(
            path.join(dir, 'p1.sh'),
            [
              `child() { trap 'echo got > ../p1-term.txt; exit 0' TERM; ${whileBounded('true', 30)}; }`,
              "trap 'child &' TERM",
              recordPid,
              whileBounded('true', 30),
            ].join('\n'),
          );

          await expect(executeParallel(packages, 't')).rejects.toThrow(
            'p0 exited with code 3',
          );

          await expect(
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.readFile(path.join(dir, 'p1-term.txt'), 'utf8'),
          ).resolves.toBe('got\n');

          await expectP1Stopped(dir);
        },
      );
    } finally {
      output.restore();
    }
  });

  test.each(['exit', 'hang'] as const)(
    'warns, and still rejects, when the process table cannot be read in time (ps: %s)',
    async (failure) => {
      const output = captureOutput();

      try {
        // With `'exit'` the read fails at once. With `'hang'` it does not
        // answer and is given up on after 2 s, as one that fails; were it
        // waited for, it would answer after 30 s with no process, and no
        // warning would be printed. That is what catches a stop that waits; a
        // bound on the run's time would also count the scripts starting, which
        // a loaded machine stretches.
        await withPsAnswering(0, failure, async () =>
          withPackages(
            // Only the shell is signalled, so whether `p1` stops depends on
            // whether that shell replaced itself with npm, which passes
            // `SIGTERM` on; one left running ends with its `sleep`.
            [failOnceP1Started, `${recordPid} && exec sleep 30`],
            async (packages) => {
              await expect(executeParallel(packages, 't')).rejects.toThrow(
                'p0 exited with code 3',
              );

              expect(output.warnings()).toContain(
                'only the shells running the scripts are signalled, and what the scripts started may be left running',
              );
            },
          ),
        );
      } finally {
        output.restore();
      }
    },
  );

  test('warns, and kills no process it cannot confirm, when the process table cannot be read at the deadline', async () => {
    const output = captureOutput();

    try {
      // The first read answers, so the whole tree gets `SIGTERM`; the script
      // ignores it, and every read after the first fails. They fail at once:
      // past `runBounded` a read given up on is one that failed, which the test
      // above runs with a `ps` that does not answer.
      await withPsAnswering(1, 'exit', async () =>
        withPackages(
          [failOnceP1Started, `trap '' TERM && ${recordPid} && exec sleep 30`],
          async (packages, dir) => {
            await expect(executeParallel(packages, 't')).rejects.toThrow(
              'p0 exited with code 3',
            );

            expect(output.warnings()).toContain(
              'so what the scripts started may be left running',
            );

            // The script, which no read since the first confirms is the same
            // process, is not sent `SIGKILL`.
            const pid = await readP1Pid(dir);

            assert.isDefined(pid);

            assert.isTrue(await isRunning(pid));

            // Only a pid just confirmed running is killed; a failing run leaves
            // `sleep 30` to end on its own, as another process may have its pid
            // by the time it could be killed.
            process.kill(pid, 'SIGKILL');
          },
        ),
      );
    } finally {
      output.restore();
    }
  });

  test('stops waiting for output a process outside the script holds open', async () => {
    const output = captureOutput();

    try {
      await withPackages(
        [
          // Fails once the shell `executeParallel` spawned for `p1` has exited
          // (npm, where that shell replaced itself with npm), and records that
          // it saw it exit.
          [
            waitForP1,
            'shell=$(cat ../p1-shell.txt)',
            whileBounded('kill -0 "$shell" 2> /dev/null', 10),
            'if [ -n "$shell" ] && ! kill -0 "$shell" 2> /dev/null; then echo gone > ../p0-saw-exit.txt; fi',
            'exit 3',
          ].join('; '),
          // Records that shell: npm's parent, or npm itself. The script then
          // exits at once and leaves `sleep` holding its output, under no shell
          // that is still running; `sleep` ends on its own.
          [
            "shell=$(ps -o ppid= -p $PPID | tr -d ' ')",
            `if [ "$shell" = "${process.pid}" ]; then shell=$PPID; fi`,
            'echo $shell > ../p1-shell.txt',
            'sleep 40 & echo $! > ../p1-pid.txt',
          ].join('; '),
        ],
        async (packages, dir) => {
          const startedAt = Date.now();

          await expect(executeParallel(packages, 't')).rejects.toThrow(
            'p0 exited with code 3',
          );

          // Well before `sleep 40` would have closed the output: starting both
          // scripts and p0's waits take a few seconds when nothing is wrong,
          // and stopping takes one read of the process table (2 s at most), the
          // 5 s grace period spent waiting for output that does not close, and
          // a second more. p0's waits run to their limits only when something
          // is wrong, and the check of `p0-saw-exit.txt` below then fails if
          // this one does not.
          expect(Date.now() - startedAt).toBeLessThan(30_000);

          await expect(
            fs.access(path.join(dir, 'p0-saw-exit.txt')),
          ).resolves.toBeUndefined();

          // Left running, as no longer under the script's shell.
          const pid = await readP1Pid(dir);

          assert.isDefined(pid);

          assert.isTrue(await isRunning(pid));

          // Only a pid just confirmed running is killed; a failing run leaves
          // `sleep 40` to end on its own, as another process may have its pid
          // by the time it could be killed.
          process.kill(pid, 'SIGKILL');
        },
      );
    } finally {
      output.restore();
    }
  });

  test('leaves no rejection unhandled once the caller has caught it', async () => {
    const mut_unhandled: unknown[] = [];

    const onUnhandledRejection = (reason: unknown): void => {
      mut_unhandled.push(reason);
    };

    process.on('unhandledRejection', onUnhandledRejection);

    const output = captureOutput();

    try {
      await withPackages(['exit 3', 'sleep 1 && exit 4'], async (packages) => {
        await expect(executeParallel(packages, 't')).rejects.toThrow(
          'p0 exited with code 3',
        );

        // Past the time the second script would have failed, had it not been
        // stopped.
        await sleep(2500);
      });
    } finally {
      output.restore();

      process.off('unhandledRejection', onUnhandledRejection);
    }

    assert.deepStrictEqual(mut_unhandled, []);
  });

  test('decodes a character split across two chunks of output', async () => {
    const output = captureOutput();

    try {
      await withPackages(
        ['node -e "process.stdout.write(\'あ\'.repeat(100000))"'],
        async (packages) => {
          await executeParallel(packages, 't');
        },
      );

      const stdout = output.stdout();

      expect(stdout).toContain('あ'.repeat(100));

      expect(stdout).not.toContain('�');
    } finally {
      output.restore();
    }
  });

  test('returns the results in the order of the packages', async () => {
    const output = captureOutput();

    try {
      await withPackages(['sleep 1', undefined], async (packages) => {
        await expect(executeParallel(packages, 't')).resolves.toStrictEqual([
          { code: 0 },
          { skipped: true },
        ]);
      });
    } finally {
      output.restore();
    }
  });
});
