import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Json,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Holds a package's breaking release until the changes stocked for it in its
 * `NEXT_MAJOR.md` have been made.
 *
 * A breaking change that is decided but not yet worth a release of its own is
 * written down as one item in `NEXT_MAJOR.md`, beside the package's
 * `package.json`:
 *
 * ```md
 * # Next major
 *
 * - Rename `foo` to `bar`.
 *
 *     Why it waits, and what a consumer has to change.
 *
 * ## Undecided
 *
 * - Drop the `baz` re-export.
 *
 *     What would decide it.
 * ```
 *
 * An item is a top-level list item, together with everything indented under
 * it. Write it in English and as a consumer will read it: applying it means
 * making the change, moving the item's text into the changeset that releases
 * it (whose body becomes the package's `CHANGELOG.md`), and deleting the item.
 * A file whose last item is gone is deleted too, so that a `NEXT_MAJOR.md`
 * exists exactly when something is waiting. Where the change is the removal
 * of an API, mark it `@deprecated` in the source as well, which is what tells
 * consumers ahead of time.
 *
 * An item under a heading reading `Undecided` is a candidate: a breaking
 * change that may or may not be made, or that waits on other work. It does
 * not hold a release — "not this time" is a candidate's normal answer, and
 * holding every breaking release on a question would only teach people to
 * delete it — but it is listed whenever a breaking release is pending, which
 * is the moment to decide. Deciding is moving it above the heading, or
 * deleting it when the answer is no.
 *
 * The check fails when
 *
 * - a changeset in `.changeset/` releases a package with a breaking bump —
 *   `major`, or `minor` while the package is still `0.x` — and that package's
 *   `NEXT_MAJOR.md` still has decided items: the release would go out without
 *   them, and the next chance is another breaking release;
 * - a `NEXT_MAJOR.md` has no items, or does not sit beside a `package.json`
 *   naming a package, so that nothing would ever hold a release for it.
 *
 * Because it fails on whichever comes second — the breaking changeset or the
 * item — the invariant holds on `main` in either order. It is a `check:prose`
 * guard because what it reads is Markdown: `code-check.yml` skips a diff that
 * touches only `**.md`, which is exactly what a changeset is.
 */
export const checkNextMajor = ({
  changesets,
  stocks,
}: Readonly<{
  changesets: readonly ChangesetFile[];
  stocks: readonly StockFile[];
}>): Result<Summary, string> => {
  const bumps = changesets.flatMap(({ file, content }) =>
    Array.from(parseChangesetBumps(content), ([name, bump]) => ({
      file,
      name,
      bump,
    })),
  );

  const results = stocks.map((stock) => checkStock(stock, bumps));

  const violations = results.flatMap(({ violation }) =>
    violation === undefined ? [] : [violation],
  );

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} problem(s) with ${STOCK_FILE_NAME}:`,
        '',
        ...violations.flatMap((violation) => [violation, '']),
        `What an item is and how one is applied: ${path.relative(projectRootPath, SELF)}.`,
      ].join('\n'),
    );
  }

  return Result.ok({
    stocks: stocks.length,
    decided: results.reduce((sum, { decided }) => sum + decided, 0),
    undecided: results.reduce((sum, { undecided }) => sum + undecided, 0),
    reminders: results.flatMap(({ reminder }) =>
      reminder === undefined ? [] : [reminder],
    ),
  });
};

/**
 * The packages a changeset's front matter names, with their bump. A file
 * without front matter — `README.md`, `config.json` — names none.
 */
export const parseChangesetBumps = (
  content: string,
): ReadonlyMap<string, Bump> => {
  const lines = content.split('\n');

  if (lines[0]?.trim() !== '---') {
    return new Map();
  }

  const end = lines.findIndex(
    (line, index) => index > 0 && line.trim() === '---',
  );

  if (end === -1) {
    return new Map();
  }

  return new Map(
    lines.slice(1, end).flatMap((line) => {
      const match = FRONT_MATTER_ENTRY.exec(line);

      const name = match?.[1];

      const bump = match?.[2];

      return isString(name) && isBump(bump) ? [[name, bump] as const] : [];
    }),
  );
};

/**
 * The top-level list items in a `NEXT_MAJOR.md`, outside fenced code blocks,
 * each by its first line and whether the nearest heading above it is
 * `Undecided`.
 */
export const listStockItems = (markdown: string): readonly StockItem[] =>
  markdown.split('\n').reduce<
    Readonly<{
      fence: string | undefined;
      undecided: boolean;
      items: readonly StockItem[];
    }>
  >(
    (state, line) => {
      const fenceMatch = FENCE.exec(line)?.[1];

      if (state.fence !== undefined) {
        return fenceMatch !== undefined &&
          fenceMatch[0] === state.fence[0] &&
          fenceMatch.length >= state.fence.length
          ? { ...state, fence: undefined }
          : state;
      }

      if (fenceMatch !== undefined) {
        return { ...state, fence: fenceMatch };
      }

      const heading = HEADING.exec(line)?.[1];

      if (heading !== undefined) {
        return {
          ...state,
          undecided: heading.trim().toLowerCase() === UNDECIDED_HEADING,
        };
      }

      const text = TOP_LEVEL_LIST_ITEM.exec(line)?.[1];

      return text === undefined
        ? state
        : {
            ...state,
            items: Arr.toPushed(state.items, {
              text,
              undecided: state.undecided,
            }),
          };
    },
    { fence: undefined, undecided: false, items: [] },
  ).items;

export type StockItem = Readonly<{
  /** The item's first line. */
  text: string;
  /** Whether it sits under the `Undecided` heading. */
  undecided: boolean;
}>;

export type ChangesetFile = Readonly<{
  /** Relative to the repository root. */
  file: string;
  content: string;
}>;

export type StockFile = Readonly<{
  /** Relative to the repository root. */
  file: string;
  content: string;
  /** The `package.json` beside it, or `undefined` when there is none. */
  manifest: Readonly<{ name: string; version: string }> | undefined;
}>;

type Summary = Readonly<{
  stocks: number;
  decided: number;
  undecided: number;
  /**
   * The undecided items of packages with a breaking release pending, one
   * paragraph per package. They hold nothing, so they are only reported.
   */
  reminders: readonly string[];
}>;

type Bump = 'major' | 'minor' | 'patch';

const STOCK_FILE_NAME = 'NEXT_MAJOR.md';

/** The heading, lowercased, whose items are candidates rather than decided. */
const UNDECIDED_HEADING = 'undecided';

const CHANGESET_DIR_NAME = '.changeset';

const SELF = path.resolve(
  projectRootPath,
  'tools/scripts/cmd/check-next-major.mts',
);

/** Matches `'pkg': patch`, `"pkg": minor` or `pkg: major`. */
const FRONT_MATTER_ENTRY = /^\s*['"]?(.+?)['"]?\s*:\s*(major|minor|patch)\s*$/u;

/** An opening or closing code fence, capturing its marker. */
const FENCE = /^\s{0,3}(`{3,}|~{3,})/u;

