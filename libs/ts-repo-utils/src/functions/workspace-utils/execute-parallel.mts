// cspell:ignore lstart
import { isError } from '@sindresorhus/is';
import {
  execFile,
  spawn,
  type ChildProcessWithoutNullStreams,
} from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import * as util from 'node:util';
import {
  Arr,
  createPromise,
  hasKey,
  isNotUndefined,
  isRecord,
  pipe,
  Result,
  unknownToString,
} from 'ts-data-forge';
import type { Package } from './types.mjs';

const DEBUG = false as boolean;

/**
 * Executes a npm script across multiple packages in parallel with a concurrency
 * limit. Uses fail-fast behavior: on the first failure it starts no further
 * script, stops the scripts still running and waits for them to exit, then
 * rejects with that failure. A script killed by a signal counts as failed.
 *
 * @param packages - Array of Package objects to execute the script in
 * @param scriptName - The name of the npm script to execute
 * @param concurrency - Maximum number of packages to process simultaneously
 *   (default: 3)
 * @returns A promise that resolves to an array of execution results, in the
 *   order of `packages`, or rejects with the first failure once the scripts
 *   still running have stopped
 */
export const executeParallel = async (
  packages: readonly Package[],
  scriptName: string,
  concurrency: number = 3,
): Promise<readonly Readonly<{ code?: number; skipped?: boolean }>[]> => {
  const mut_results: Readonly<{ code?: number; skipped?: boolean }>[] = [];

  // Each script still running, with a promise of its outcome that never
  // rejects: a failure is recorded in `mut_failure` and read by the loop, so
  // that no promise is left rejected with nobody awaiting it.
  const mut_running = new Map<RunningScript, Promise<void>>();

  // Written by the callbacks below, read by the loop.
  const mut_failure: { first: Error | undefined } = { first: undefined };

  for (const [index, pkg] of packages.entries()) {
    if (mut_failure.first !== undefined) {
      break;
    }

    const running = executeScript(pkg, scriptName);

    mut_running.set(
      running,
      running.result.then((result) => {
        mut_running.delete(running);

        if (Result.isErr(result)) {
          mut_failure.first ??= result.value;
        } else {
          mut_results[index] = result.value;
        }
      }),
    );

    if (mut_running.size >= concurrency) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.race(mut_running.values());
    }
  }

  while (mut_running.size > 0) {
    if (mut_failure.first !== undefined) {
      break;
    }

    // eslint-disable-next-line no-await-in-loop
    await Promise.race(mut_running.values());
  }

  if (mut_failure.first !== undefined) {
    // Stop what is still running, and wait until it has stopped, so that
    // nothing is still writing when the caller reads the failure.
    const stopped = Array.from(mut_running.keys());

    for (const running of stopped) {
      running.markStopped();
    }

    await stopScripts(stopped.map((r) => r.proc).filter(isNotUndefined));

    await Promise.all(mut_running.values());

    throw mut_failure.first;
  }

  return mut_results;
};

/**
 * Executes a npm script across packages in dependency order stages. Packages
 * are grouped into stages where each stage contains packages whose dependencies
 * have been completed in previous stages. Uses fail-fast behavior: a failure
 * stops the scripts of its stage still running, as {@link executeParallel}
 * does, and no later stage starts.
 *
 * @param packages - Array of Package objects to execute the script in
 * @param scriptName - The name of the npm script to execute
 * @param concurrency - Maximum number of packages to process simultaneously
 *   within each stage (default: 3)
 * @returns A promise that resolves when all stages are complete, or rejects
 *   with the first failure once the scripts of its stage still running have
 *   stopped
 */
