import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import * as ts from 'typescript';
import { projectRootPath } from '../../project-root-path.mjs';

/**
 * What the root program reads — the program the root `tsconfig.json` describes,
 * which `check:root:types` checks and `check:root:lint` and `check:root:test`
 * read — for `check-changed` to plan those checks for a member file it reaches
 * by a relative import (`tools/configs/oxlint-rules.mts` importing from
 * `libs/eslint-config-typed/src/`), which no path pattern names.
 */

/**
 * The changed files the root program reads, of `changedFiles`
 * (repository-relative). The program is built only when one of them is a module
 * or JSON, which is all it can read.
 */
export const readRootProgramReads = (
  changedFiles: readonly string[],
): Result<ReadonlySet<string>, string> => {
  const candidates = changedFiles.filter((file) => PROGRAM_FILE.test(file));

  if (Arr.isEmpty(candidates)) {
    return Result.ok(new Set<string>());
  }

  return Result.map(rootProgram(), (program) => {
    const reach = programReach(program);

    return new Set<string>(candidates.filter((file) => reach.has(file)));
  });
};

/**
 * The program `configPath` describes, as `tsc -p` builds it. An error for a
 * configuration it cannot read, reads with an error, or whose options
 * TypeScript rejects: each would leave the program short.
 */
export const rootProgram = (
  configPath: string = path.join(projectRootPath, 'tsconfig.json'),
): Result<ts.Program, string> =>
  Result.flatMap(
    Result.mapErr(
      Result.fromThrowable(() =>
        ts.getParsedCommandLineOfConfigFile(
          configPath,
          {},
          {
            ...ts.sys,
            onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
              throw new Error(ts.formatDiagnostics([diagnostic], formatHost));
            },
          },
        ),
      ),
      unknownToString,
    ),
    (parsed): Result<ts.Program, string> => {
      if (parsed === undefined) {
        return Result.err(`${configPath} could not be read`);
      }

      const configErrors = ts.formatDiagnostics(parsed.errors, formatHost);

      if (configErrors !== '') {
        return Result.err(configErrors);
      }

      const program = ts.createProgram({
        rootNames: parsed.fileNames,
        options: { ...parsed.options, noEmit: true },
        projectReferences: parsed.projectReferences,
      });

      const optionErrors = ts.formatDiagnostics(
        program.getOptionsDiagnostics(),
        formatHost,
      );

      return optionErrors === ''
        ? Result.ok(program)
        : Result.err(optionErrors);
    },
  );

/**
 * The files under `root` that `program` reads, relative to it: every source
 * file outside `node_modules`, and for a relative import that does not resolve
 * — a module the diff deletes, most often, which the program still fails on —
 * its path and the source's that a `.mjs` specifier maps to. Only import and
 * export declarations are read for that: a deleted module named by `import()`,
 * `import x = require()` or a `/// <reference path>` is not in the reach,
 * though one that is there is among the source files.
 */
export const programReach = (
  program: ts.Program,
  root: string = projectRootPath,
): ReadonlySet<string> => {
  const options = program.getCompilerOptions();

  const mut_reach = new Set<string>();

  const add = (fileName: string): void => {
    const relative = path.relative(root, fileName).split(path.sep).join('/');

    if (
      !relative.startsWith('..') &&
      !path.isAbsolute(relative) &&
      !relative.split('/').includes('node_modules')
    ) {
      mut_reach.add(relative);
    }
  };

  for (const source of program.getSourceFiles()) {
    add(source.fileName);

    for (const statement of source.statements) {
      if (
        !(
          ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)
        ) ||
        statement.moduleSpecifier === undefined ||
        !ts.isStringLiteral(statement.moduleSpecifier) ||
        !statement.moduleSpecifier.text.startsWith('.')
      ) {
        continue;
      }

      const { moduleSpecifier } = statement;

      const resolved = ts.resolveModuleName(
        moduleSpecifier.text,
        source.fileName,
        options,
        ts.sys,
        undefined,
        undefined,
        ts.getModeForUsageLocation(source, moduleSpecifier, options),
      ).resolvedModule;

      if (resolved !== undefined) {
        continue;
      }

      const missing = path.resolve(
        path.dirname(source.fileName),
        moduleSpecifier.text,
      );

      add(missing);

      add(missing.replace(/\.([cm]?)js$/u, '.$1ts'));
    }
  }

  return mut_reach;
};

/** What a program can read: a module, a declaration, or JSON. */
const PROGRAM_FILE = /\.(?:[cm]?[jt]sx?|json)$/u;

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: () => projectRootPath,
  getNewLine: () => '\n',
} as const;
