import { execFile } from 'node:child_process';

/** How a Node.js script run by {@link runNodeScript} ended. */
export type NodeScriptRun = Readonly<{
  stdout: string;
  stderr: string;
  /** The exit status; `null` when the script did not exit by itself. */
  status: number | null;
  /**
   * Set when the script did not finish: it could not be started, its output
   * overran the buffer (it is killed for that), or a signal killed it. What a
   * non-zero `status` means is the caller's to say, since the compiler and
   * oxlint exit non-zero when they report, and `--showConfig` should not.
   */
  failure: string | undefined;
}>;

/**
 * Runs `args` with this Node.js (`args[0]` is the script) and resolves with how
 * it ended, never rejecting. The child's stdin is closed at once, as a
 * synchronous run closes it: a script that reads it would otherwise wait for
 * input that never comes. `what` names the script in `failure`.
 *
 * The one place the Sumi packages start a Node.js script, so that every step
 * decides alike whether it finished (#3211).
 */
export const runNodeScript = (
  args: readonly string[],
  what: string,
  options: Readonly<{ cwd?: string }> = {},
): Promise<NodeScriptRun> =>
  new Promise((resolve) => {
    const child = execFile(
      process.execPath,
      args,
      {
        ...(options.cwd === undefined ? {} : { cwd: options.cwd }),
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const exited = error !== null && typeof error.code === 'number';

        // Typed as optional, but `null` when the process exited by itself.
        const signal = error?.signal ?? null;

        // A child killed for overrunning `maxBuffer` is `killed`, and is a run
        // that did not complete rather than one a signal stopped.
        const signalled = signal !== null && error?.killed !== true;

        resolve({
          stdout,
          stderr,
          status:
            error === null
              ? 0
              : typeof error.code === 'number'
                ? error.code
                : null,
          failure:
            error === null || exited
              ? undefined
              : signalled
                ? (`${what} was killed by ${signal}` as const)
                : (`${what} did not run to completion: ${error.message}` as const),
        });
      },
    );

    child.stdin?.end();
  });