export const executeStages = async (
  packages: readonly Package[],
  scriptName: string,
  concurrency: number = 3,
): Promise<void> => {
  const dependencyGraph = buildDependencyGraph(packages);

  const sorted = topologicalSortPackages(packages, dependencyGraph);

  const mut_stages: (readonly Package[])[] = [];

  const mut_completed = new Set<string>();

  while (mut_completed.size < sorted.length) {
    const stage = sorted.filter(
      (pkg) =>
        !mut_completed.has(pkg.name) &&
        (dependencyGraph.get(pkg.name) ?? []).every((dep) =>
          mut_completed.has(dep),
        ),
    );

    if (Arr.isEmpty(stage)) {
      throw new Error('Circular dependency detected');
    }

    mut_stages.push(stage);

    for (const pkg of stage) {
      mut_completed.add(pkg.name);
    }
  }

  console.info(
    `\nExecuting ${scriptName} in ${mut_stages.length} stages (fail-fast mode)...\n`,
  );

  for (const [i, stage] of mut_stages.entries()) {
    if (!Arr.isNonEmpty(stage)) {
      continue;
    }

    console.info(`Stage ${i + 1}: ${stage.map((p) => p.name).join(', ')}`);

    try {
      // eslint-disable-next-line no-await-in-loop
      const results = await executeParallel(stage, scriptName, concurrency);

      // Log successful completion of the stage
      // All results are successful because executeParallel throws on any failure
      console.info(
        `✅ Stage ${i + 1} completed successfully (${results.length}/${stage.length} packages)`,
      );
    } catch (error) {
      // executeParallel throws on the first failure, once the stage's other
      // scripts have stopped (fail-fast)
      const errorMessage = isError(error)
        ? error.message
        : unknownToString(error);

      console.error(`\n❌ Stage ${i + 1} failed (fail-fast):`);

      console.error(errorMessage);

      throw new Error(`Stage ${i + 1} failed: ${errorMessage}`, {
        cause: error,
      });
    }
  }
};

/**
 * A script started by {@link executeScript}: its outcome, and what
 * {@link stopScripts} needs to stop it.
 */
type RunningScript = Readonly<{
  result: Promise<
    Result<Readonly<{ code?: number; skipped?: boolean }>, Error>
  >;
  /** The shell running `npm run`, or `undefined` for a package without the script. */
  proc: ChildProcessWithoutNullStreams | undefined;
  /**
   * Called before fail-fast stops the script, whose own outcome is then not
   * reported.
   */
  markStopped: () => void;
}>;

/**
 * How long, at least, the scripts that fail-fast stopped have to exit after
 * `SIGTERM` before what is left of them is sent `SIGKILL` (less for a process
 * they start meanwhile; see {@link stopScripts}).
 */
// At most this plus two reads of the process table (`readTimeoutMs` each): the
// one under way when it ends, and one more if that one failed.
const stopGracePeriodMs = 5000;

/**
 * How long, after `SIGKILL`, a script's output may stay open before it is no
 * longer waited for.
 */
const closeGracePeriodMs = 1000;

/** How often the process table is read while waiting for stopped processes. */
const pollIntervalMs = 200;

/** How long a read of the process table may take. */
const readTimeoutMs = 2000;

/**
 * How long `taskkill` may take to stop a script's tree on Windows: far longer
 * than walking any tree a script starts should take, so that only a `taskkill`
 * that does not answer is cut short, and the rest of that tree may then be left
 * running.
 */
const taskkillTimeoutMs = 30_000;

/**
 * The most output `ps` reading the process table, or `taskkill` stopping a
 * tree, may print: a line of under a hundred bytes a process, for far more
 * processes than a machine runs.
 */
const maxOutputBytes = 64 * 1024 * 1024;

const execFileAsync = util.promisify(execFile);

/**
 * A process as `ps` lists it. `start` tells it apart from a later process that
 * was given the same pid once it had exited.
 */
// `start` is `ps`'s wall-clock start time, which procps derives from the boot
// time and so moves if the clock is stepped while the scripts are stopped; a
// process then reads as gone and is not sent `SIGKILL`. Neither the raw start
// time nor the elapsed time is a field both procps and BSD `ps` print.
type ProcessEntry = Readonly<{ pid: number; ppid: number; start: string }>;

const identityOf = (p: ProcessEntry): string => `${p.pid} ${p.start}` as const;

/**
 * Runs `file` with `args` and returns what it printed, or `undefined` if it
 * fails or has not answered within `timeoutMs`: a command that does not answer
 * must not hold up the stopping it is run for.
 */
