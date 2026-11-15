import {
  execFile,
  spawn,
  type ExecFileOptions,
  type PromiseWithChild,
  type SpawnOptions,
} from 'node:child_process';

/**
 * Runs `file` with `args`, without a shell, and resolves with how it ended.
 * Never rejects: a non-zero exit is a `status`, as it is for `spawnSync`, whose
 * result this has the shape of. `execFile` underneath, so the output is
 * buffered (`maxBuffer`) and nothing blocks while the process runs.
 *
 * `input` is written to the process's stdin, which is then closed; without it,
 * stdin is closed at once, so a process that reads it sees the end rather than
 * waiting for input that never comes.
 *
 * The scripts `node` runs before install (`scriptsRunBeforeInstall`) cannot
 * import this and write the same few lines themselves.
 */
export const runFile = (
  file: string,
  args: readonly string[],
  options: ExecFileOptions &
    Readonly<{ input?: string | Readonly<Uint8Array> }> = {},
): Promise<ProcessResult> =>
  new Promise((resolve) => {
    const { input, ...execFileOptions } = options;

    const child = execFile(
      file,
      args,
      { ...execFileOptions, encoding: 'utf8' },
      (error, stdout, stderr) => {
        if (error === null) {
          resolve({
            status: 0,
            signal: null,
            stdout,
            stderr,
            error: undefined,
          });

          return;
        }

        // A number is an exit code. Otherwise the process did not start, was
        // stopped by `timeout` (`killed`), or overran `maxBuffer`: `spawnSync`
        // reports those as `error` too. A signal from elsewhere is not one.
        const status = typeof error.code === 'number' ? error.code : null;

        // Typed as optional, but `null` when the process exited by itself.
        const signal = error.signal ?? null;

        const signalled = signal !== null && error.killed !== true;

        resolve({
          status,
          signal,
          stdout,
          stderr,
          error: status !== null || signalled ? undefined : error,
        });
      },
    );

    // A process that exits without reading its input closes the pipe under the
    // write; that is its business, as it is for `spawnSync`.
    child.stdin?.on('error', () => {});

    child.stdin?.end(input);
  });

/**
 * Closes the stdin of the process `util.promisify(execFile)` started and
 * returns the same promise. The promisified `execFile` leaves stdin an open
 * pipe, where `execFileSync` closed it at once: a process that reads it would
 * wait for input that never comes.
 */
export const closingStdin = <T,>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a ChildProcess, whose stdin is ended here
  running: PromiseWithChild<T>,
): PromiseWithChild<T> => {
  running.child.stdin?.end();

  return running;
};

/**
 * Runs `file` with `args`, without a shell, with the process's output going
 * straight to this one's (`stdio: 'inherit'` unless `stdio` says otherwise),
 * and resolves with how it ended. Never rejects. `spawn` underneath: what to
 * use where `spawnSync(…, { stdio: 'inherit' })` streamed a command's output,
 * which `execFile` only hands over once the process has exited.
 */
export const runInherited = (
  file: string,
  args: readonly string[],
  options: SpawnOptions = {},
): Promise<InheritedResult> =>
  new Promise((resolve) => {
    const child = spawn(file, args, { stdio: 'inherit', ...options });

    // `error` alone when the process could not be started; the first of the two
    // settles the promise.
    child.once('error', (error) => {
      resolve({ status: null, signal: null, error });
    });

    child.once('close', (status, signal) => {
      resolve({ status, signal, error: undefined });
    });
  });

/**
 * What went wrong with a process {@link runFile} or {@link runInherited} ran,
 * for a message that follows "failed: ": the error when it did not start (or
 * timed out, or overran `maxBuffer`), else the signal that stopped it, else its
 * exit status with the `stderr` it wrote, trimmed, when there is any. Never
 * empty, as `stderr` alone is for a process that wrote nothing.
 */
export const describeFailure = (
  result: Readonly<{
    status: InheritedResult['status'];
    signal: InheritedResult['signal'];
    error: Readonly<{ message: string }> | undefined;
    stderr?: string;
  }>,
): string => {
  if (result.error !== undefined) {
    return result.error.message;
  }

  if (result.signal !== null) {
    return `killed by ${result.signal}`;
  }

  const stderr = result.stderr?.trim() ?? '';

  return stderr === ''
    ? `exited with ${result.status ?? 'no status'}`
    : `exited with ${result.status ?? 'no status'}: ${stderr}`;
};

export type ProcessResult = InheritedResult &
  Readonly<{
    stdout: string;
    stderr: string;
  }>;

export type InheritedResult = Readonly<{
  /** The exit code, or `null` when the process did not exit by itself. */
  status: number | null;
  signal: NodeJS.Signals | null;
  /** Set when the process did not start, timed out or overran `maxBuffer`. */
  error: Error | undefined;
}>;
