import * as vm from 'node:vm';
import { MAIN_RULESET_PATH, parseRuleset } from 'pr-report-core';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { readRepositoryFile } from '../lib/repo-files.mjs';
import {
  readConcurrencyGroup,
  readTriggerTypes,
  readWorkflowJobs,
  readWorkflowTriggers,
} from '../lib/workflow-jobs.mjs';

/**
 * Fails when `lint-pull-request.yml`'s two rules about `skip-ci` stop fitting
 * together.
 *
 * The workflow names by hand, twice, what an event does under the label: the
 * `&judges` anchor its jobs take as their `if`, and the `-idle-<run id>` suffix
 * of its concurrency group, a group per run, which has to be its negation under
 * the label and nothing without it. A run that judges must never be idle
 * (nothing would then cancel it, and an older title's verdict could land after
 * a newer one's), and one that does not must be (in the main group it could
 * cancel a run that judges, leaving its `always()` aggregate red until the
 * label came off). A YAML anchor cannot reach into an expression, so nothing
 * GitHub runs would say the two had drifted. This evaluates both over every
 * event the workflow triggers on, with and without the label, and checks the
 * jobs, their aggregate and `check-result.yml` are wired the way the skip
 * relies on.
 */
export const checkLintPullRequestGroups = (): Promise<
  Result<CheckSummary, string>
> =>
  Result.safeTry(async function* () {
    const [workflowRead, checkResultRead, rulesetRead] = await Promise.all([
      readRepositoryFile(WORKFLOW),
      readRepositoryFile(CHECK_RESULT),
      readRepositoryFile(MAIN_RULESET_PATH),
    ]);

    const text = yield* Result.safeUnwrap(workflowRead);

    const checkResult = yield* Result.safeUnwrap(checkResultRead);

    const ruleset = yield* Result.safeUnwrap(rulesetRead);

    const violations = yield* Result.safeUnwrap(
      collectGroupViolations(text, checkResult, ruleset),
    );

    return Arr.isNonEmpty(violations)
      ? Result.err(formatViolations(violations))
      : Result.ok(undefined);
  });

/**
 * What is wrong with the workflow's text, `check-result.yml`'s and the
 * ruleset's, one message per problem; an error when one cannot be read as this
 * check needs.
 */