/** An ATX heading, capturing its text. */
const HEADING = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/u;

/** A list item at column 0, capturing its text. */
const TOP_LEVEL_LIST_ITEM = /^(?:[-*+]|\d+[.)])\s+(.*)$/u;

const isBump = (value: string | undefined): value is Bump =>
  value === 'major' || value === 'minor' || value === 'patch';

/**
 * Whether `bump` breaks consumers of a package at `version`: under semver a
 * `0.x` package signals a breaking change with its minor, and changesets
 * would take a `major` there to `1.0.0`, which is breaking as well.
 */
const isBreaking = (bump: Bump, version: string): boolean =>
  bump === 'major' || (bump === 'minor' && version.startsWith('0.'));

const checkStock = (
  { file, content, manifest }: StockFile,
  bumps: readonly Readonly<{ file: string; name: string; bump: Bump }>[],
): Readonly<{
  decided: number;
  undecided: number;
  violation: string | undefined;
  reminder: string | undefined;
}> => {
  const items = listStockItems(content);

  const decided = items.filter((item) => !item.undecided);

  const undecided = items.filter((item) => item.undecided);

  const counts = {
    decided: decided.length,
    undecided: undecided.length,
  } as const;

  if (manifest === undefined) {
    return {
      ...counts,
      violation: [
        `${file}: there is no package.json naming a package beside it, so no`,
        "release would ever be held for it. Move it into the package's",
        'directory.',
      ].join('\n'),
      reminder: undefined,
    };
  }

  if (!Arr.isNonEmpty(items)) {
    return {
      ...counts,
      violation: `${file}: has no items left. Delete it.`,
      reminder: undefined,
    };
  }

  // Several changesets may name the package; any breaking one is enough.
  const pending = bumps.find(
    ({ name, bump }) =>
      name === manifest.name && isBreaking(bump, manifest.version),
  );

  if (pending === undefined) {
    return { ...counts, violation: undefined, reminder: undefined };
  }

  const releasing = [
    `${file}: ${pending.file} releases`,
    `${manifest.name}@${manifest.version} with a breaking "${pending.bump}" bump.`,
  ] as const;

  const undecidedLines = Arr.isNonEmpty(undecided)
    ? ([
        '',
        'Undecided, and not holding it — decide each now: move it above the',
        '"Undecided" heading to make it with this release, delete it if it will',
        'not be made, or leave it for a later one:',
        '',
        ...undecided.map(({ text }) => `  - ${text}`),
      ] as const)
    : ([] as const);

  if (!Arr.isNonEmpty(decided)) {
    return {
      ...counts,
      violation: undefined,
      reminder: Arr.isNonEmpty(undecidedLines)
        ? [...releasing, ...undecidedLines].join('\n')
        : undefined,
    };
  }

  return {
    ...counts,
    violation: [
      ...releasing,
      '',
      'These are still waiting for it:',
      '',
      ...decided.map(({ text }) => `  - ${text}`),
      '',
      "Make each change, move the item's text into that changeset, and delete",
      'the item. Deleting an item without making the change only moves it to',
      'nowhere; if the release really has to go without one, move it under',
      '"Undecided" — which is for the author to decide.',
      ...undecidedLines,
    ].join('\n'),
    reminder: undefined,
  };
};

