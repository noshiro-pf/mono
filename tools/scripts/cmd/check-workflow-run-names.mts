import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a `workflow_run:` trigger names a workflow that does not exist.
 *
 * `workflow_run` matches on the `name:` of another workflow — a string, in a
 * second file, with nothing joining the two. Rename the workflow and the
 * trigger does not error, does not warn and does not fire: it simply never
 * matches again, and the only symptom is a workflow that has quietly stopped
 * running. `pr-report.yml` names seven, which is how the report learns that a
 * check finished; left stale, the report would go back to being as old as the
 * last pull request event with nothing to say so.
 *
 * Only the direction a script can decide. Whether every workflow that *should*
 * be listed is listed is a question about intent — `pr-report.yml` says in
 * prose that its list is the workflows behind the required contexts — and this
 * checks the half that is mechanical: every name written here resolves to a
 * workflow in this repository.
 */
export const checkWorkflowRunNames = (): Promise<
  Result<CheckSummary, string>
> =>
  Result.safeTry(async function* () {
    const workflowPaths = yield* Result.safeUnwrap(await collectWorkflows());

    const workflows = yield* Result.safeUnwrap(
      await readWorkflows(workflowPaths),
    );

    const defined = new Set(
      workflows.flatMap(({ name }) => (name === undefined ? [] : [name])),
    );

    const references = workflows.flatMap(({ relativePath, watched }) =>
      watched.map((name) => ({ relativePath, name })),
    );

    const violations = references.flatMap(({ relativePath, name }) =>
      defined.has(name)
        ? []
        : [
            [
              `${relativePath}: \`workflow_run\` names "${name}", which is not`,
              'the `name:` of any workflow in .github/workflows/. A trigger',
              'that matches nothing never fires and never says so.',
            ].join(' '),
          ],
    );

    return Arr.isNonEmpty(violations)
      ? Result.err(
          [
            `❌ ${violations.length} \`workflow_run\` reference(s) name no workflow:`,
            '',
            ...violations.map((violation) => `  ${violation}`),
            '',
            'The names are matched against the `name:` of another workflow.',
            `Those defined here are: ${Array.from(defined).toSorted().join(', ')}.`,
          ].join('\n'),
        )
      : Result.ok({
          workflows: workflows.length,
          references: references.length,
        });
  });

/**
 * A workflow's own `name:` and the workflows its `workflow_run:` trigger
 * watches, read with a line scanner rather than a YAML parser — as
 * `check-workflow-event-name.mts` reads the same directory, and for the same
 * reason: both sit at a fixed depth in a file whose shape is stable.
 */
export const parseWorkflowRunNames = (workflowFile: string): ParsedWorkflow => {
  const lines = workflowFile.split('\n');

  return {
    name: readName(lines),
    watched: readWatchedWorkflows(lines),
  };
};

export type ParsedWorkflow = Readonly<{
  /** The workflow's `name:`, which is what a `workflow_run` matches on. */
  name: string | undefined;
  /** The workflows its own `workflow_run:` trigger names, if it has one. */
  watched: readonly string[];
}>;

type Workflow = ParsedWorkflow & Readonly<{ relativePath: string }>;

type CheckSummary = Readonly<{ workflows: number; references: number }>;

const WORKFLOW_GLOB = '.github/workflows/*.yml';

/** Top level, so indented and therefore not a `name:` inside a step. */
const readName = (lines: readonly string[]): string | undefined => {
  const line = lines.find((candidate) => candidate.startsWith('name:'));

  return line === undefined ? undefined : unquote(line.slice('name:'.length));
};

/**
 * The list items under `workflows:` inside a `workflow_run:` block.
 *
 * The scan ends at the first line indented no further than `workflow_run:`
 * itself, which is what keeps `types:` — and the next trigger after it — out
 * of the list.
 */
const readWatchedWorkflows = (lines: readonly string[]): readonly string[] => {
  const start = lines.findIndex(
    (line) => line.trimEnd().endsWith('workflow_run:') && line.startsWith(' '),
  );

  if (start === -1) return [];

  const blockIndent = indentOf(lines[start] ?? '');

  const body = takeWhileIndentedDeeper(lines.slice(start + 1), blockIndent);

  const listStart = body.findIndex(
    (line) => line.trim() === 'workflows:' || line.trim() === 'workflows: []',
  );

  if (listStart === -1) return [];

  const listIndent = indentOf(body[listStart] ?? '');

  return takeWhileIndentedDeeper(body.slice(listStart + 1), listIndent)
    .filter((line) => line.trim().startsWith('- '))
    .map((line) => unquote(line.trim().slice('- '.length)));
};

const takeWhileIndentedDeeper = (
  lines: readonly string[],
  indent: number,
): readonly string[] => {
  const end = lines.findIndex(
    (line) => line.trim() !== '' && indentOf(line) <= indent,
  );

  return end === -1 ? lines : lines.slice(0, end);
};

const indentOf = (line: string): number =>
  line.length - line.trimStart().length;

const unquote = (value: string): string =>
  value.trim().replace(/^['"]/u, '').replace(/['"]$/u, '').trim();

const collectWorkflows = async (): Promise<
  Result<readonly string[], string>
> => {
  const result = await glob(WORKFLOW_GLOB, {
    cwd: projectRootPath,
    absolute: true,
  });

  return Result.isErr(result)
    ? Result.err(
        `❌ Failed to list the workflows: ${unknownToString(result.value)}`,
      )
    : Result.ok(result.value.toSorted());
};

const readWorkflows = async (
  workflowPaths: readonly string[],
): Promise<Result<readonly Workflow[], string>> => {
  const read = await Promise.all(
    workflowPaths.map(async (file) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const contents = await fs.readFile(file, 'utf8').catch(() => undefined);

      return contents === undefined
        ? undefined
        : {
            relativePath: path.relative(projectRootPath, file),
            ...parseWorkflowRunNames(contents),
          };
    }),
  );

  const workflows = read.filter((workflow) => workflow !== undefined);

  return workflows.length === workflowPaths.length
    ? Result.ok(workflows)
    : Result.err('❌ Failed to read one of the workflow files.');
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkWorkflowRunNames().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `Every \`workflow_run\` name resolves to a workflow (${result.value.references} across ${result.value.workflows} workflows).`,
  );
}
