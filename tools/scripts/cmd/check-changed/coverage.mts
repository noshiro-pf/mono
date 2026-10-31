import * as path from 'node:path';
import { Arr, Num, Result } from 'ts-data-forge';

/**
 * Line hits from an `lcov.info`, by repository-relative path.
 *
 * Vitest writes `SF:` relative to the package it ran in, and
 * `normalize-coverage-paths.mts` rewrites that to name the package; an absolute
 * path is possible too. All three are resolved to the same
 * repository-relative path, so a report reads the same whichever wrote it.
 *
 * Only `DA:<line>,<hits>` records are read. A line with no `DA` record is not
 * executable (a comment, a type, a blank line), which is why the report below
 * asks about lines the report knows and leaves the rest alone.
 */
export const parseLcov = ({
  lcov,
  packageDir,
  rootDir,
}: Readonly<{
  lcov: string;
  /** Absolute directory the report's relative `SF:` paths start from. */
  packageDir: string;
  /** Absolute repository root. */
  rootDir: string;
}>): ReadonlyMap<string, ReadonlyMap<number, number>> => {
  const mut_result = new Map<string, Map<number, number>>();

  const packagePrefix = toPosix(path.relative(rootDir, packageDir));

  const mut_current: { hits: Map<number, number> | undefined } = {
    hits: undefined,
  };

  for (const rawLine of lcov.split('\n')) {
    const line = rawLine.trim();

    if (line.startsWith('SF:')) {
      const source = line.slice('SF:'.length);

      const absolute = path.isAbsolute(source)
        ? source
        : packagePrefix !== '' &&
            toPosix(source).startsWith(`${packagePrefix}/`)
          ? path.resolve(rootDir, source)
          : path.resolve(packageDir, source);

      const file = toPosix(path.relative(rootDir, absolute));

      const hits = mut_result.get(file) ?? new Map<number, number>();

      mut_result.set(file, hits);

      mut_current.hits = hits;

      continue;
    }

    if (line === 'end_of_record') {
      mut_current.hits = undefined;

      continue;
    }

    const record = DA_RECORD.exec(line);

    if (record === null || mut_current.hits === undefined) {
      continue;
    }

    const lineNumber = toInt(record[1]);

    const count = toInt(record[2]);

    mut_current.hits.set(
      lineNumber,
      (mut_current.hits.get(lineNumber) ?? 0) + count,
    );
  }

  return mut_result;
};

/**
 * The changed lines no test executes: lines the coverage report knows as
 * executable, with zero hits, that the diff added or changed.
 *
 * A changed file the report does not mention at all is left out, because
 * absence means the coverage `include` does not reach it (a script, a config, a
 * test), not that nothing runs it.
 */
export const uncoveredChangedLines = ({
  changedLines,
  coverage,
}: Readonly<{
  changedLines: ReadonlyMap<string, readonly number[]>;
  coverage: ReadonlyMap<string, ReadonlyMap<number, number>>;
}>): ReadonlyMap<string, readonly number[]> =>
  new Map(
    Arr.generate(function* () {
      for (const [file, lines] of changedLines) {
        const hits = coverage.get(file);

        const missed =
          hits === undefined
            ? ([] as const)
            : lines.filter((line) => hits.get(line) === 0);

        if (Arr.isNonEmpty(missed)) {
          yield [file, missed] as const;
        }
      }
    }),
  );

/** A capture of `\d+`, or `NaN` for anything else. */
const toInt = (digits: string | undefined): number =>
  Result.unwrapOkOr(Num.safeParseInt(digits ?? ''), Number.NaN);

const toPosix = (p: string): string => p.split(path.sep).join('/');

const DA_RECORD = /^DA:(\d+),(\d+)/u;