const readChangesets = async (): Promise<readonly ChangesetFile[]> => {
  const files = await glob(`${CHANGESET_DIR_NAME}/*.md`, {
    cwd: projectRootPath,
  });

  if (Result.isErr(files)) {
    throw new Error(
      `Failed to list ${CHANGESET_DIR_NAME}/: ${unknownToString(files.value)}`,
    );
  }

  return Promise.all(
    files.value.toSorted().map(async (file) => ({
      file,
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      content: await fs.readFile(path.resolve(projectRootPath, file), 'utf8'),
    })),
  );
};

const readStocks = async (): Promise<readonly StockFile[]> => {
  const files = await glob(`**/${STOCK_FILE_NAME}`, {
    cwd: projectRootPath,
    ignore: ['**/node_modules/**', '**/dist/**', 'experimental/**'],
  });

  if (Result.isErr(files)) {
    throw new Error(
      `Failed to list ${STOCK_FILE_NAME} files: ${unknownToString(files.value)}`,
    );
  }

  return Promise.all(
    files.value.toSorted().map(async (file) => ({
      file,
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      content: await fs.readFile(path.resolve(projectRootPath, file), 'utf8'),
      manifest: await readManifest(
        path.resolve(projectRootPath, path.dirname(file), 'package.json'),
      ),
    })),
  );
};

const readManifest = async (
  manifestPath: string,
): Promise<StockFile['manifest']> => {
  const content = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(manifestPath, 'utf8'),
  );

  if (Result.isErr(content)) {
    return undefined;
  }

  const parsed = Json.parse(content.value);

  if (
    Result.isErr(parsed) ||
    !isRecord(parsed.value) ||
    !hasKey(parsed.value, 'name') ||
    !hasKey(parsed.value, 'version')
  ) {
    return undefined;
  }

  const { name, version } = parsed.value;

  return isString(name) && isString(version) ? { name, version } : undefined;
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await Promise.all([readChangesets(), readStocks()])
    .then(([changesets, stocks]) => checkNextMajor({ changesets, stocks }))
    .catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  for (const reminder of result.value.reminders) {
    console.warn(`${reminder}\n`);
  }

  console.info(
    `${result.value.stocks} ${STOCK_FILE_NAME} file(s), ${result.value.decided} decided and ${result.value.undecided} undecided item(s) waiting; no breaking release leaves a decided one behind.`,
  );
}
