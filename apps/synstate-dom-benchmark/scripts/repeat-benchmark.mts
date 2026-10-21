import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import * as util from 'node:util';
import { Arr, asUint32, isPositiveUint32, Num, Result } from 'ts-data-forge';
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

    const medians = medianTable(rounds.map((r) => r.current));

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
        `| operation (median ms) | ${medians.columns.join(' | ')} |`,
        `| :-- | ${medians.columns.map(() => '--:').join(' | ')} |`,
        ...medians.rows.map(
          (row) =>
            `| ${row.operation} | ${row.values.map((v) => v.toFixed(2)).join(' | ')} |`,
        ),
        '',
        '## Relative to synstate-dom',
        '',
        "Each library's time divided by synstate-dom's: below 1 is faster than synstate-dom, above 1 slower.",
        '',
        ratioTable(medians),
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
            medianTable(rounds.flatMap((r) => r.baseline ?? [])),
            medians,
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

const synstateDomColumn = 'synstate-dom';

const repoRoot = path.resolve(workspaceRootPath, '../..');

const appPathInRepo = path.relative(repoRoot, workspaceRootPath);

const appIn = (root: string): string => path.join(root, appPathInRepo);

const resultsPath = (appRoot: string): string =>
  path.join(appRoot, 'RESULTS.md');

const readResults = async (appRoot: string): Promise<string> =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFile(resultsPath(appRoot), 'utf8');

/** Runs the benchmark once in `appRoot` and reads the table it wrote. */
const runOnce = async (appRoot: string, rotate: number): Promise<Table> => {
  run('pnpm', ['run', 'benchmark'], appRoot, {
    BENCHMARK_ROTATE: String(rotate),
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

  run('pnpm', ['--filter', 'synstate-dom-benchmark^...', 'run', 'build'], root);

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
      `${Arr.toUnshifted(command)(args).join(' ')} failed in ${cwd} (exit ${String(result.status)})`,
    );
  }
};

/** Reads the table `pnpm run benchmark` writes into RESULTS.md. */
const parseResults = (markdown: string): Table => {
  const lines = markdown.split('\n').filter((line) => line.startsWith('|'));

  const [header, , ...body] = lines;

  if (header === undefined) {
    throw new Error('RESULTS.md has no table');
  }

  const [, ...columns] = cellsOf(header);

  return {
    columns,
    rows: body.map((line) => {
      const [operation = '', ...values] = cellsOf(line);

      return { operation, values: values.map(Number) };
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

/** The median of each cell over `tables`, which must share their layout. */
const medianTable = (tables: readonly Table[]): Table => {
  const [first] = tables;

  if (first === undefined) {
    throw new Error('no runs');
  }

  return {
    columns: first.columns,
    rows: first.rows.map((row, r) => ({
      operation: row.operation,
      values: first.columns.map((_, c) =>
        median(tables.map((t) => t.rows[r]?.values[c] ?? Number.NaN)),
      ),
    })),
  };
};

const median = (samples: readonly number[]): number => {
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
  Num.isNonZero(base) ? (`${Num.div(value, base).toFixed(2)}×` as const) : '–';

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
