import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Num, Obj, Result, unknownToString } from 'ts-data-forge';
import type { NonEmptyTuple, ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';
import { type Embedded, embedInto, markerKeys } from './embed-markers.mjs';

/**
 * Reading `apps/synstate-dom-benchmark/RESULTS.md`, and the figures that place
 * synstate-dom among the libraries it measures.
 *
 * Two generators quote these figures: synstate-dom-docs' `gen:benchmark`, on
 * its benchmark pages, and the SynState site's `gen:benchmark-doc`, on the
 * pages that pitch synstate-dom on both sites, which also quote SynState's own
 * benchmark. Each page has one of them as its only writer, so neither
 * overwrites what the other filled in; this module is what both read, and what
 * `check:prose:synstate-dom-placement` checks the pages against.
 */

/** RESULTS.md, read and parsed. */
export const readResults = async (): Promise<Result<Results, string>> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const reading = fs.readFile(resultsPath, 'utf8');

  const markdown = await reading
    .then((text) => Result.ok(text))
    .catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(markdown)) {
    return Result.err(`${resultsPath}: ${markdown.value}`);
  }

  const parsed = parseResults(markdown.value);

  return Result.isErr(parsed)
    ? Result.err(`${resultsPath}: ${parsed.value}`)
    : parsed;
};

/**
 * The figures a sentence that places synstate-dom quotes, keyed as its markers
 * are: `worst/<library>` for synstate-dom and each library {@link placement}
 * puts well behind it, and `placement/behind`, the claim that it trails the
 * libraries ahead of it, written out for `locale` ("behind Solid, Preact and
 * Preact + Signals", 「Solid・Preact・Preact + Signals には及びません」). The
 * claim, verb included, is rendered rather than typed into each page, so a
 * change to {@link placement} rewrites every sentence, and no edit around the
 * marker can turn that claim into the opposite. What a page says about the
 * libraries well behind stays prose around their `worst/` figures.
 */
export const placementFigures = (
  operations: Table,
  locale: Locale,
): ReadonlyRecord<string, Embedded> => {
  const cases = worstCases(operations);

  return {
    ...Object.fromEntries(
      quotableWorst.map((library) => [
        worstKey(library),
        { text: worstOf(cases, library).toFixed(2), block: false },
      ]),
    ),
    'placement/behind': {
      text:
        locale === 'en'
          ? `behind ${englishList(placement.behind)}`
          : `${placement.behind.join('・')} には及びません`,
      block: false,
    },
  };
};

/**
 * Fills the `benchmark:` markers of a page that places synstate-dom from
 * {@link placementFigures}: the figures the page quotes, and always
 * `placement/behind`, so that a page that lost the claim fails rather than
 * keeping a stale one. With `otherMarkers: 'keep'`, a `benchmark:` marker that
 * is not one of those figures (a table of the benchmark page) is left as it is
 * rather than reported.
 */
export const embedPlacement = (
  page: string,
  operations: Table,
  locale: Locale,
  otherMarkers: 'reject' | 'keep' = 'reject',
): Result<string, string> => {
  const used = markerKeys(page, 'benchmark');

  return embedInto(
    page,
    'benchmark',
    Obj.filter(
      placementFigures(operations, locale),
      (_value, key) => key === 'placement/behind' || used.has(key),
    ),
    otherMarkers,
  );
};

/**
 * The language a page is written in, by where it sits: Starlight keeps every
 * translation under a directory named after its locale.
 */
export const pageLocale = (page: string): Locale =>
  page.split(path.sep).join('/').includes('/src/content/docs/ja/')
    ? 'ja'
    : 'en';