const runBounded = async (
  file: string,
  args: readonly string[],
  timeoutMs: number,
): Promise<string | undefined> => {
  // Cancelled once the command has answered, so that the commands of one stop,
  // a few dozen, leave no timers behind.
  const timer = new AbortController();

  const running = execFileAsync(file, args, {
    encoding: 'utf8',
    timeout: timeoutMs,
    killSignal: 'SIGKILL',
    maxBuffer: maxOutputBytes,
  });

  const run = await Promise.race([
    Result.fromPromise(running).finally(() => {
      timer.abort();
    }),
    Result.fromPromise(
      sleep(timeoutMs, undefined, { signal: timer.signal }),
    ).then(() => Result.err(undefined)),
  ]);

  if (Result.isOk(run)) {
    return run.value.stdout;
  }

  // A command that the timeout's signal cannot end yet, such as one waiting on
  // the kernel, is left to finish on its own, and does not keep this process
  // from exiting; `execFile` has closed its output when it sent the signal.
  running.child.unref();

  return undefined;
};

/**
 * Reads the process table with `ps` (procps or BSD), or `undefined` if it
 * cannot be read within `timeoutMs`.
 */
const readProcessTable = async (
  timeoutMs: number,
): Promise<readonly ProcessEntry[] | undefined> => {
  const listed = await runBounded(
    'ps',
    ['-A', '-o', 'pid=,ppid=,lstart='],
    timeoutMs,
  );

  if (listed === undefined) {
    return undefined;
  }

  return Arr.generate(function* () {
    for (const line of listed.split('\n')) {
      const groups =
        /^\s*(?<pid>\d+)\s+(?<ppid>\d+)\s+(?<start>\S.*?)\s*$/u.exec(
          line,
        )?.groups;

      if (groups !== undefined) {
        yield {
          pid: Number(groups['pid']),
          ppid: Number(groups['ppid']),
          start: groups['start'] ?? '',
        };
      }
    }
  });
};

/**
 * `roots`, as far as `table` still lists them, and every process `table` lists
 * as descended from one of them.
 */
const treeOf = (
  table: readonly ProcessEntry[],
  roots: readonly ProcessEntry[],
): readonly ProcessEntry[] => {
  const listed = new Set(table.map(identityOf));

  const mut_found = new Map<string, ProcessEntry>();

  let mut_next: readonly ProcessEntry[] = roots.filter((p) =>
    listed.has(identityOf(p)),
  );

  while (Arr.isNonEmpty(mut_next)) {
    for (const p of mut_next) {
      mut_found.set(identityOf(p), p);
    }

    const parents = new Set(mut_next.map((p) => p.pid));

    mut_next = table.filter(
      (p) => parents.has(p.ppid) && !mut_found.has(identityOf(p)),
    );
  }

  return Array.from(mut_found.values());
};

const signalAll = (
  processIds: readonly number[],
  signal: NodeJS.Signals,
): void => {
  for (const pid of processIds) {
    try {
      process.kill(pid, signal);
    } catch {
      // It has already exited.
    }
  }
};

/**
 * Whether the shell has exited, or never started. The pid of one that has may
 * already be another process's.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a ChildProcess, which has no read-only form
const hasExited = (proc: ChildProcessWithoutNullStreams): boolean =>
  proc.pid === undefined || proc.exitCode !== null || proc.signalCode !== null;

/** The process ids of the `shells` that have not exited. */
const liveShellIds = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ChildProcesses, which have no read-only form
  shells: readonly ChildProcessWithoutNullStreams[],
): readonly number[] =>
  shells
    .filter((p) => !hasExited(p))
    .map((p) => p.pid)
    .filter(isNotUndefined);

/**
 * Whether the shell has exited and the script's output has closed. A shell that
 * never started has no output to close.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a ChildProcess, which has no read-only form
const isClosed = (proc: ChildProcessWithoutNullStreams): boolean =>
  hasExited(proc) &&
  (proc.pid === undefined || (proc.stdout.closed && proc.stderr.closed));

/**
 * Resolves once `done` returns `true`, read every {@link pollIntervalMs} and
 * once more at `deadline` (on the `performance.now()` clock, which a change of
 * the system time does not move), or once `deadline` has passed.
 */
const waitUntil = async (
  done: () => boolean | Promise<boolean>,
  deadline: number,
): Promise<void> => {
  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    if (await done()) {
      return;
    }

    const remainingMs = deadline - performance.now();

    if (remainingMs <= 0) {
      return;
    }

    // eslint-disable-next-line no-await-in-loop
    await sleep(Math.min(pollIntervalMs, remainingMs));
  }
};

