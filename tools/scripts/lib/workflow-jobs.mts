import {
  Arr,
  isRecord,
  isString,
  Obj,
  Optional,
  Result,
  unknownToString,
} from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { parse } from 'yaml';

/**
 * A workflow's jobs, read by a YAML parser: each job's matrix as written, what
 * it `uses:`, its `if:`, and its steps' names, `if:`, `run:` scripts and
 * `env:`. The guards that ask what CI runs (`check-ci-commands.mts`,
 * `check-ci-job-shape.mts`) and `check-all.mts`, which runs the matrices, read
 * workflows through this, so that a quoted or folded value, a flow-style
 * mapping, a comment after `include:` or an entry that starts with `- name:` is
 * read the same way by all three — and the way GitHub reads it. What a `run:`
 * script runs is `shell-commands.mts`'s.
 */
export const readWorkflowJobs = (
  text: string,
): Result<readonly WorkflowJob[], string> => {
  const parsed = parseWorkflow(text);

  if (Result.isErr(parsed)) {
    return parsed;
  }

  const workflow = parsed.value;

  if (!isRecord(workflow)) {
    return Result.ok([]);
  }

  const workflowEnv = readEnv(workflow['env']);

  const workflowDirectory = defaultDirectory(workflow);

  const jobs = workflow['jobs'];

  if (!isRecord(jobs)) {
    return Result.ok([]);
  }

  return Result.ok(
    Object.entries(jobs).map(([name, job]) => {
      const record = isRecord(job) ? job : ({} as const);

      const strategy = record['strategy'];

      const steps = record['steps'];

      const jobDirectory = defaultDirectory(record) ?? workflowDirectory;

      const displayName = record['name'];

      const uses = record['uses'];

      const needs = record['needs'];

      const timeoutMinutes = record['timeout-minutes'];

      return {
        name,
        displayName: isString(displayName) ? displayName : undefined,
        uses: isString(uses) ? uses : undefined,
        with: readEnv(record['with']),
        condition: scalarText(record['if']),
        hasRunner: record['runs-on'] !== undefined,
        timeoutMinutes: scalarText(timeoutMinutes),
        needs: stringList(needs),
        matrix: isRecord(strategy) ? strategy['matrix'] : undefined,
        env: { ...workflowEnv, ...readEnv(record['env']) },
        steps: Arr.isArray(steps)
          ? steps.map((step: unknown) => {
              const stepRecord = isRecord(step) ? step : ({} as const);

              const run = stepRecord['run'];

              const directory = stepRecord['working-directory'];

              const stepName = stepRecord['name'] ?? stepRecord['id'];

              return {
                name: isString(stepName) ? stepName : undefined,
                condition: scalarText(stepRecord['if']),
                run: isString(run) ? run : undefined,
                env: readEnv(stepRecord['env']),
                workingDirectory: isString(directory)
                  ? directory
                  : jobDirectory,
              };
            })
          : [],
      };
    }),
  );
};

/**
 * The events a workflow's `on:` names, however it is written: one event, a
 * list, or a mapping of each to its filters.
 */
export const readWorkflowTriggers = (
  text: string,
): Result<readonly string[], string> =>
  Result.map(parseWorkflow(text), (workflow) => {
    const on = isRecord(workflow) ? workflow['on'] : undefined;

    return isRecord(on) ? Object.keys(on) : stringList(on);
  });

/**
 * The `types:` a workflow's `on.<event>` lists, as written; empty when the
 * event names none.
 */
export const readTriggerTypes = (
  text: string,
  event: string,
): Result<readonly string[], string> =>
  Result.map(parseWorkflow(text), (workflow) => {
    const on = isRecord(workflow) ? workflow['on'] : undefined;

    const filters = isRecord(on) ? on[event] : undefined;

    const types = isRecord(filters) ? filters['types'] : undefined;

    return stringList(types);
  });

/** A workflow's top-level `concurrency.group`, as written; else undefined. */
export const readConcurrencyGroup = (
  text: string,
): Result<string | undefined, string> =>
  Result.map(parseWorkflow(text), (workflow) => {
    const concurrency = isRecord(workflow)
      ? workflow['concurrency']
      : undefined;

    const group = isRecord(concurrency) ? concurrency['group'] : concurrency;

    return isString(group) ? group : undefined;
  });

