import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import * as util from 'node:util';
import {
  Arr,
  asUint32,
  isPositiveUint32,
  Num,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Runs `pnpm run benchmark` several times and writes the median of the runs
 * to RESULTS.md, with each library's time as a ratio of synstate-dom's. One
 * run moves by 10–30% from the next on the same machine, more than most
 * changes worth measuring, so a figure worth quoting is a median of several.
 *
 * ```sh
 * pnpm run benchmark:repeat                          # 5 runs
 * pnpm run benchmark:repeat -- --runs 8
 * pnpm run benchmark:repeat -- --baseline origin/main
 * ```
 *
 * Each run measures the libraries in a different order
 * (`BENCHMARK_ROTATE`), so that no library is always the one measured on a
 * cold browser.
 *
 * With `--baseline <git ref>`, the ref is checked out in a temporary worktree,
 * installed and built, and its benchmark runs alternately with this one's, so
 * that both see the same machine. The comparison is printed, not written:
 * RESULTS.md stays this tree's. The other libraries' columns show how much
 * the machine moved between the two.
 *
 * Needs `pnpm run ws:build` first, like `pnpm run benchmark`.
 */
const main = async (): Promise<void> => {
  // `pnpm run benchmark:repeat -- --runs 8` passes the `--` on.
  const args = Arr.skip(process.argv, 2);

  const [first, ...rest] = args;

  const { values } = util.parseArgs({
    args: first === '--' ? rest : args,
    options: {
      runs: { type: 'string', default: '5' },
      baseline: { type: 'string' },
    },
  });

  const runs = Result.unwrapOkOr(Num.safeParseInt(values.runs), Number.NaN);

  if (!isPositiveUint32(runs)) {
    throw new Error(`--runs must be a positive integer, not ${values.runs}`);
  }

  const baselineRoot =
    values.baseline === undefined
      ? undefined
      : await prepareBaseline(values.baseline);

  try {
    // One run after another, never two at once: they would share the machine
    // they are measuring.
    const rounds = await mapInSequence(Arr.seq(asUint32(runs)), async (i) => {
      console.info(`\n## Run ${i + 1} of ${runs}\n`);

      const current = await runOnce(workspaceRootPath, i);

      const baseline =
        baselineRoot === undefined
          ? undefined
          : await runOnce(appIn(baselineRoot), i);

      return { current, baseline } as const;
    });

    const medians = medianTables(rounds.map((r) => r.current));

    const measuredIn = userAgentOf(await readResults(workspaceRootPath));

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      resultsPath(workspaceRootPath),
      [
        '# Results',
        '',
        '<!-- Written by `pnpm run benchmark:repeat`; edits here are overwritten. -->',
        '',
        `Measured in \`${measuredIn}\`. Each figure is the median of ${runs} runs of \`pnpm run benchmark\`, each measuring the libraries in a different order and each itself the median of its timed runs; see README.md for what is timed.`,
        '',
        mediansTable(medians.operations),
        '',
        '## Relative to synstate-dom',
        '',
        ratioNote,
        '',
        ratioTable(medians.operations),
        '',
        '## Scenarios',
        '',
        `${scenariosNote} The medians are taken as above.`,
        '',
        mediansTable(medians.scenarios),
        '',
        '### Relative to synstate-dom',
        '',
        ratioNote,
        '',
        ratioTable(medians.scenarios),
        '',
      ].join('\n'),
    );

    console.info(`\nWrote ${resultsPath(workspaceRootPath)}`);

    if (baselineRoot !== undefined && values.baseline !== undefined) {
      console.info(
        [
          '',
          `## ${values.baseline} → this tree (median ms of ${runs} alternating runs)`,
          '',
          comparisonTable(
            medianTables(rounds.flatMap((r) => r.baseline ?? [])).operations,
            medians.operations,
          ),
        ].join('\n'),
      );
    }
  } finally {
    if (baselineRoot !== undefined) {
      run('git', ['worktree', 'remove', '--force', baselineRoot], repoRoot);
    }
  }
};

type Table = Readonly<{
  columns: readonly string[];
  rows: readonly Readonly<{
    operation: string;
    values: readonly number[];
  }>[];
}>;

