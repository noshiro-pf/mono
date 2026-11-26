import { hasKey, isRecord, Json, Result } from 'ts-data-forge';
import type { UnknownRecord } from 'ts-type-forge';
import {
  oxlintBinPath,
  oxlintConfigPath,
  packageRootPath,
} from './oxlint-paths.mjs';
import { runNodeScript } from './run-node-script.mjs';

/** One diagnostic as `oxlint -f json` reports it (the fields Sumi reads). */
export type OxlintDiagnostic = Readonly<{
  /** `<plugin>(<rule>)`, e.g. `eslint(no-var)`, `sumi(no-class)`. */
  code: string;
  message: string;
  severity: string;
  /** Absolute when the file was given by an absolute path. */
  filename: string;
  /** 1-based line of the first label, 0 when the diagnostic has no label. */
  line: number;
}>;

export type OxlintRunResult = Readonly<{
  diagnostics: readonly OxlintDiagnostic[];
  /** Non-JSON output (stderr), for surfacing loader / tsgolint failures. */
  stderr: string;
  /**
   * Set when oxlint did not finish — it could not be started, overran the
   * buffer or was killed by a signal — or printed no JSON report to read. The
   * lint run then says nothing about the files, and `diagnostics` being empty
   * must not read as clean.
   */
  failure: string | undefined;
}>;

/**
 * Runs the Sumi lint configuration over `files` and returns the diagnostics.
 *
 * oxlint runs with this package as cwd so that `jsPlugins` (the built sumi
 * plugin) and `oxlint-tsgolint` (type-aware rules) resolve; each file's
 * tsconfig is discovered by oxlint per file, so callers only pass paths.
 */
export const runOxlint = async (
  files: readonly string[],
  /** The oxlint script run with this Node.js; replaced only by tests. */
  binPath: string = oxlintBinPath,
): Promise<OxlintRunResult> => {
  // oxlint exits non-zero when it reports something, so the exit status is not
  // read: the diagnostics are on stdout either way. A run that did not finish
  // is a failure even if it printed a complete report first.
  const run = await runNodeScript(
    [binPath, '-c', oxlintConfigPath, '-f', 'json', '--type-aware', ...files],
    'oxlint',
    { cwd: packageRootPath },
  );

  if (run.failure !== undefined) {
    return { diagnostics: [], stderr: run.stderr, failure: run.failure };
  }

  const parsed = parseDiagnostics(run.stdout, run.stderr);

  return Result.isOk(parsed)
    ? { diagnostics: parsed.value, stderr: run.stderr, failure: undefined }
    : { diagnostics: [], stderr: run.stderr, failure: parsed.value };
};

const readString = (record: UnknownRecord, key: string): string => {
  const value = hasKey(record, key) ? record[key] : undefined;

  return typeof value === 'string' ? value : '';
};

const toDiagnostic = (raw: unknown): OxlintDiagnostic => {
  const record = isRecord(raw) ? raw : ({} as const);

  const labels = hasKey(record, 'labels') ? record.labels : undefined;

  const firstLabel: unknown = Array.isArray(labels) ? labels[0] : undefined;

  const span =
    isRecord(firstLabel) && hasKey(firstLabel, 'span')
      ? firstLabel.span
      : undefined;

  const line = isRecord(span) && hasKey(span, 'line') ? span.line : undefined;

  return {
    code: readString(record, 'code'),
    message: readString(record, 'message'),
    severity: readString(record, 'severity'),
    filename: readString(record, 'filename'),
    line: typeof line === 'number' ? line : 0,
  };
};

const parseDiagnostics = (
  stdout: string,
  stderr: string,
): Result<readonly OxlintDiagnostic[], string> => {
  const start = stdout.indexOf('{');

  if (start === -1) {
    return Result.err(
      `oxlint produced no JSON output.\nstdout:\n${stdout}\nstderr:\n${stderr}`,
    );
  }

  const parsed = Json.parse(stdout.slice(start));

  if (
    Result.isErr(parsed) ||
    !isRecord(parsed.value) ||
    !hasKey(parsed.value, 'diagnostics') ||
    !Array.isArray(parsed.value.diagnostics)
  ) {
    return Result.err('oxlint JSON output has no `diagnostics` array');
  }

  return Result.ok(parsed.value.diagnostics.map(toDiagnostic));
};