/**
 * Stops the scripts the `shells` run and everything they started, and returns
 * once each has closed its output or is no longer waited for. Node spawned only
 * the shell; npm and the script are its descendants, which a signal to the
 * shell does not reach.
 *
 * The tree is the shells still running once the process table has been read and
 * that the read lists as this process's children, and every process under them
 * as that read lists them. Every process in it is sent `SIGTERM`, then, once
 * the grace period is over, `SIGKILL` if a fresh read of the table still lists
 * it, whether or not the script's output has closed. A process started
 * meanwhile gets its `SIGTERM` when a read during the grace period finds it;
 * one that only the last read finds gets `SIGKILL` straight after its
 * `SIGTERM`, or alone if that read is the one made after a failed read at the
 * deadline. If the table cannot be read at the start, every shell still running
 * gets `SIGTERM` and, at the deadline, `SIGKILL`, as no tree is known. If the
 * last read of the grace period and the one made after it both fail, only the
 * tree's shells still running get `SIGKILL`, as a process the table no longer
 * confirms may have exited and handed its pid to another, which must not be
 * killed. Either way a warning says that what the scripts started may be left
 * running. npm passes `SIGTERM` on to its own child as well, so that child may
 * receive it twice; stopping it is what matters here. On Windows each tree is
 * stopped with `taskkill /T /F` instead, for {@link taskkillTimeoutMs} at most;
 * where that fails or runs out of time, the shell is killed if it is still
 * running, and a warning says that what the scripts started may be left
 * running.
 *
 * The scripts stay in this process's group, so that what a terminal sends to it
 * (Ctrl-C, Ctrl-Z) and a signal sent to the whole group reach them as before; a
 * process group of their own would have made this a single `kill`, and kept
 * those from them. The tree is read from `ps`, so it misses what is no longer
 * under the shell: a process a script left running after its shell exited, or
 * one forked after the table was read by a parent that has exited since. Such a
 * process is left running, and once the grace periods are over the script's
 * output is closed from this end, so that a process still holding it open
 * cannot keep `executeParallel` from returning.
 */
