import { runOxlint, type OxlintDiagnostic } from '@sumi-lang/oxlint-config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { showConfig } from './show-config.mjs';
import { typeCheck, type TypeCheckDiagnostic } from './type-check.mjs';
import {
  validateCompilerOptions,
  type CompilerOptionViolation,
} from './validate-compiler-options.mjs';

/**
 * The outcome of `sumi check` for the lint tier (D-46): the three steps in
 * order, each recorded so the caller can print them.
 *
 * - `config-violation`: the effective compilerOptions differ from the locked
 *   entries. Nothing else ran — a check under overridden options is not the
 *   language's check (D-7 / D-40).
 * - `checked`: the type check and the lint ran; `ok` is whether both were clean.
 */
export type CheckResult = Readonly<
  | {
      kind: 'config-violation';
      tsconfigPath: string;
      violations: readonly CompilerOptionViolation[];
    }
  | {
      kind: 'checked';
      tsconfigPath: string;
      ok: boolean;
      fileCount: number;
      typeCheck: Readonly<{
        diagnostics: readonly TypeCheckDiagnostic[];
        output: string;
      }>;
      lint: Readonly<{
        diagnostics: readonly OxlintDiagnostic[];
        stderr: string;
      }>;
    }
>;

/**
 * Runs the whole Sumi lint check for one project: locked compilerOptions
 * validation, then the native type check, then the oxlint preset over
 * exactly the files the project's program contains (so the two never
 * disagree about what is in scope).
 *
 * `project` is a tsconfig path or a directory holding `tsconfig.json`.
 */
export const runCheck = (project: string): Result<CheckResult, string> => {
  const tsconfigPath = resolveTsconfigPath(project);

  if (Result.isErr(tsconfigPath)) return tsconfigPath;

  const config = showConfig(tsconfigPath.value);

  if (Result.isErr(config)) return config;

  const violations = validateCompilerOptions(config.value.compilerOptions);

  if (violations.length > 0) {
    return Result.ok({
      kind: 'config-violation',
      tsconfigPath: tsconfigPath.value,
      violations,
    });
  }

  const typeCheckResult = typeCheck(tsconfigPath.value);

  const lintResult =
    config.value.files.length === 0
      ? ({ diagnostics: [], stderr: '' } as const)
      : runOxlint(config.value.files);

  return Result.ok({
    kind: 'checked',
    tsconfigPath: tsconfigPath.value,
    ok:
      typeCheckResult.diagnostics.length === 0 &&
      lintResult.diagnostics.length === 0,
    fileCount: config.value.files.length,
    typeCheck: typeCheckResult,
    lint: lintResult,
  });
};

const resolveTsconfigPath = (project: string): Result<string, string> => {
  const absolute = path.resolve(project);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(absolute)) {
    return Result.err(`No such file or directory: ${absolute}`);
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const tsconfigPath = fs.statSync(absolute).isDirectory()
    ? path.join(absolute, 'tsconfig.json')
    : absolute;

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.existsSync(tsconfigPath)
    ? Result.ok(tsconfigPath)
    : Result.err(`No tsconfig.json in ${absolute}`);
};
