import { spawnSync } from 'node:child_process';
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
}>;

/**
 * Type-checks the project with the native compiler, no emit. The locked
 * options are already verified at this point (languages/sumi/docs/spec/compiler-options.md),
 * so these diagnostics are the language's.
 */
export const typeCheck = (tsconfigPath: string): TypeCheckResult => {
  const result = spawnSync(
    process.execPath,
    [nativeTscPath, '-p', tsconfigPath, '--noEmit', '--pretty', 'false'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );

  const output = `${result.stdout}${result.stderr}` as const;

  return {
    diagnostics: parseDiagnostics(
      output,
      path.dirname(path.resolve(tsconfigPath)),
    ),
    output,
  };
};

/**
 * `src/a.mts(3,7): error TS2322: Type 'string' is not ...` — a diagnostic
 * with a location — or `error TS5083: Cannot read file ...` without one.
 * Continuation lines of a multi-line message carry no `error TS` marker and
 * are skipped (the caller prints the compiler's own text in full).
 */
const parseDiagnostics = (
  output: string,
  projectDir: string,
): readonly TypeCheckDiagnostic[] =>
  output.split('\n').flatMap((text) => {
    const diagnostic = parseDiagnosticLine(text, projectDir);

    return diagnostic === undefined ? [] : [diagnostic];
  });

const parseDiagnosticLine = (
  text: string,
  projectDir: string,
): TypeCheckDiagnostic | undefined => {
  const marker = 'error TS';

  const markerAt = text.indexOf(marker);

  if (markerAt === -1) return undefined;

  const head = text.slice(0, markerAt);

  const rest = text.slice(markerAt + 'error '.length);

  const codeEnd = rest.indexOf(': ');

  if (codeEnd === -1) return undefined;

  const code = rest.slice(0, codeEnd);

  const message = rest.slice(codeEnd + 2);

  if (head === '') {
    return { filename: '', line: 0, code, message };
  }

  // `<file>(<line>,<column>): `
  if (!head.endsWith('): ')) return undefined;

  const open = head.lastIndexOf('(');

  if (open === -1) return undefined;

  const lineText = head.slice(open + 1, -3).split(',', 1)[0] ?? '0';

  return {
    filename: path.resolve(projectDir, head.slice(0, open)),
    line: Number.parseInt(lineText, 10),
    code,
    message,
  };
};