/**
 * Whether a workflow triggers on `event`, by {@link readWorkflowTriggers}. A
 * file YAML cannot parse counts as one that does, so that a guard reading only
 * such workflows reads it on and reports the error, rather than skipping it.
 */
export const triggersOn = (text: string, event: string): boolean =>
  Result.unwrapOkOr(
    Result.map(readWorkflowTriggers(text), (triggers) =>
      triggers.includes(event),
    ),
    true,
  );

/**
 * Every string value in a workflow, in document order, keys and comments left
 * out: where its expressions are, however YAML quotes or folds them.
 */
export const readWorkflowStrings = (
  text: string,
): Result<readonly string[], string> =>
  Result.map(parseWorkflow(text), (workflow) =>
    Arr.generate(function* () {
      const mut_pending: unknown[] = [workflow];

      while (Arr.isNonEmpty(mut_pending)) {
        const value = mut_pending.shift();

        if (isString(value)) {
          yield value;
        } else if (Arr.isArray(value)) {
          mut_pending.unshift(...value);
        } else if (isRecord(value)) {
          mut_pending.unshift(...Object.values(value));
        }
      }
    }),
  );

/**
 * A job's matrix: the entries under `include:`, each property as a string
 * (`browser: true` reads `'true'`), and the values of every other key given as
 * a list (`command: [a, b]`). A matrix given as an expression (`${{
 * fromJSON(…) }}`), or a key whose value is not a list, is an error: what it
 * holds is not in the file.
 */
