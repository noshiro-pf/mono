import { execFile } from 'node:child_process';
import * as path from 'node:path';
import { nativeTscPath } from './native-tsc.mjs';

/** One diagnostic of the native compiler, as `tsc --pretty false` prints it. */
export type TypeCheckDiagnostic = Readonly<{
  /** Absolute; empty for a diagnostic with no location (a config error). */
  filename: string;
  /** 1-based; 0 when the diagnostic has no location. */
  line: number;
  /** `TS<n>`. */
  code: string;
  message: string;
}>;

export type TypeCheckResult = Readonly<{
  diagnostics: readonly TypeCheckDiagnostic[];
  /** The compiler's own text, for printing as is. */
  output: string;

  /**
   * Set when the compiler did not finish normally — it could not be started,
   * its output overran the buffer, it was killed by a signal, or it exited
   * non-zero without printing a diagnostic (a crash). The type check then says
   * nothing about the project, and `diagnostics` being empty must not read as
   * clean.
   */
  failure: string | undefined;
}>;

/**
 * Type-checks the project with the native compiler, no emit. The locked
 * options are already verified at this point (languages/sumi/docs/spec/compiler-options.md),
 * so these diagnostics are the language's.
 */
export const typeCheck = async (
  tsconfigPath: string,
  /** The compiler script run with this Node.js; replaced only by tests. */
  compilerPath: string = nativeTscPath,
): Promise<TypeCheckResult> => {
  const result = await runCompiler([
    compilerPath,
    '-p',
    tsconfigPath,
    '--noEmit',
    '--pretty',
    'false',
  ]);

  const output = `${result.stdout}${result.stderr}` as const;

  // The compiler prints each file relative to its working directory — this
  // process's, which is also what makes the printed output usable from the
  // terminal it ran in. Resolved against the project directory instead, every
  // filename came out wrong but its basename.
  const diagnostics = parseDiagnostics(output, process.cwd());

  return {
    diagnostics,
    output,
    failure: describeFailure(
      {
        errorMessage: result.errorMessage,
        signal: result.signal,
        status: result.status,
      },
      diagnostics.length > 0,
    ),
  };
};

/**
 * Runs `args` with this Node.js and resolves with how it ended, never
 * rejecting. An exit code is a `status`; a process that did not start, or that
 * overran `maxBuffer` (killed for it), has an `errorMessage`; one killed from
 * elsewhere has a `signal`.
 */
const runCompiler = (
  args: readonly string[],
): Promise<
  Readonly<{
    status: number | null;
    signal: string | null;
    errorMessage: string | undefined;
    stdout: string;
    stderr: string;
  }>
> =>
  new Promise((resolve) => {
    const child = execFile(
      process.execPath,
      args,
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
      (error, stdout, stderr) => {
        const exited = error !== null && typeof error.code === 'number';

        // Typed as optional, but `null` when the process exited by itself.
        const signal = error?.signal ?? null;

        const signalled = signal !== null && error?.killed !== true;

        resolve({
          status:
            error === null
              ? 0
              : typeof error.code === 'number'
                ? error.code
                : null,
          signal: signalled ? signal : null,
          errorMessage:
            error === null || exited || signalled ? undefined : error.message,
          stdout,
          stderr,
        });
      },
    );

    child.stdin?.end();
  });

/**
 * The compiler exits non-zero when it reports a diagnostic — 1 for most, 2 for
 * some config errors (a missing `files` entry) — so a non-zero status is a
 * failure only when nothing was parsed. A crash after some diagnostics is not
 * told apart by its status (a Go panic also exits 2).
 */
const describeFailure = (
  result: Readonly<{
    errorMessage: string | undefined;
    signal: string | null;
    status: number | null;
  }>,
  hasDiagnostics: boolean,
): string | undefined =>
  result.errorMessage !== undefined
    ? (`the native compiler did not run to completion: ${result.errorMessage}` as const)
    : result.signal !== null
      ? (`the native compiler was killed by ${result.signal}` as const)
      : !hasDiagnostics && result.status !== 0
        ? (`the native compiler exited with status ${result.status ?? 'null'} and reported no diagnostic` as const)
        : undefined;

const parseDiagnosticLine = (
  text: string,
  workingDir: string,
): TypeCheckDiagnostic | undefined => {
  const marker = 'error TS';

  const markerAt = text.indexOf(marker);

  if (markerAt === -1) {
    return undefined;
  }

  const head = text.slice(0, markerAt);

  const rest = text.slice(markerAt + 'error '.length);

  const codeEnd = rest.indexOf(': ');

  if (codeEnd === -1) {
    return undefined;
  }

  const code = rest.slice(0, codeEnd);

  const message = rest.slice(codeEnd + 2);

  if (head === '') {
    return { filename: '', line: 0, code, message };
  }

  // `<file>(<line>,<column>): `
  if (!head.endsWith('): ')) {
    return undefined;
  }

  const open = head.lastIndexOf('(');

  if (open === -1) {
    return undefined;
  }

  const lineText = head.slice(open + 1, -3).split(',', 1)[0] ?? '0';

  return {
    filename: path.resolve(workingDir, head.slice(0, open)),
    line: Number.parseInt(lineText, 10),
    code,
    message,
  };
};

/**
 * `src/a.mts(3,7): error TS2322: Type 'string' is not ...` — a diagnostic with
 * a location — or `error TS5083: Cannot read file ...` without one.
 * Continuation lines of a multi-line message carry no `error TS` marker and are
 * skipped (the caller prints the compiler's own text in full).
 */
const parseDiagnostics = (
  output: string,
  workingDir: string,
): readonly TypeCheckDiagnostic[] =>
  output.split('\n').flatMap((text) => {
    const diagnostic = parseDiagnosticLine(text, workingDir);

    return diagnostic === undefined ? [] : [diagnostic];
  });
