import * as path from 'node:path';
import { Result, unknownToString } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import {
  type SourceFile,
  type Node as TsNode,
} from 'typescript-native/unstable/ast';
import { API, type Checker } from 'typescript-native/unstable/sync';
import { type CheckerDiagnostic, type Rule } from './types.mjs';

/**
 * Runs every rule over one project, in one pass.
 *
 * Doing this on TypeScript 7's own API rather than through a linter is what
 * makes the program the rules see the same program `sumi check` type-checks
 * with — same compiler, same version, same `tsconfig` — and lets one walk
 * serve every rule. Measured on synstate (76 files, 804 declaration names
 * queried): 66 ms to open the project, 18 ms to walk it, 164 ms of checker
 * queries, 262 ms in total.
 *
 * @param tsconfigPath Absolute path to the project's tsconfig.
 * @param rules The rules to run. Each node is offered to all of them before
 *   the walk descends, so the cost of a rule is its own work, not another
 *   traversal.
 * @param isTarget Which of the program's files to walk. Defaults to every
 *   file the project owns that is not a declaration file.
 */
export const runRules = (
  tsconfigPath: string,
  rules: readonly Rule[],
  isTarget?: (fileName: string) => boolean,
): Result<readonly CheckerDiagnostic[], string> => {
  const api = new API({ cwd: path.dirname(tsconfigPath) });

  const projectResult = Result.fromThrowable(() =>
    api
      .updateSnapshot({ openProjects: [tsconfigPath] })
      .getProjects()
      .at(0),
  );

  if (Result.isErr(projectResult)) {
    api.close();

    return Result.err(
      `Failed to open ${tsconfigPath}: ${unknownToString(projectResult.value)}`,
    );
  }

  const project = projectResult.value;

  if (project === undefined) {
    api.close();

    return Result.err(`No project was opened for ${tsconfigPath}.`);
  }

  const { program, checker } = project;

  const mut_diagnostics: CheckerDiagnostic[] = [];

  const walked = Result.fromThrowable(() => {
    for (const fileName of program.getSourceFileNames()) {
      if (isTarget !== undefined && !isTarget(fileName)) continue;

      const sourceFile = program.getSourceFile(fileName);

      if (sourceFile === undefined || sourceFile.isDeclarationFile) continue;

      walkFile(sourceFile, rules, checker, mut_diagnostics);
    }
  });

  api.close();

  return Result.isErr(walked)
    ? Result.err(`Checker rules failed: ${unknownToString(walked.value)}`)
    : Result.ok(mut_diagnostics);
};

/** One traversal of one file, offering each node to every rule. */
const walkFile = (
  // `SourceFile` and `Checker` are TypeScript's own interfaces, declared
  // mutable; this package does not get to restate them.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: SourceFile,
  rules: readonly Rule[],
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,
  // The accumulator every rule reports into: one array for the whole run, so
  // a rule's `report` costs a push rather than a copy.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_diagnostics: CheckerDiagnostic[],
): void => {
  // One context per rule, built once per file: `report` closes over the rule's
  // own ID so a rule cannot report under another's.
  const contexts = rules.map((rule) => ({
    rule,
    context: {
      checker,
      sourceFile,
      report: (
        node: TsNode,
        messageId: string,
        data?: ReadonlyRecord<string, string>,
      ): void => {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(sourceFile),
        );

        mut_diagnostics.push({
          ruleId: rule.ruleId,
          messageId,
          fileName: sourceFile.fileName,
          line: line + 1,
          column: character + 1,
          message: fillMessage(rule.messages[messageId] ?? messageId, data),
        });
      },
    },
  }));

  const visit = (node: TsNode): void => {
    for (const { rule, context } of contexts) {
      rule.visit(node, context);
    }

    node.forEachChild(visit);
  };

  sourceFile.forEachChild(visit);
};

/**
 * Replaces each `{{name}}` with `data[name]`, leaving unknown names as they
 * are. Split and joined rather than replaced, because a replacement value is
 * data and `$&` in it must not be read as a capture reference.
 */
const fillMessage = (
  template: string,
  data: ReadonlyRecord<string, string> | undefined,
): string =>
  data === undefined
    ? template
    : Object.entries(data).reduce(
        (message, [name, value]) => message.split(`{{${name}}}`).join(value),
        template,
      );