export const readMatrix = (matrix: unknown): Result<Matrix, string> => {
  if (matrix === undefined) {
    return Result.ok({ include: [], lists: {} });
  }

  if (!isRecord(matrix)) {
    return Result.err(
      'a matrix given as an expression, whose entries are not in the file',
    );
  }

  const written = matrix['include'];

  const include =
    written === undefined
      ? ([] as const)
      : Arr.isArray(written)
        ? written
        : undefined;

  if (include === undefined) {
    return Result.err('an `include:` that is not a list');
  }

  const listed = Object.entries(matrix).filter(
    ([key]) => key !== 'include' && key !== 'exclude',
  );

  const notLists = listed.filter(([, values]) => !Arr.isArray(values));

  if (Arr.isNonEmpty(notLists)) {
    return Result.err(
      `a matrix key that is not a list: ${notLists.map(([key]) => `\`${key}\``).join(', ')}`,
    );
  }

  return Result.ok({
    include: include.map((entry: unknown) =>
      isRecord(entry) ? readScalars(entry) : {},
    ),
    lists: Object.fromEntries(
      listed.map(([key, values]) => [
        key,
        Arr.isArray(values)
          ? Arr.generate(function* () {
              for (const value of values) {
                const text = scalarText(value);

                if (text !== undefined) {
                  yield text;
                }
              }
            })
          : [],
      ]),
    ),
  });
};

/** The values a matrix gives a key: its list, and its `include:` entries'. */
export const matrixValues = (matrix: Matrix, key: string): readonly string[] =>
  [
    ...(matrix.lists[key] ?? []),
    ...Arr.generate(function* () {
      for (const entry of matrix.include) {
        const value = entry[key];

        if (value !== undefined) {
          yield value;
        }
      }
    }),
  ] as const;

/** The key a word names when it is a matrix value, `${{ matrix.<key> }}`. */
export const matrixKeyOf = (word: string): string | undefined =>
  MATRIX_REFERENCE.exec(word)?.groups?.['key'];

/**
 * A word that is a variable an `env:` gives (`$NAME`, `${NAME}`), as its value
 * — how a step hands a matrix value on to its script (`COMMAND: ${{
 * matrix.command }}`, then `pnpm run "${COMMAND}"`); any other word as it is.
 */
export const expandVariable = (
  word: string,
  env: ReadonlyRecord<string, string>,
): string => {
  const groups = VARIABLE_REFERENCE.exec(word)?.groups;

  const name = groups?.['braced'] ?? groups?.['bare'];

  return name === undefined ? word : (env[name] ?? word);
};

/** The gate every check workflow calls, as a job's `uses:` names it. */
export const CHECK_GATES_WORKFLOW = './.github/workflows/check-gates.yml';

/** Whether a workflow is a check workflow: one of its jobs calls the gate. */
export const callsCheckGates = (jobs: readonly WorkflowJob[]): boolean =>
  jobs.some(({ uses }) => uses === CHECK_GATES_WORKFLOW);

export type WorkflowJob = Readonly<{
  name: string;
  /** The job's `name:` as written, expressions and all; absent when unnamed. */
  displayName: string | undefined;
  /** The reusable workflow the job calls (`uses:`), as written. */
  uses: string | undefined;
  /** The inputs it passes to that workflow (`with:`), scalars as text. */
  with: ReadonlyRecord<string, string>;
  /** The job's `if:` as written, a folded one joined; absent without one. */
  condition: string | undefined;
  /** The jobs its `needs:` names, one or a list. */
  needs: readonly string[];
  /**
   * Whether it has a `runs-on:`, as a job that calls a reusable workflow
   * (`uses:`) does not.
   */
  hasRunner: boolean;
  /** Its `timeout-minutes` as written (`15` reads `'15'`); absent when none. */
  timeoutMinutes: string | undefined;
  /** `strategy.matrix` as written: a mapping, an expression, or absent. */
  matrix: unknown;
  /** The workflow's `env:` and the job's, the job's taking precedence. */
  env: ReadonlyRecord<string, string>;
  steps: readonly WorkflowStep[];
}>;

export type WorkflowStep = Readonly<{
  /** The step's `name:`, else its `id:`; absent when it has neither. */
  name: string | undefined;
  /** The step's `if:` as written, a folded one joined; absent without one. */
  condition: string | undefined;
  run: string | undefined;
  env: ReadonlyRecord<string, string>;
  /**
   * The step's `working-directory`, or else its job's `defaults.run` one, or
   * else the workflow's.
   */
  workingDirectory: string | undefined;
}>;

export type Matrix = Readonly<{
  include: readonly ReadonlyRecord<string, string>[];
  lists: ReadonlyRecord<string, readonly string[]>;
}>;

const MATRIX_REFERENCE = /^\$\{\{\s*matrix\.(?<key>[\w-]+)\s*\}\}$/u;

const VARIABLE_REFERENCE =
  /^\$(?:\{(?<braced>[A-Za-z_]\w*)\}|(?<bare>[A-Za-z_]\w*))$/u;

const parseWorkflow = (text: string): Result<unknown, string> => {
  const parsed = Result.fromThrowable((): unknown => parse(text));

  return Result.isErr(parsed)
    ? Result.err(
        `not YAML this reads: ${unknownToString(parsed.value).split('\n', 1)[0] ?? ''}`,
      )
    : parsed;
};

/** The `defaults.run.working-directory` of a workflow or a job. */
const defaultDirectory = (
  mapping: ReadonlyRecord<string, unknown>,
): string | undefined => {
  const defaults = mapping['defaults'];

  const run = isRecord(defaults) ? defaults['run'] : undefined;

  const directory = isRecord(run) ? run['working-directory'] : undefined;

  return isString(directory) ? directory : undefined;
};

/** A YAML scalar as the string GitHub substitutes for it; else undefined. */
const scalarText = (value: unknown): string | undefined =>
  isString(value)
    ? value
    : typeof value === 'number' || typeof value === 'boolean'
      ? value.toString()
      : undefined;

/** A mapping's scalar values as strings, the rest left out. */
const readScalars = (
  mapping: ReadonlyRecord<string, unknown>,
): ReadonlyRecord<string, string> =>
  Obj.filterMap(mapping, (value) => {
    const text = scalarText(value);

    return text === undefined ? Optional.none : Optional.some(text);
  });

/** A value YAML writes as one string or a list of them; else none. */
const stringList = (value: unknown): readonly string[] =>
  isString(value)
    ? ([value] as const)
    : Arr.isArray(value)
      ? value.filter(isString)
      : ([] as const);

/** An `env:` mapping, its scalar values as strings. */
const readEnv = (env: unknown): ReadonlyRecord<string, string> =>
  isRecord(env) ? readScalars(env) : ({} as const);
