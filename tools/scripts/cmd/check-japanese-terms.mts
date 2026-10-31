import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  listTrackedFiles,
  readRepositoryFile,
  TEXT_EXTENSIONS,
} from '../lib/repo-files.mjs';

/**
 * Fails when a Japanese term is spelled other than the way its scope settled
 * on.
 *
 * Japanese has more than one accepted spelling for many loanwords and technical
 * terms, and a site that mixes them reads as two authors who never met —
 * sometimes within one page. Nothing else notices: cspell does not read
 * Japanese, and each spelling is correct on its own, so review passes either.
 * A term goes in {@link JAPANESE_TERMS} once a scope has picked its spelling,
 * with the scope it was unified over.
 *
 * Everything in a scanned file is read, code included: the strings the docs
 * site generates its pages from (`scripts/benchmark-numbers.mts`) and the
 * labels its components draw are the same prose by other means, and a heading
 * anchor spelled the other way is a link that someone will write the other way
 * too.
 *
 * A `CHANGELOG.md` is not read: `changeset version` writes it from the
 * changesets, and an entry already released is a record, not a page to rewrite.
 */
export const checkJapaneseTerms = async (): Promise<
  Result<CheckSummary, string>
> => {
  const trackedResult = await listTrackedFiles();

  if (Result.isErr(trackedResult)) {
    return Result.err(trackedResult.value);
  }

  const files = trackedResult.value
    .filter(
      (relativePath) =>
        TEXT_EXTENSIONS.has(path.extname(relativePath)) &&
        path.basename(relativePath) !== 'CHANGELOG.md' &&
        !IGNORED_PATHS.has(relativePath),
    )
    .map((relativePath) => ({ relativePath, terms: termsFor(relativePath) }))
    .filter(({ terms }) => Arr.isNonEmpty(terms));

  const results = await Promise.all(
    files.map(async ({ relativePath, terms }) =>
      Result.map(await readRepositoryFile(relativePath), (fileText) =>
        findVariantSpellings(fileText, terms).map((found) => ({
          relativePath,
          ...found,
        })),
      ),
    ),
  );

  const firstError = results.find(Result.isErr);

  if (firstError !== undefined) {
    return Result.err(firstError.value);
  }

  const violations = results.flatMap((result) =>
    Result.isErr(result) ? [] : result.value,
  );

  return Arr.isNonEmpty(violations)
    ? Result.err(formatViolations(violations))
    : Result.ok({ files: files.length });
};

/**
 * Every occurrence in `fileText` of a variant one of `terms` forbids, line by
 * line and, within a line, from left to right.
 *
 * An occurrence that lies inside the term's preferred spelling is not one:
 * a variant may be part of the spelling it gives way to (a long-vowel loanword
 * written without its `ー` is a prefix of the one written with it), and
 * reporting it there would ask for a rewrite that changes nothing.
 */
export const findVariantSpellings = (
  fileText: string,
  terms: readonly JapaneseTerm[],
): readonly TermViolation[] =>
  fileText.split('\n').flatMap((lineText, index) =>
    terms
      .filter(({ variants }) =>
        variants.some((variant) => lineText.includes(variant)),
      )
      .flatMap(({ preferred, variants }) => {
        const preferredStarts = indicesOf(lineText, preferred);

        return variants.flatMap((variant) =>
          indicesOf(lineText, variant)
            .filter((column) =>
              preferredStarts.every(
                (start) =>
                  start > column ||
                  column + variant.length > start + preferred.length,
              ),
            )
            .map((column) => ({
              line: index + 1,
              column: column + 1,
              variant,
              preferred,
            })),
        );
      })
      .toSorted((a, b) => a.column - b.column),
  );

/** The terms whose scope covers `relativePath`. */
export const termsFor = (relativePath: string): readonly JapaneseTerm[] =>
  JAPANESE_TERMS.filter(({ scope }) =>
    scope.some((prefix) => relativePath.startsWith(prefix)),
  );

export type JapaneseTerm = Readonly<{
  /** The spelling the scope uses. */
  preferred: string;
  /** The spellings it does not. */
  variants: readonly string[];
  /**
   * Path prefixes, relative to the repository root, that have been unified on
   * {@link preferred}. A term is added for a scope only once every occurrence
   * in it has been rewritten, so widening one is that rewrite first.
   */
  scope: readonly string[];
}>;

export type TermViolation = Readonly<{
  /** 1-based. */
  line: number;
  /** 1-based, in UTF-16 code units, at the variant's first character. */
  column: number;
  variant: string;
  preferred: string;
}>;

type CheckSummary = Readonly<{
  files: number;
}>;

/**
 * The terms whose spelling has been settled, and where.
 *
 * The SynState docs site was unified on ダイヤモンド and 伝搬 (#2708), which
 * were already the majority there. The other spelling of the second is still
 * written elsewhere in the repository (`git grep` for the variant lists where),
 * and adding a prefix to a scope is that rewrite first.
 */
export const JAPANESE_TERMS: readonly JapaneseTerm[] = [
  {
    preferred: 'ダイヤモンド',
    variants: ['ダイアモンド'],
    scope: ['apps/synstate-docs/'],
  },
  {
    preferred: '伝搬',
    variants: ['伝播'],
    scope: ['apps/synstate-docs/'],
  },
] as const;

/**
 * This check's own source and fixtures, which spell every variant on purpose:
 * the table above is made of them, and the tests are inputs the check has to
 * report. Exact paths, so that a scope widened over `tools/` still reads every
 * other file there.
 */
const IGNORED_PATHS: ReadonlySet<string> = new Set<string>([
  'tools/scripts/cmd/check-japanese-terms.mts',
  'tools/scripts/cmd/check-japanese-terms.test.mts',
]);

/**
 * Every index at which `searched` starts in `text`, overlapping or not. An
 * empty `searched` has none, rather than one at every index.
 */
const indicesOf = (text: string, searched: string): readonly number[] =>
  Arr.generate(function* () {
    if (searched === '') {
      return;
    }

    for (
      let mut_index = text.indexOf(searched);
      mut_index !== -1;
      mut_index = text.indexOf(searched, mut_index + 1)
    ) {
      yield mut_index;
    }
  });

const formatViolations = (
  violations: readonly (TermViolation & Readonly<{ relativePath: string }>)[],
): string =>
  [
    `❌ ${violations.length} Japanese term(s) spelled other than the way their`,
    '   scope settled on:',
    '',
    ...violations.map(
      ({ relativePath, line, column, variant, preferred }) =>
        `  ${relativePath}:${line}:${column}  ${variant} → ${preferred}`,
    ),
    '',
    'Rewrite each to the spelling shown. A heading changes its anchor with it,',
    'so rewrite the links to it in the same change; `check:prose:site-fragments`',
    'names any that are left. The terms and their scopes are `JAPANESE_TERMS` in',
    'tools/scripts/cmd/check-japanese-terms.mts.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkJapaneseTerms().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `Japanese terms are spelled as settled (${result.value.files} files read).`,
  );
}