const stopScripts = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ChildProcesses, whose output is closed here
  shells: readonly ChildProcessWithoutNullStreams[],
): Promise<void> => {
  if (process.platform === 'win32') {
    const failed = await Promise.all(
      shells.map(async (proc) => {
        if (hasExited(proc) || proc.pid === undefined) {
          return false;
        }

        // `taskkill` finds the shell by its pid, so a shell that exits and
        // hands its pid on before `taskkill` looks it up is the same window a
        // read of the process table has, and is left to chance as that is.
        const stopped = await runBounded(
          'taskkill',
          ['/pid', proc.pid.toString(), '/T', '/F'],
          taskkillTimeoutMs,
        );

        if (stopped !== undefined) {
          return false;
        }

        // Ends the shell at least, through its handle, while Node has not seen
        // it exit; its pid alone may have gone to another process since.
        if (!hasExited(proc)) {
          proc.kill('SIGKILL');
        }

        return true;
      }),
    );

    // `taskkill` also fails when a process exits while it walks the tree, and
    // one cut short by its time limit may have stopped some of the tree, so the
    // warning says only what may be the case.
    if (failed.includes(true)) {
      console.warn(
        'ts-repo-utils: `taskkill` failed or did not answer for some scripts, so what they started may be left running.',
      );
    }
  } else {
    const table = await readProcessTable(readTimeoutMs);

    // The shells still running once the table has been read. Node has not
    // reaped them, so, unless something other than Node reaped one, none has
    // handed its pid to another process, which one taken before the read might
    // have. What a shell that exited meanwhile left running is no longer under
    // a shell, and is left as such a process is.
    const shellIds = liveShellIds(shells);

    // The grace period starts with `SIGTERM`.
    const deadline = performance.now() + stopGracePeriodMs;

    if (table === undefined) {
      console.warn(
        'ts-repo-utils: `ps` could not list the processes, so only the shells running the scripts are signalled, and what the scripts started may be left running.',
      );

      signalAll(shellIds, 'SIGTERM');

      await waitUntil(() => shells.every(isClosed), deadline);

      signalAll(liveShellIds(shells), 'SIGKILL');
    } else {
      // Each shell must also be listed as this process's child. That narrows,
      // without closing, the case of a shell reaped by something other than
      // Node whose pid went to another process: a pid that went to another
      // child of this process passes, and where no table could be read at the
      // start the shells are signalled without this check. Every shell was
      // spawned before the read, as `shells` are the scripts already running,
      // and one still running that Node has not reaped is always listed as this
      // process's child, so one left out here was reaped outside Node, which
      // Node's child processes do not support, and it gets no signal.
      const roots = table.filter(
        (p) => shellIds.includes(p.pid) && p.ppid === process.pid,
      );

      const signalled = treeOf(table, roots);

      signalAll(
        signalled.map((p) => p.pid),
        'SIGTERM',
      );

      let mut_survivors: readonly ProcessEntry[] = signalled;

      // Whether the last read, the one at the deadline when the grace period
      // runs out, succeeded.
      let mut_lastReadSucceeded = true as boolean;

      await waitUntil(async () => {
        if (Arr.isNonEmpty(mut_survivors)) {
          const now = await readProcessTable(readTimeoutMs);

          mut_lastReadSucceeded = now !== undefined;

          // A table that could not be read leaves the survivors as they were.
          if (now !== undefined) {
            const known = new Set(mut_survivors.map(identityOf));

            mut_survivors = treeOf(now, mut_survivors);

            // What a survivor started since the last read that succeeded gets
            // its `SIGTERM` too.
            signalAll(
              mut_survivors
                .filter((p) => !known.has(identityOf(p)))
                .map((p) => p.pid),
              'SIGTERM',
            );
          }
        }

        return Arr.isEmpty(mut_survivors) && shells.every(isClosed);
      }, deadline);

      // Which survivors get `SIGKILL` is set out in `stopScripts`'s doc. A
      // process is known by its pid and its start to the second, so a pid
      // reused within that second, or between the read and the signal, is left
      // to chance.
      if (Arr.isNonEmpty(mut_survivors)) {
        const final = mut_lastReadSucceeded
          ? mut_survivors
          : await readProcessTable(readTimeoutMs).then((fresh) =>
              fresh === undefined ? undefined : treeOf(fresh, mut_survivors),
            );

        if (final === undefined) {
          console.warn(
            'ts-repo-utils: `ps` could not list the processes, so what the scripts started may be left running.',
          );
        }

        // Only the roots, as a shell left out of them got no `SIGTERM` either.
        signalAll(
          final === undefined
            ? liveShellIds(shells).filter((pid) =>
                roots.some((r) => r.pid === pid),
              )
            : final.map((p) => p.pid),
          'SIGKILL',
        );
      }
    }
  }

  await waitUntil(
    () => shells.every(isClosed),
    performance.now() + closeGracePeriodMs,
  );

  for (const proc of shells) {
    if (isClosed(proc)) {
      continue;
    }

    proc.stdout.destroy();

    proc.stderr.destroy();
  }
};

/**
 * Starts a npm script in a specific package directory.
 *
 * @param pkg - The package object containing path and metadata
 * @param scriptName - The name of the npm script to execute
 * @param options - Configuration options
 * @param options.prefix - Whether to prefix output with package name (default:
 *   true)
 * @returns The running script: a promise of its exit code or skipped flag,
 *   which fails if the script exits with another code than 0 or is killed by a
 *   signal, and the shell running it
 */
