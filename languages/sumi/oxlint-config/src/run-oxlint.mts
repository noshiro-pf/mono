import { spawnSync } from 'node:child_process';
import { hasKey, isRecord } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';
import {
  oxlintBinPath,
  oxlintConfigPath,
  packageRootPath,
} from './oxlint-paths.mjs';

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
}>;

/**
 * Runs the Sumi lint configuration over `files` and returns the diagnostics.
 *
 * oxlint runs with this package as cwd so that `jsPlugins` (the built sumi
 * plugin) and `oxlint-tsgolint` (type-aware rules) resolve; each file's
 * tsconfig is discovered by oxlint per file, so callers only pass paths.
 */
export const runOxlint = (files: readonly string[]): OxlintRunResult => {
  const result = spawnSync(
    process.execPath,
    [
      oxlintBinPath,
      '-c',
      oxlintConfigPath,
      '-f',
      'json',
      '--type-aware',
      ...files,
    ],
    {
      cwd: packageRootPath,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    },
  );

  return {
    diagnostics: parseDiagnostics(result.stdout, result.stderr),
    stderr: result.stderr,
  };
};

const parseDiagnostics = (
  stdout: string,
  stderr: string,
): readonly OxlintDiagnostic[] => {
  const start = stdout.indexOf('{');

  if (start === -1) {
    throw new Error(
      `oxlint produced no JSON output.\nstdout:\n${stdout}\nstderr:\n${stderr}`,
    );
  }

  const parsed: unknown = JSON.parse(stdout.slice(start));

  if (
    !isRecord(parsed) ||
    !hasKey(parsed, 'diagnostics') ||
    !Array.isArray(parsed.diagnostics)
  ) {
    throw new Error('oxlint JSON output has no `diagnostics` array');
  }

  return parsed.diagnostics.map(toDiagnostic);
};

const readString = (record: UnknownRecord, key: string): string => {
  const value = hasKey(record, key) ? record[key] : undefined;

  return typeof value === 'string' ? value : '';
};

const toDiagnostic = (raw: unknown): OxlintDiagnostic => {
  const record = isRecord(raw) ? raw : {};

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
