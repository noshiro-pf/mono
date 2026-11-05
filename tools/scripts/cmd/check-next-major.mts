import { spawnSync } from 'node:child_process';
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
import {
  isBreaking,
  isBreakingRelease,
  listChangesetBumps,
  type Bump,
  type ChangesetFile,
} from '../lib/changesets.mjs';
import { resolveDiffBase } from '../lib/diff-base.mjs';
import { markdownLines } from '../lib/markdown.mjs';
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
 * An item is a top-level list item, together with everything indented under it.
 * Write it in English and as a consumer will read it: applying it means making
 * the change, moving the item's text into the changeset that releases it (whose
 * body becomes the package's `CHANGELOG.md`), and deleting the item.
 * A file whose last item is gone is deleted too, so that a `NEXT_MAJOR.md`
 * exists exactly when something is waiting. Where the change is the removal of
 * an API, mark it `@deprecated` in the source as well, which is what tells
 * consumers ahead of time.
 *
 * An item under a heading reading `Undecided` is a candidate: a breaking change
 * that may or may not be made, or that waits on other work. It does not hold a
 * release — "not this time" is a candidate's normal answer, and holding every
 * breaking release on a question would only teach people to delete it — but it
 * is listed on the version pull request, which is the moment to decide.
 * Deciding is moving it above the heading, or deleting it when the answer is
 * no.
 *
 * The check fails when
 *
 * - the tree raises a package's version past `PROSE_DIFF_BASE` with a
 *   breaking release — a new major, or a new minor while the package is still
 *   `0.x` — and that package's `NEXT_MAJOR.md` still has decided items: the
 *   release would go out without them, and the next chance is another
 *   breaking release;
 * - a `NEXT_MAJOR.md` has no items, or does not sit beside a `package.json`
 *   naming a package, so that nothing would ever hold a release for it.
 *
 * Only the version pull request raises a version, so the first case holds that
 * and nothing else. A breaking changeset may reach `main` ahead of the pull
 * requests that apply the remaining items — a stack of them, applying one item
 * each, is the usual shape — and the release waits for them there.
 * `next-major-reminder.mts` lists what it is waiting for on the version pull
 * request from the moment the changeset lands.
 *
 * `PROSE_DIFF_BASE` is the commit the versions are compared with: the base of
 * the pull request in CI, which `style-check.yml` fetches and sets, and
 * otherwise the merge base of `HEAD` and `origin/main` (`resolveDiffBase`). It is a `check:prose`
 * guard because what it reads is Markdown and `package.json`, and the version
 * pull request touches only those.
 */
export const checkNextMajor = ({
  stocks,
  baseVersions,
}: Readonly<{
  stocks: readonly StockFile[];
  /** The version of each package at the base, by name. */
  baseVersions: ReadonlyMap<string, string>;
}>): Result<Summary, string> => {
  const results = stocks.map((stock) => checkStock(stock, baseVersions));

  const violations = Arr.generate(function* () {
    for (const { violation } of results) {
      if (violation !== undefined) {
        yield violation;
      }
    }
  });

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
  });
};

/**
 * The open items of every package a changeset gives a breaking bump: what
 * `release.yml` lists on the version pull request, read from `main` before
 * `changeset version` consumes `.changeset/`.
 */
export const listReminders = ({
  changesets,
  stocks,
}: Readonly<{
  changesets: readonly ChangesetFile[];
  stocks: readonly StockFile[];
}>): readonly Reminder[] => {
  const bumps = listChangesetBumps(changesets);

  return Arr.generate(function* () {
    for (const { file, content, manifest } of stocks) {
      if (manifest === undefined) {
        continue;
      }

      // Several changesets may name the package; any breaking one is enough.
      const pending = bumps.find(
        ({ name, bump }) =>
          name === manifest.name && isBreaking(bump, manifest.version),
      );

      const items = listStockItems(content);

      if (pending !== undefined && Arr.isNonEmpty(items)) {
        yield {
          file,
          name: manifest.name,
          version: manifest.version,
          changeset: pending.file,
          bump: pending.bump,
          decided: items
            .filter((item) => !item.undecided)
            .map(({ text }) => text),
          undecided: items
            .filter((item) => item.undecided)
            .map(({ text }) => text),
        } as const;
      }
    }
  });
};

/**
 * The top-level list items in a `NEXT_MAJOR.md`, outside fenced code blocks,
 * each by its first line and whether the nearest heading above it is
 * `Undecided`.
 */