const executeScript = (
  pkg: Package,
  scriptName: string,
  { prefix = true }: Readonly<{ prefix?: boolean }> = {},
): RunningScript => {
  const packageJsonScripts =
    isRecord(pkg.packageJson) && isRecord(pkg.packageJson['scripts'])
      ? pkg.packageJson['scripts']
      : ({} as const);

  if (!hasKey(packageJsonScripts, scriptName)) {
    return {
      result: Promise.resolve(Result.ok({ skipped: true } as const)),
      proc: undefined,
      markStopped: () => {},
    };
  }

  const prefixStr = prefix ? (`[${pkg.name}] ` as const) : '';

  // Set by the executor below, which runs before `createPromise` returns. The
  // script is started in the executor so that a `spawn` that throws, or stdio
  // it could not set up, fails this script like any other failure, and
  // fail-fast stops the rest.
  let mut_proc: ChildProcessWithoutNullStreams | undefined = undefined as
    ChildProcessWithoutNullStreams | undefined;

  // Set by fail-fast. Whatever the script then ends with, killed, an exit code
  // or a spawn error, is not the failure fail-fast reports, so it is not
  // reported.
  let mut_stopped = false as boolean;

  const result = pipe(
    createPromise(
      (
        resolve: (
          value: Readonly<{ code?: number; skipped?: boolean }>,
        ) => void,
        reject: (reason: unknown) => void,
      ) => {
        // One command line rather than a command and an argument list: with
        // `shell: true` Node joins them unescaped anyway, and says so
        // (DEP0190). `scriptName` is not quoted, as it was not before: it is
        // the caller's own, and a command line is what lets it carry the
        // script's arguments (`test -- --coverage`).
        const proc = spawn(`npm run ${scriptName}`, {
          cwd: pkg.path,
          shell: true,
          stdio: 'pipe',
        });

        mut_proc = proc;

        proc.on('error', reject);

        proc.on(
          'close',
          (code: number | null, signal: NodeJS.Signals | null) => {
            if (DEBUG) {
              console.debug(
                `${pkg.name} process closed with code: ${code}, signal: ${signal}`,
              );
            }

            if (code === 0) {
              resolve({ code });
            } else {
              reject(
                new Error(
                  code === null
                    ? `${pkg.name} was killed by ${signal ?? 'a signal'}`
                    : `${pkg.name} exited with code ${code}`,
                ),
              );
            }
          },
        );

        // A shell that did not start may have no output streams; its failure
        // comes as 'error' instead.
        if (proc.pid === undefined) {
          return;
        }

        // A decoder per stream, so that a character split across two chunks is
        // not decoded as two halves.
        proc.stdout.setEncoding('utf8');

        proc.stderr.setEncoding('utf8');

        proc.stdout.on('data', (data: string) => {
          process.stdout.write(prefixStr + data);
        });

        proc.stderr.on('data', (data: string) => {
          process.stderr.write(prefixStr + data);
        });
      },
    ),
  ).map((promise) =>
    promise.then(
      Result.mapErr((err) => {
        const errorMessage: string = isError(err)
          ? err.message
          : isRecord(err) && hasKey(err, 'message')
            ? (err.message?.toString() ?? 'Unknown error message')
            : 'Unknown error';

        if (!mut_stopped) {
          console.error(`\nError in ${pkg.name}:`, errorMessage);
        }

        return isError(err) ? err : new Error(errorMessage);
      }),
    ),
  ).value;

  return {
    result,
    proc: mut_proc,
    markStopped: () => {
      mut_stopped = true;
    },
  };
};

/**
 * Performs a topological sort on packages based on their dependencies, ensuring
 * dependencies are ordered before their dependents.
 *
 * @param packages - Array of Package objects to sort
 * @returns An array of packages in dependency order (dependencies first)
 */
const topologicalSortPackages = (
  packages: readonly Package[],
  dependencyGraph: ReadonlyMap<string, readonly string[]>,
): readonly Package[] => {
  const mut_visited = new Set<string>();

  const mut_result: string[] = [];

  const packageMap = new Map(packages.map((p) => [p.name, p]));

  const visit = (pkgName: string): void => {
    if (mut_visited.has(pkgName)) {
      return;
    }

    mut_visited.add(pkgName);

    const deps = dependencyGraph.get(pkgName) ?? [];

    for (const dep of deps) {
      visit(dep);
    }

    mut_result.push(pkgName);
  };

  for (const pkg of packages) {
    visit(pkg.name);
  }

  return mut_result
    .map((pkgName) => packageMap.get(pkgName))
    .filter(isNotUndefined);
};

/**
 * Builds a dependency graph from the given packages, mapping each package name
 * to its internal workspace dependencies.
 *
 * @param packages - Array of Package objects to analyze
 * @returns A readonly map where keys are package names and values are arrays of
 *   their dependency package names
 */
const buildDependencyGraph = (
  packages: readonly Package[],
): ReadonlyMap<string, readonly string[]> => {
  const packageMap = new Map(packages.map((p) => [p.name, p]));

  const mut_graph = new Map<string, readonly string[]>();

  for (const pkg of packages) {
    const deps = Object.keys(pkg.dependencies).filter((depName) =>
      packageMap.has(depName),
    );

    mut_graph.set(pkg.name, deps);
  }

  return mut_graph;
};