/**
 * What one run of `pnpm run benchmark` writes: the table of
 * js-framework-benchmark's operations, and the table of the scenarios.
 */
type Tables = Readonly<{ operations: Table; scenarios: Table }>;

const synstateDomColumn = 'synstate-dom';

/**
 * What `run.bench-browser.mts` writes in a scenario's cell when the library
 * rendered the wrong figures; read as `NaN`.
 */
const wrong = 'wrong';

/** The first sentence of the scenarios' section, as one run writes it. */
const scenariosNote =
  "The scenarios of `src/scenarios/`; see README.md. `wrong` is a library that rendered figures other than the model's, so has no time.";

const ratioNote =
  "Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.";

const repoRoot = path.resolve(workspaceRootPath, '../..');

const appPathInRepo = path.relative(repoRoot, workspaceRootPath);

const appIn = (root: string): string => path.join(root, appPathInRepo);

const resultsPath = (appRoot: string): string =>
  path.join(appRoot, 'RESULTS.md');

const readResults = async (appRoot: string): Promise<string> =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFile(resultsPath(appRoot), 'utf8');

/** Runs the benchmark once in `appRoot` and reads the tables it wrote. */
const runOnce = async (appRoot: string, rotate: number): Promise<Tables> => {
  run('pnpm', ['run', 'benchmark'], appRoot, {
    BENCHMARK_ROTATE: rotate.toString(),
  });

  return parseResults(await readResults(appRoot));
};

/**
 * Checks `ref` out in a temporary worktree and builds what its benchmark
 * imports, so that it runs the way this tree's does.
 */
const prepareBaseline = async (ref: string): Promise<string> => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), 'synstate-dom-benchmark-baseline-'),
  );

  run('git', ['worktree', 'add', '--detach', root, ref], repoRoot);

  run('pnpm', ['install', '--frozen-lockfile'], root);

  // `ws:build`, not `pnpm --filter 'synstate-dom-benchmark^...' run build`:
  // pnpm orders a filtered run by devDependencies too, which run in a cycle
  // through the ESLint packages, so a fresh worktree builds a package before
  // what it imports.
  run('pnpm', ['run', 'ws:build'], root);

  return root;
};

const run = (
  command: string,
  args: readonly string[],
  cwd: string,
  env: Readonly<{ BENCHMARK_ROTATE?: string }> = {},
): void => {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });

  if (result.status !== 0) {
    throw new Error(
      `${Arr.toUnshifted(command)(args).join(' ')} failed in ${cwd} (exit ${unknownToString(result.status)})`,
    );
  }
};

/**
 * Reads the two tables `pnpm run benchmark` writes into RESULTS.md, each a run
 * of lines that start with `|`.
 */
const parseResults = (markdown: string): Tables => {
  const blocks = markdown
    .split('\n')
    .reduce<readonly (readonly string[])[]>(
      (found, line, i, lines) =>
        !line.startsWith('|')
          ? found
          : lines[i - 1]?.startsWith('|') === true
            ? found.with(
                found.length - 1,
                Arr.toPushed(found.at(-1) ?? [], line),
              )
            : Arr.toPushed(found, [line]),
      [],
    )
    .map(parseTable);

  const [operations, scenarios] = blocks;

  if (operations === undefined || scenarios === undefined) {
    throw new Error('RESULTS.md does not have the two tables of one run');
  }

  return { operations, scenarios };
};

const parseTable = (lines: readonly string[]): Table => {
  const [header, , ...body] = lines;

  const [, ...columns] = cellsOf(header ?? '');

  return {
    columns,
    rows: body.map((line) => {
      const [operation = '', ...values] = cellsOf(line);

      return {
        operation,
        values: values.map((v) =>
          v === wrong
            ? Number.NaN
            : Result.unwrapOkOr(Num.safeParseFloat(v), Number.NaN),
        ),
      };
    }),
  };
};

const cellsOf = (line: string): readonly string[] =>
  line
    .trim()
    .replace(/^\|/u, '')
    .replace(/\|$/u, '')
    .split('|')
    .map((cell) => cell.trim());