export const collectGroupViolations = (
  text: string,
  checkResult: string,
  ruleset: string,
): Result<readonly string[], string> =>
  Result.safeTry(function* () {
    const jobs = yield* Result.safeUnwrap(readWorkflowJobs(text));

    const triggers = yield* Result.safeUnwrap(readWorkflowTriggers(text));

    const types = yield* Result.safeUnwrap(
      readTriggerTypes(text, 'pull_request_target'),
    );

    const group = yield* Result.safeUnwrap(readConcurrencyGroup(text));

    const resultJobs = yield* Result.safeUnwrap(readWorkflowJobs(checkResult));

    const { requiredContexts } = yield* Result.safeUnwrap(
      parseRuleset(ruleset, MAIN_RULESET_PATH),
    );

    const resultJob = resultJobs.find((job) => job.name === 'result');

    const resultCondition = resultJob?.condition;

    if (resultCondition === undefined) {
      return Result.err(`${CHECK_RESULT}: no \`result\` job with an \`if\``);
    }

    const aggregate = jobs.find((job) => job.name === AGGREGATE);

    const judging = jobs.filter((job) => job.name !== AGGREGATE);

    const condition = judging.find((job) => job.name === ANCHOR_JOB)?.condition;

    // The group's last `${{ … }}` is the one that picks the suffix.
    const suffix =
      group === undefined
        ? undefined
        : /\$\{\{((?:(?!\$\{\{)[\s\S])*)\}\}\s*$/u.exec(group)?.[1];

    if (aggregate === undefined || condition === undefined) {
      return Result.err(
        `${WORKFLOW}: no \`${AGGREGATE}\` job, or no \`${ANCHOR_JOB}\` job with an \`if\``,
      );
    }

    if (group === undefined || suffix === undefined) {
      return Result.err(
        `${WORKFLOW}: \`concurrency.group\` does not end in a \`\${{ … }}\``,
      );
    }

    const contexts = [false, true].flatMap((skipCi) =>
      types.flatMap((action): readonly Context[] =>
        action === 'edited'
          ? [
              { action, titleChanged: true, skipCi },
              { action, titleChanged: false, skipCi },
            ]
          : [{ action, titleChanged: false, skipCi }],
      ),
    );

    const judgedValues = yield* Result.safeUnwrap(
      evaluate(condition, contexts),
    );

    const idleValues = yield* Result.safeUnwrap(evaluate(suffix, contexts));

    const rows = contexts.map((context, index) => ({
      ...context,
      // GitHub runs a job whose `if` is truthy, not only `true`.
      judges: isTruthy(judgedValues[index]),
      idle: idleValues[index] === IDLE,
      // Neither idle nor the pull request's own group.
      apart: idleValues[index] !== IDLE && idleValues[index] !== '',
    }));

    const where = (skipCi: boolean, keep: (row: Row) => boolean): string =>
      names(rows.filter((row) => row.skipCi === skipCi && keep(row)));

    return Result.ok([
      ...(group.trimEnd() === `${GROUP_PREFIX}\${{${suffix}}}`
        ? []
        : [
            `Its concurrency group is not \`${GROUP_PREFIX}\` followed by the suffix alone: the runs of different pull requests would cancel each other, or those of one would not`,
          ]),
      ...mismatch('It triggers on', sortedSet(triggers), 'pull_request_target'),
      ...mismatch(
        'Under `skip-ci`, these judge',
        where(true, (row) => row.judges),
        'edited (title), opened',
      ),
      ...mismatch(
        'Under `skip-ci`, these are idle',
        where(true, (row) => row.idle),
        'edited, labeled, synchronize, unlabeled',
      ),
      ...mismatch(
        'Under `skip-ci`, these neither judge nor are idle',
        where(true, (row) => !row.judges && !row.idle),
        'none',
      ),
      ...mismatch(
        'Without `skip-ci`, these do not judge',
        where(false, (row) => !row.judges),
        'none',
      ),
      ...mismatch(
        'Without `skip-ci`, these are idle',
        where(false, (row) => row.idle),
        'none',
      ),
      ...mismatch(
        'These run in a group of their own that is not idle',
        names(rows.filter((row) => row.apart)),
        'none',
      ),
      ...mismatch(
        'These judge in the idle group',
        names(rows.filter((row) => row.judges && row.idle)),
        'none',
      ),
      ...judging
        .filter((job) => job.condition !== condition)
        .map(
          (job) =>
            `\`${job.name}\` does not take the same \`if\` as \`${ANCHOR_JOB}\` (\`*judges\`)`,
        ),
      ...judging
        .filter((job) => Arr.isNonEmpty(job.needs))
        .map(
          (job) =>
            `\`${job.name}\` needs ${sortedSet(job.needs)}, where the jobs that judge should need nothing: a skipped need would skip it whatever its \`if\``,
        ),
      ...mismatch(
        `\`${AGGREGATE}\` needs`,
        sortedSet(aggregate.needs),
        sortedSet(judging.map((job) => job.name)),
      ),
      ...mismatch(
        `\`${AGGREGATE}\`'s \`if\` is`,
        aggregate.condition ?? 'none',
        AGGREGATE_CONDITION,
      ),
      ...mismatch(
        `\`${AGGREGATE}\` calls`,
        aggregate.uses ?? 'none',
        `./${CHECK_RESULT}`,
      ),
      ...mismatch(
        `\`${AGGREGATE}\` passes \`needs\` as`,
        aggregate.with['needs'] ?? 'none',
        AGGREGATE_NEEDS,
      ),
      ...(resultCondition.replaceAll(/\s+/gu, ' ').trim() === RESULT_CONDITION
        ? []
        : [
            `${CHECK_RESULT}'s \`result\` job's \`if\` is no longer the one this check was written against. The lint's caller passes no \`gates\` and judges under \`skip-ci\`: check that a cancelled run still reports red, and a run that judges still reports its verdict rather than \`skipped\`, which satisfies the required context. Then update RESULT_CONDITION in this check.`,
          ]),
      ...(aggregate.displayName === undefined
        ? []
        : [
            `\`${AGGREGATE}\` has a \`name:\`, which renames the required context \`${AGGREGATE} / result\``,
          ]),
      ...(resultJob?.displayName === undefined
        ? []
        : [
            `${CHECK_RESULT}'s \`result\` job has a \`name:\`, which renames the required context \`${AGGREGATE} / result\``,
          ]),
      ...judging
        .map((job) => job.displayName ?? job.name)
        .filter((context) => requiredContexts.includes(context))
        .map(
          (context) =>
            `${MAIN_RULESET_PATH} requires \`${context}\`, which reports \`skipped\` under \`skip-ci\` and so satisfies the requirement without a verdict: require \`${AGGREGATE} / result\` alone`,
        ),
      ...(requiredContexts.includes(`${AGGREGATE} / result`)
        ? []
        : [
            `${MAIN_RULESET_PATH} does not require \`${AGGREGATE} / result\`, so the aggregate blocks nothing`,
          ]),
    ]);
  });

type Context = Readonly<{
  action: string;
  titleChanged: boolean;
  skipCi: boolean;
}>;

type Row = Context &
  Readonly<{ judges: boolean; idle: boolean; apart: boolean }>;

type CheckSummary = undefined;

const WORKFLOW = '.github/workflows/lint-pull-request.yml';

const AGGREGATE = 'lint-pull-request-result';

/** The job whose `if` holds the `&judges` anchor the others take. */
const ANCHOR_JOB = 'semantic-pull-request';

const CHECK_RESULT = '.github/workflows/check-result.yml';

/**
 * `check-result.yml`'s `result` job's `if`, whitespace collapsed: run on a
 * cancel, the `skip-ci` skip scoped to `pull_request`, and gate clauses that a
 * caller with no `gates` passes.
 */
const RESULT_CONDITION =
  "always() && (github.event_name != 'pull_request' || !contains(github.event.pull_request.labels.*.name, 'skip-ci')) && fromJSON(inputs.needs).gates.outputs.branch_up_to_date != 'false' && fromJSON(inputs.needs).gates.outputs.should_run != 'false' && !contains(fromJSON(inputs.needs).*.outputs.no_verdict, 'true')";

/**
 * Skipped exactly when its needs are, and run on a failure or a cancel, so that
 * a head under the label gets no verdict while a broken run gets a red one.
 */
const AGGREGATE_CONDITION = "always() && !contains(needs.*.result, 'skipped')";

/** The pull request's own group, which the idle suffix follows. */
const GROUP_PREFIX =
  // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
  "${{ github.workflow }}-${{ case(github.event_name == 'pull_request_target', github.event.pull_request.number, github.ref) }}";

/** What the idle suffix reads as here: a group of the run's own. */
const IDLE = '-idle-<run id>';

/** What `check-result.yml` reads the needs' results from. */
// eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
const AGGREGATE_NEEDS = '${{ toJSON(needs) }}';

/**
 * The tokens of the GitHub expressions this reads, as JavaScript: the label
 * test, the action, whether the title changed, the idle suffix, a three-way
 * `case`, `==`, `!`, `&&`, `||`, commas, parentheses and string literals.
 * Anything else (a `null`, a property of the title change, a function, a lone
 * `=`) is an error rather than something evaluated in a way GitHub would not.
 */
const TOKENS: readonly Readonly<{ pattern: RegExp; to: string | undefined }>[] =
  [
    { pattern: /^\s+/u, to: ' ' },
    {
      pattern:
        /^contains\(github\.event\.pull_request\.labels\.\*\.name, 'skip-ci'\)/u,
      to: 'context.skipCi',
    },
    { pattern: /^github\.event\.action\b/u, to: 'context.action' },
    {
      pattern: /^github\.event\.changes\.title != ''/u,
      to: 'context.titleChanged',
    },
    {
      pattern: /^format\('-idle-\{0\}', github\.run_id\)/u,
      to: `'${IDLE}'`,
    },
    { pattern: /^case\(/u, to: 'choose(' },
    { pattern: /^==/u, to: '===' },
    { pattern: /^(?:&&|\|\||!|\(|\)|,)/u, to: undefined },
    { pattern: /^'[\w-]*'/u, to: undefined },
  ] as const;

/** Truthy as GitHub's expressions read it. */
const isTruthy = (value: unknown): boolean =>
  value !== false &&
  !(typeof value === 'number' && Number.isNaN(value)) &&
  value !== null &&
  value !== undefined &&
  value !== 0 &&
  value !== '';

/** GitHub's `case(predicate, value, default)`; any other number of arguments throws. */
const choose = (...args: readonly unknown[]): unknown => {
  if (!Arr.isFixedLengthArray(3, args)) {
    throw new Error(`case() with ${args.length} arguments`);
  }

  return isTruthy(args[0]) ? args[1] : args[2];
};

/** A sorted set, so that order and repeats in the file do not count. */
const sortedSet = (values: readonly string[]): string => {
  const distinct = Arr.uniq(values).toSorted();

  return Arr.isNonEmpty(distinct) ? distinct.join(', ') : 'none';
};

/** The events of `contexts`, an edit that changed the title marked. */
const names = (contexts: readonly Context[]): string =>
  sortedSet(
    contexts.map((context) =>
      context.titleChanged ? `${context.action} (title)` : context.action,
    ),
  );

/** One message when `actual` is not `expected`. */
const mismatch = (
  what: string,
  actual: string,
  expected: string,
): readonly string[] =>
  actual === expected
    ? ([] as const)
    : ([`${what} ${actual}, where it should be ${expected}`] as const);

const toJavaScript = (rest: string): Result<string, string> => {
  if (rest === '') {
    return Result.ok('');
  }

  const token = TOKENS.map(({ pattern, to }) => ({
    match: pattern.exec(rest)?.[0],
    to,
  })).find(({ match }) => match !== undefined);

  return token?.match === undefined
    ? Result.err(
        `${WORKFLOW}: an expression this check does not read, at \`${rest.slice(0, 40)}\``,
      )
    : Result.map(
        toJavaScript(rest.slice(token.match.length)),
        (tail) => `${token.to ?? token.match}${tail}`,
      );
};

/**
 * `expression` over every context, compiled once; an error for an expression
 * this does not read, or one that throws.
 */
const evaluate = (
  expression: string,
  contexts: readonly Context[],
): Result<readonly unknown[], string> =>
  Result.flatMap(
    toJavaScript(expression),
    (javaScript): Result<readonly unknown[], string> => {
      const values = Result.fromThrowable((): readonly unknown[] => {
        const run = vm.compileFunction(`return (${javaScript});`, [
          'context',
          'choose',
        ]);

        return contexts.map((context): unknown =>
          Reflect.apply(run, undefined, [context, choose]),
        );
      });

      return Result.isErr(values)
        ? Result.err(
            `${WORKFLOW}: \`${expression.trim()}\` does not evaluate: ${unknownToString(values.value)}`,
          )
        : values;
    },
  );

const formatViolations = (violations: readonly string[]): string =>
  [
    `❌ ${WORKFLOW} no longer holds \`skip-ci\` the way its comments say:`,
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    'Its comments above the concurrency group, the jobs and the aggregate, and',
    `those above ${CHECK_RESULT}'s \`result\` job, say what each rule is for.`,
    'Change the rules that depend on each other together.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkLintPullRequestGroups().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${WORKFLOW}: under \`skip-ci\`, every event either judges or is idle, and none does both.`,
  );
}
