import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { plural } from '../lib/plural.mjs';
import { listWorkflowFiles } from '../lib/repo-files.mjs';
import { readShellCommands } from '../lib/shell-commands.mjs';
import {
  readWorkflowJobs,
  readWorkflowTriggers,
  type WorkflowJob,
} from '../lib/workflow-jobs.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Holds every job that opens a pull request (`gh pr create`) in a workflow that
 * takes `workflow_dispatch` to the default branch.
 *
 * A dispatch runs on whatever ref it is given, and a job that builds its branch
 * from the checked-out tree and opens it into `main` would then open that ref's
 * commits, which nobody reviewed, under a bot's title, queued or armed as the
 * workflow leaves it: `pnpm-update.yml` (#3508) and `node-support-update.yml` (#3509)
 * both did. The job holds when its own `if:` requires
 * {@link DEFAULT_BRANCH_CONDITION} (it alone, or joined by `&&` with no `||`),
 * or when it needs a job that holds and its `if:` names no status function
 * (`always()`, `failure()`, `cancelled()`, `success()`), so that it is skipped
 * with that job.
 *
 * What opens a pull request here is `gh pr create`, the one way the workflows
 * do; a job that opened one otherwise (an action, `gh api` on `/pulls`) would
 * not be seen.
 */
export const checkDispatchDefaultBranch = (): Promise<Result<number, string>> =>
  Result.safeTry(async function* () {
    const paths = yield* Result.safeUnwrap(await listWorkflowFiles());

    const mut_messages: string[] = [];

    for (const workflowPath of paths) {
      const relativePath = path
        .relative(projectRootPath, workflowPath)
        .split(path.sep)
        .join('/');

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a workflow file listWorkflowFiles found.
      const text = await fs.readFile(workflowPath, 'utf8');

      const found = findPullRequestJobsOnAnyRef(text);

      if (Result.isErr(found)) {
        mut_messages.push(`${relativePath}: ${found.value}`);

        continue;
      }

      mut_messages.push(
        ...found.value.map(
          (job) =>
            `${relativePath}: job "${job}" opens a pull request, and a dispatch runs it on any ref. Give it \`if: ${DEFAULT_BRANCH_CONDITION}\`, or have it need a job that has it (as pnpm-update.yml's \`commit\` needs \`update\`).`,
        ),
      );
    }

    return Arr.isNonEmpty(mut_messages)
      ? Result.err(mut_messages.join('\n'))
      : Result.ok(paths.length);
  });

/**
 * The jobs of one workflow that open a pull request on any dispatched ref; none
 * when the workflow takes no `workflow_dispatch`.
 */
export const findPullRequestJobsOnAnyRef = (
  text: string,
): Result<readonly string[], string> =>
  Result.safeTry(function* () {
    const triggers = yield* Result.safeUnwrap(readWorkflowTriggers(text));

    if (!triggers.includes('workflow_dispatch')) {
      return Result.ok([]);
    }

    const jobs = yield* Result.safeUnwrap(readWorkflowJobs(text));

    const byName = new Map(jobs.map((job) => [job.name, job] as const));

    const isGated = (job: WorkflowJob, seen: ReadonlySet<string>): boolean => {
      if (job.condition !== undefined && hasDefaultBranchCondition(job)) {
        return true;
      }

      if (job.condition !== undefined && STATUS_FUNCTION.test(job.condition)) {
        return false;
      }

      const visited = new Set<string>([...seen, job.name]);

      return job.needs.some((name) => {
        const needed = byName.get(name);

        return (
          needed !== undefined && !visited.has(name) && isGated(needed, visited)
        );
      });
    };

    return Result.ok(
      jobs
        .filter(
          (job) => opensPullRequest(job) && !isGated(job, new Set<string>()),
        )
        .map(({ name }) => name),
    );
  });

/**
 * The `if:` that runs a job on the default branch only, as `pnpm-update.yml`
 * writes it. The full ref is compared because a tag is not a branch, and
 * `default_branch` is empty in a run a schedule started, hence the fallback.
 */
export const DEFAULT_BRANCH_CONDITION =
  "github.ref == format('refs/heads/{0}', case(github.event.repository.default_branch != '', github.event.repository.default_branch, 'main'))";

/** Whitespace taken out, so that a folded `if:` reads as one line. */
const normalize = (expression: string): string =>
  expression.replaceAll(/\s+/gu, '');

/** An `||` anywhere could let another ref through, so it is not accepted. */
const hasDefaultBranchCondition = (job: WorkflowJob): boolean => {
  const condition = normalize(job.condition ?? '');

  return (
    condition.includes(normalize(DEFAULT_BRANCH_CONDITION)) &&
    !condition.includes('||')
  );
};

const opensPullRequest = (job: WorkflowJob): boolean =>
  job.steps.some(
    ({ run }) =>
      run !== undefined &&
      readShellCommands(run).commands.some(
        ([command, sub, action]) =>
          command === 'gh' && sub === 'pr' && action === 'create',
      ),
  );

const STATUS_FUNCTION = /\b(?:always|failure|cancelled|success)\s*\(/u;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkDispatchDefaultBranch();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `✓ No job opens a pull request from a dispatched ref other than the default branch (${plural(result.value, 'workflow')} read).`,
  );
}