export const listStockItems = (markdown: string): readonly StockItem[] =>
  markdownLines(markdown).reduce<
    Readonly<{
      undecided: boolean;
      items: readonly StockItem[];
    }>
  >(
    (state, { text: line, fenced }) => {
      if (fenced) {
        return state;
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
    { undecided: false, items: [] },
  ).items;

export type StockItem = Readonly<{
  /** The item's first line. */
  text: string;
  /** Whether it sits under the `Undecided` heading. */
  undecided: boolean;
}>;

export type StockFile = Readonly<{
  /** Relative to the repository root. */
  file: string;
  content: string;
  /** The `package.json` beside it, or `undefined` when there is none. */
  manifest: Readonly<{ name: string; version: string }> | undefined;
}>;

/** A package's open items, while a changeset gives it a breaking bump. */
export type Reminder = Readonly<{
  /** The `NEXT_MAJOR.md`, relative to the repository root. */
  file: string;
  name: string;
  /** The version the breaking release starts from. */
  version: string;
  /** The changeset giving the breaking bump. */
  changeset: string;
  bump: Bump;
  /** The first line of each decided item, which holds the release. */
  decided: readonly string[];
  /** The first line of each undecided item. */
  undecided: readonly string[];
}>;

type Summary = Readonly<{
  stocks: number;
  decided: number;
  undecided: number;
}>;

const STOCK_FILE_NAME = 'NEXT_MAJOR.md';

/** The heading, lowercased, whose items are candidates rather than decided. */
const UNDECIDED_HEADING = 'undecided';

const SELF = path.resolve(
  projectRootPath,
  'tools/scripts/cmd/check-next-major.mts',
);

/** An ATX heading, capturing its text. */
const HEADING = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/u;

/** A list item at column 0, capturing its text. */
const TOP_LEVEL_LIST_ITEM = /^(?:[-*+]|\d+[.)])\s+(.*)$/u;

export const readStocks = async (): Promise<readonly StockFile[]> => {
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

const checkStock = (
  { file, content, manifest }: StockFile,
  baseVersions: ReadonlyMap<string, string>,
): Readonly<{
  decided: number;
  undecided: number;
  violation: string | undefined;
}> => {
  const items = listStockItems(content);

  const decided = items.filter((item) => !item.undecided);

  const counts = {
    decided: decided.length,
    undecided: items.length - decided.length,
  } as const;

  if (manifest === undefined) {
    return {
      ...counts,
      violation: [
        `${file}: there is no package.json naming a package beside it, so no`,
        "release would ever be held for it. Move it into the package's",
        'directory.',
      ].join('\n'),
    };
  }

  if (!Arr.isNonEmpty(items)) {
    return {
      ...counts,
      violation: `${file}: has no items left. Delete it.`,
    };
  }

  const baseVersion = baseVersions.get(manifest.name);

  if (
    baseVersion === undefined ||
    !isBreakingRelease(baseVersion, manifest.version) ||
    !Arr.isNonEmpty(decided)
  ) {
    return { ...counts, violation: undefined };
  }

  return {
    ...counts,
    violation: [
      `${file}: this tree releases ${manifest.name}@${manifest.version}, a breaking`,
      `release from ${baseVersion}. These are still waiting for it:`,
      '',
      ...decided.map(({ text }) => `  - ${text}`),
      '',
      'Merge the pull requests making them first; release.yml then rebuilds',
      "this one. Making a change is moving the item's text into the changeset",
      'that releases it and deleting the item; deleting it without making the',
      'change only moves it to nowhere. If the release really has to go',
      'without one, move it under "Undecided" — which is for the author to',
      'decide.',
    ].join('\n'),
  };
};

const parseManifest = (content: string): StockFile['manifest'] => {
  const parsed = Json.parse(content);

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

/**
 * The version of each stocked package at `base`, by name. A package whose
 * `package.json` the base does not have is left out: its first release is
 * manual (`libs/first-release.md`).
 */
const readBaseVersions = (
  base: string,
  stocks: readonly StockFile[],
): ReadonlyMap<string, string> =>
  new Map(
    Arr.generate(function* () {
      for (const { file } of stocks) {
        const shown = spawnSync(
          'git',
          [
            'show',
            `${base}:${path.posix.join(path.posix.dirname(file), 'package.json')}`,
          ],
          { cwd: projectRootPath, encoding: 'utf8' },
        );

        const manifest =
          shown.status === 0 ? parseManifest(shown.stdout) : undefined;

        if (manifest !== undefined) {
          yield [manifest.name, manifest.version] as const;
        }
      }
    }),
  );

const readManifest = async (
  manifestPath: string,
): Promise<StockFile['manifest']> => {
  const content = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(manifestPath, 'utf8'),
  );

  return Result.isErr(content) ? undefined : parseManifest(content.value);
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await readStocks()
    .then((stocks) => {
      const base = resolveDiffBase('compare versions with');

      return Result.map(
        checkNextMajor({
          stocks,
          baseVersions: readBaseVersions(base, stocks),
        }),
        (summary) => ({ ...summary, base }),
      );
    })
    .catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value.stocks} ${STOCK_FILE_NAME} file(s), ${result.value.decided} decided and ${result.value.undecided} undecided item(s) waiting; no release since ${result.value.base} leaves a decided one behind.`,
  );
}