const userAgentOf = (markdown: string): string =>
  /Measured in `([^`]*)`/u.exec(markdown)?.[1] ?? 'an unknown browser';

const medianTables = (runs: readonly Tables[]): Tables =>
  ({
    operations: medianTable(runs.map((r) => r.operations)),
    scenarios: medianTable(runs.map((r) => r.scenarios)),
  }) as const;

const mediansTable = (table: Table): string =>
  [
    `| operation (median ms) | ${table.columns.join(' | ')} |`,
    `| :-- | ${table.columns.map(() => '--:').join(' | ')} |`,
    ...table.rows.map(
      (row) =>
        `| ${row.operation} | ${row.values.map((v) => (Number.isNaN(v) ? wrong : v.toFixed(2))).join(' | ')} |`,
    ),
  ].join('\n');

/**
 * The median of each cell over `tables`, which must share their layout. A
 * cell that is `NaN` (`wrong`) in any run is `NaN`. Rounded as RESULTS.md
 * prints it, so that a ratio here is the one a reader gets from the medians
 * shown, as the docs site's embedding computes it; a scenario's figure is a
 * tenth of a millisecond, where the rounding moves a ratio by 5%.
 */
const medianTable = (tables: readonly Table[]): Table => {
  const [first] = tables;

  if (first === undefined) {
    throw new Error('no runs');
  }

  return {
    columns: first.columns,
    rows: first.rows.map((row, r) => ({
      operation: row.operation,
      values: first.columns.map(
        (_, c) =>
          Math.round(
            median(tables.map((t) => t.rows[r]?.values[c] ?? Number.NaN)) * 100,
          ) / 100,
      ),
    })),
  };
};

const median = (samples: readonly number[]): number => {
  if (samples.some(Number.isNaN)) {
    return Number.NaN;
  }

  const sorted = samples.toSorted((a, b) => a - b);

  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 1
    ? (sorted[mid] ?? Number.NaN)
    : ((sorted[mid - 1] ?? Number.NaN) + (sorted[mid] ?? Number.NaN)) / 2;
};

const ratioTable = (table: Table): string => {
  const base = table.columns.indexOf(synstateDomColumn);

  const others = table.columns.filter((c) => c !== synstateDomColumn);

  return [
    `| operation | ${others.join(' | ')} |`,
    `| :-- | ${others.map(() => '--:').join(' | ')} |`,
    ...table.rows.map((row) => {
      const own = row.values[base] ?? Number.NaN;

      const ratios = table.columns
        .map((column, c) => ({ column, value: row.values[c] ?? Number.NaN }))
        .filter(({ column }) => column !== synstateDomColumn)
        .map(({ value }) => ratio(value, own));

      return `| ${row.operation} | ${ratios.join(' | ')} |`;
    }),
  ].join('\n');
};

/**
 * Each library's median before and after, with the change as a ratio. A
 * library only one side measures is left out.
 */
const comparisonTable = (before: Table, after: Table): string => {
  const shared = after.columns.filter((c) => before.columns.includes(c));

  return [
    `| operation | ${shared.join(' | ')} |`,
    `| :-- | ${shared.map(() => '--:').join(' | ')} |`,
    ...after.rows.map((row, r) => {
      const cells = shared.map((column) => {
        const was =
          before.rows[r]?.values[before.columns.indexOf(column)] ?? Number.NaN;

        const now = row.values[after.columns.indexOf(column)] ?? Number.NaN;

        return `${was.toFixed(1)} → ${now.toFixed(1)} (${ratio(now, was)})`;
      });

      return `| ${row.operation} | ${cells.join(' | ')} |`;
    }),
  ].join('\n');
};

const ratio = (value: number, base: number): string =>
  Num.isNonZero(base) && !Number.isNaN(value) && !Number.isNaN(base)
    ? (`${Num.div(value, base).toFixed(2)}×` as const)
    : '–';

/** `Array#map` with an async callback, one element at a time. */
const mapInSequence = async <T, R>(
  items: readonly T[],
  fn: (item: T) => Promise<R>,
): Promise<readonly R[]> => {
  const [head, ...rest] = items;

  if (head === undefined) {
    return [];
  }

  const first = await fn(head);

  return Arr.toUnshifted(first)(await mapInSequence(rest, fn));
};

await main();