export const parseResults = (markdown: string): Result<Results, string> => {
  const environment =
    /Measured in `(?<userAgent>[^`]+)`\. Each figure is the median of (?<runs>\d+) runs of `pnpm run benchmark(?::next)?`/u.exec(
      markdown,
    );

  const userAgent = environment?.groups?.['userAgent'];

  const runs = environment?.groups?.['runs'];

  if (userAgent === undefined || runs === undefined) {
    return Result.err(
      'the "Measured in …. Each figure is the median of N runs" sentence was not found; update parseResults to its new wording',
    );
  }

  // The medians of the operations, the first table, and those of the scenarios,
  // the first table after their heading. RESULTS.md's ratio tables are
  // recomputed below, so that the Japanese page can head them in
  // Japanese.
  const lines = markdown.split('\n').map((line) => line.trim());

  const operations = parseTable(lines, 0, false);

  if (Result.isErr(operations)) {
    return operations;
  }

  const scenariosHeading = lines.indexOf('## Scenarios');

  if (scenariosHeading === -1) {
    return Result.err('the "## Scenarios" section was not found');
  }

  const scenarios = parseTable(lines, scenariosHeading, true);

  if (Result.isErr(scenarios)) {
    return scenarios;
  }

  const { libraries } = operations.value;

  if (
    !libraries.includes(subject) ||
    !libraries.includes(reference) ||
    !scenarios.value.libraries.includes(subject)
  ) {
    return Result.err(
      `a table has no "${subject}" column, or the first no "${reference}" column`,
    );
  }

  return Result.ok({
    userAgent,
    runs: Result.unwrapOkOr(Num.safeParseFloat(runs), Number.NaN),
    operations: operations.value,
    scenarios: scenarios.value,
  });
};

/** `parseResults` has already rejected a median that is not positive. */
export const ratioOf = (value: number, base: number): number =>
  Num.isNonZero(base) ? Num.div(value, base) : Number.NaN;

/**
 * Each library's slowest operation: the operation where its time is the largest
 * multiple of the fastest library's, and that multiple. This is how far behind
 * a library can fall on the table, the measure synstate's own benchmark judges
 * speed by.
 */
export const worstCases = (
  table: Table,
): readonly Readonly<{
  library: string;
  operation: string;
  overFastest: number;
}>[] =>
  table.libraries.map((library, column) => {
    const spreads = table.rows.map(({ operation, medians: ms }) => ({
      operation,
      overFastest: ratioOf(ms[column] ?? Number.NaN, Math.min(...ms)),
    }));

    // Seeded with NaN, which any ratio replaces: a library with no ratio stays
    // NaN, which bears out no placement, rather than -Infinity.
    const worst = spreads.reduce(
      (a, b) =>
        Number.isNaN(a.overFastest) || b.overFastest > a.overFastest ? b : a,
      { operation: '', overFastest: Number.NaN },
    );

    return { library, ...worst };
  });

/** `A`, `A and B`, `A, B and C`. */
export const englishList = (names: readonly string[]): string => {
  if (!Arr.isNonEmpty(names)) {
    return '';
  }

  const init = Arr.butLast(names);

  return Arr.isNonEmpty(init)
    ? `${init.join(', ')} and ${Arr.last(names).value}`
    : Arr.last(names).value;
};

/** The marker key of a library's slowest operation: `worst/preact-signals`. */
export const worstKey = (library: string): string =>
  `worst/${library
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, '-')
    .replaceAll(/^-|-$/gu, '')}` as const;

/**
 * Checks the sentences that place synstate-dom by the libraries' slowest
 * operations against the table, and that every library of the table is placed.
 */
export const checkPlacement = (
  operations: Table,
): Result<undefined, string> => {
  const cases = worstCases(operations);

  const subjectWorst = worstOf(cases, subject);

  const placed: readonly string[] = [
    subject,
    ...placement.behind,
    ...placement.wellAhead,
  ] as const;

  const unplaced = operations.libraries.filter(
    (library) => !placed.includes(library),
  );

  // A missing time (NaN) fails both: it bears out no placement.
  const misplaced = [
    ...placement.behind.filter(
      (library) =>
        Number.isNaN(worstOf(cases, library)) ||
        worstOf(cases, library) >= subjectWorst,
    ),
    ...placement.wellAhead.filter(
      (library) =>
        Number.isNaN(worstOf(cases, library)) ||
        worstOf(cases, library) < WELL_AHEAD * subjectWorst,
    ),
  ] as const;

  if (Arr.isNonEmpty(unplaced) || Arr.isNonEmpty(misplaced)) {
    return Result.err(
      `the sentences that place synstate-dom by each library's slowest operation (${[...placementPages, ...benchmarkPages].map((page) => path.relative(projectRootPath, page)).join(', ')}) no longer hold for ${[...unplaced, ...misplaced].join(', ')} (synstate-dom ${subjectWorst.toFixed(2)}×; ${cases.map((c) => `${c.library} ${c.overFastest.toFixed(2)}×`).join(', ')}): update \`placement\` in tools/scripts/lib/synstate-dom-benchmark-results.mts, which renders the libraries ahead into every page, and reword by hand what those pages say about the libraries well behind`,
    );
  }

  return Result.ok(undefined);
};

const resultsPath = path.resolve(
  projectRootPath,
  'apps/synstate-dom-benchmark/RESULTS.md',
);

/**
 * The pages that place synstate-dom among the libraries of
 * js-framework-benchmark beside SynState's own benchmark: synstate-dom-docs'
 * introduction and landing page, and the SynState site's synstate-dom
 * introduction. The SynState site's `gen:benchmark-doc` is their one writer;
 * `check:prose:synstate-dom-placement` checks that they are current.
 */
export const placementPages: readonly string[] = [
  'apps/synstate-dom-docs/src/content/docs/getting-started/introduction.md',
  'apps/synstate-dom-docs/src/content/docs/ja/getting-started/introduction.md',
  'apps/synstate-dom-docs/src/content/docs/index.mdx',
  'apps/synstate-dom-docs/src/content/docs/ja/index.mdx',
  'apps/synstate-docs/src/content/docs/synstate-dom/introduction.mdx',
  'apps/synstate-docs/src/content/docs/ja/synstate-dom/introduction.mdx',
].map((page) => path.resolve(projectRootPath, page));

