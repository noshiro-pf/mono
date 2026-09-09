import { allRules, runRules, type CheckerDiagnostic } from '@sumi-lang/checker';
import { runOxlint, type OxlintDiagnostic } from '@sumi-lang/oxlint-config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { applyExpectErrors, type UnusedExpectError } from './expect-error.mjs';
import { showConfig } from './show-config.mjs';
import { typeCheck, type TypeCheckDiagnostic } from './type-check.mjs';
import {
  validateCompilerOptions,
  type CompilerOptionViolation,
} from './validate-compiler-options.mjs';

/**
 * The outcome of `sumi check` for the lint tier (D-46): the four steps in
 * order, each recorded so the caller can print them.
 *
 * - `config-violation`: the effective compilerOptions differ from the locked
 *   entries. Nothing else ran — a check under overridden options is not the
 *   language's check (D-7 / D-40).
 * - `checked`: the type check, the oxlint preset and the type-aware checker
 *   ran; `ok` is whether all three were clean and no `@sumi-expect-error` was
 *   left unanswered.
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
        /** After `@sumi-expect-error` suppression. */
        diagnostics: readonly OxlintDiagnostic[];
        stderr: string;
      }>;
      checker: Readonly<{
        /** After `@sumi-expect-error` suppression. */
        diagnostics: readonly CheckerDiagnostic[];

        /** Set when the checker could not open the project at all. */
        error: string | undefined;
      }>;

      /**
       * Markers that named a diagnostic which did not appear. A failure in
       * its own right — the directive is an assertion, not a mute button.
       */
      unusedExpectErrors: readonly UnusedExpectError[];
    }
>;

/**
 * Runs the whole Sumi lint check for one project: locked compilerOptions
 * validation, then the native type check, then the oxlint preset over exactly
 * the files the project's program contains (so the two never disagree about
 * what is in scope), then the type-aware checker (D-54) over the same
 * project.
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

  // The checker opens the same tsconfig, so it sees the same program the type
  // check just ran on; `files` is passed only to keep the two from disagreeing
  // about scope when the project pulls in something outside its own roots.
  const projectFiles: ReadonlySet<string> = new Set(config.value.files);

  const checkerResult =
    config.value.files.length === 0
      ? Result.ok<readonly CheckerDiagnostic[]>([])
      : runRules(tsconfigPath.value, allRules, (fileName) =>
          projectFiles.has(fileName),
        );

  const checkerDiagnostics = Result.isOk(checkerResult)
    ? checkerResult.value
    : ([] as const);

  // Both engines at once, because a neutral rule ID is the whole of what a
  // marker says and which engine answered it is not part of that (D-51; the
  // corpus merges the two lists for the same reason). Applying the markers to
  // one engine at a time would report every marker the other engine answered
  // as unused.
  const expectErrors = applyExpectErrors(
    config.value.files,
    lintResult.diagnostics,
    checkerDiagnostics,
  );

  return Result.ok({
    kind: 'checked',
    tsconfigPath: tsconfigPath.value,
    ok:
      typeCheckResult.diagnostics.length === 0 &&
      expectErrors.lint.length === 0 &&
      expectErrors.checker.length === 0 &&
      expectErrors.unused.length === 0 &&
      Result.isOk(checkerResult),
    fileCount: config.value.files.length,
    typeCheck: typeCheckResult,
    lint: { diagnostics: expectErrors.lint, stderr: lintResult.stderr },
    checker: {
      diagnostics: expectErrors.checker,
      error: Result.isErr(checkerResult) ? checkerResult.value : undefined,
    },
    unusedExpectErrors: expectErrors.unused,
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