/**
 * synstate-dom-docs' benchmark pages, whose one writer is its `gen:benchmark`.
 * They carry the tables and the same placement figures, which
 * `check:prose:synstate-dom-placement` checks too.
 */
export const benchmarkPages: readonly string[] = [
  'apps/synstate-dom-docs/src/content/docs/background/benchmark.md',
  'apps/synstate-dom-docs/src/content/docs/ja/background/benchmark.md',
].map((page) => path.resolve(projectRootPath, page));

export type Locale = 'en' | 'ja';

export type Results = Readonly<{
  userAgent: string;
  runs: number;
  operations: Table;
  scenarios: Table;
}>;

/**
 * One of RESULTS.md's tables of medians. A scenario's median is `NaN` where the
 * library rendered the wrong figures, which RESULTS.md writes `wrong`.
 */
export type Table = Readonly<{
  libraries: readonly string[];
  rows: readonly Readonly<{
    operation: string;
    medians: readonly number[];
  }>[];
}>;

/**
 * The library every ratio on the page is measured against, as RESULTS.md's own
 * second table does.
 */
export const subject = 'synstate-dom';

/** The library the page's summary sentence compares {@link subject} with. */
export const reference = 'Solid';

/**
 * The libraries whose slowest operation is faster than synstate-dom's, and
 * those whose slowest is at least {@link WELL_AHEAD} times as slow, as the
 * sentences that place synstate-dom say: "behind Solid, Preact and Preact +
 * Signals, and well ahead of React (and VanJS)". The "behind" claim in those
 * sentences is rendered from here ({@link placementFigures}); the "well ahead"
 * one is prose around the figures it quotes, which this checks but does not
 * write.
 */
// `behind` is non-empty by type: the claim it renders has no wording for no
// library, and a synstate-dom that is ahead of every library needs a sentence
// of its own.
const placement: Readonly<{
  behind: NonEmptyTuple<string>;
  wellAhead: readonly string[];
}> = {
  behind: ['Solid', 'Preact', 'Preact + Signals'],
  wellAhead: ['React', 'VanJS'],
} as const;

/** How many times synstate-dom's slowest operation "well ahead" means. */
const WELL_AHEAD = 2;

/**
 * The libraries a page may quote the slowest operation of, as
 * `worst/<library>`: synstate-dom, and those {@link checkPlacement} has found
 * {@link WELL_AHEAD} times as slow. A sentence that quotes another library's
 * figure therefore has no marker to quote it through.
 */
const quotableWorst = Arr.toUnshifted(subject)(placement.wellAhead);

/** What RESULTS.md writes in place of a time for the wrong figures. */
const wrong = 'wrong';

/** A library's slowest operation over the fastest, from {@link worstCases}. */
const worstOf = (
  cases: ReturnType<typeof worstCases>,
  library: string,
): number =>
  cases.find((c) => c.library === library)?.overFastest ?? Number.NaN;

const cells = (line: string): readonly string[] =>
  line
    .replace(/^\|/u, '')
    .replace(/\|$/u, '')
    .split('|')
    .map((cell) => cell.trim());

/**
 * Reads the first table at or after line `from`. Where `wrongAllowed`, a
 * `wrong` cell is read as `NaN`; any other cell must be a positive number.
 */
const parseTable = (
  lines: readonly string[],
  from: number,
  wrongAllowed: boolean,
): Result<Table, string> => {
  const tableStart = lines.findIndex(
    (line, i) => i >= from && line.startsWith('|'),
  );

  const tableEnd = lines.findIndex(
    (line, i) => i > tableStart && !line.startsWith('|'),
  );

  const tableLines =
    tableStart === -1
      ? ([] as const)
      : lines.slice(tableStart, tableEnd === -1 ? undefined : tableEnd);

  const [header, _separator, ...body] = tableLines;

  if (header === undefined || !Arr.isNonEmpty(body)) {
    return Result.err('no result table was found');
  }

  const libraries = Arr.tail(cells(header));

  const mut_rows: Table['rows'][number][] = [];

  for (const line of body) {
    const [operation, ...values] = cells(line);

    const medians = values.map((value) =>
      wrongAllowed && value === wrong
        ? Number.NaN
        : Result.unwrapOkOr(Num.safeParseFloat(value), Number.NaN),
    );

    if (
      operation === undefined ||
      medians.length !== libraries.length ||
      medians.some(
        (m, i) =>
          !(Number.isFinite(m) && m > 0) &&
          !(wrongAllowed && values[i] === wrong),
      )
    ) {
      return Result.err(`a row could not be read: ${line}`);
    }

    mut_rows.push({ operation, medians });
  }

  return Result.ok({ libraries, rows: mut_rows });
};
