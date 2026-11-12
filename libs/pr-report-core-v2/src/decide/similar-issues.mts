/**
 * Which open issues a new one may repeat. `create` refuses a title close to an
 * open issue's until the filer says it is not that one, and `similar` lists
 * what to read before writing one (`docs/issue-priority.md`).
 *
 * Titles are compared as sets of words: ASCII words of three characters or more
 * that are not filler, and Japanese by pairs of characters, since it has no
 * spaces to split on. Two sets are as close as the Dice coefficient says.
 * A title is a summary its author chose, so two reports of one problem share
 * the names in it — the package, the function, the symptom.
 */

import { Arr, Num } from 'ts-data-forge';

/** How close two titles are, from 0 (no word shared) to 1 (the same words). */
export const titleSimilarity = (a: string, b: string): number =>
  wordSimilarity(titleWords(a), titleWords(b));

/**
 * The open issues whose title is at least {@link DUPLICATE_THRESHOLD} close to
 * `title`, the closest first, leaving out the ones the filer has said it is
 * not.
 */
export const duplicateSuspects = (
  title: string,
  issues: readonly OpenIssueText[],
  notDuplicates: readonly number[],
): readonly ScoredIssue[] => {
  const words = titleWords(title);

  return issues
    .filter(({ number }) => !notDuplicates.includes(number))
    .map((issue) => ({
      ...issue,
      score: wordSimilarity(words, titleWords(issue.title)),
      keywords: [],
    }))
    .filter(({ score }) => score >= DUPLICATE_THRESHOLD)
    .toSorted(byCloseness);
};

/**
 * The open issues to read before filing one: those whose title is at least
 * {@link SIMILAR_FLOOR} close, and those whose title or body names one of the
 * keywords as written (a function, a file, a rule): those naming the most
 * keywords first, then the closest titles.
 */
export const similarIssues = (
  query: Readonly<{ title: string; keywords: readonly string[] }>,
  issues: readonly OpenIssueText[],
): readonly ScoredIssue[] => {
  const words = titleWords(query.title);

  return issues
    .map((issue) => ({
      ...issue,
      score: wordSimilarity(words, titleWords(issue.title)),
      keywords: query.keywords.filter((keyword) =>
        namesKeyword(`${issue.title}\n${issue.body}`, keyword),
      ),
    }))
    .filter(
      ({ score, keywords }) =>
        score >= SIMILAR_FLOOR || Arr.isNonEmpty(keywords),
    )
    .toSorted(byCloseness)
    .slice(0, SIMILAR_LIMIT);
};

/** What an open issue is compared by. */
export type OpenIssueText = Readonly<{
  number: number;
  title: string;
  body: string;
  url: string;
}>;

export type ScoredIssue = OpenIssueText &
  Readonly<{
    /** {@link titleSimilarity} of the titles. */
    score: number;
    /** The keywords it names. */
    keywords: readonly string[];
  }>;

/**
 * Two titles this close are taken for one problem until the filer says
 * otherwise. Two reports of one problem score 0.5 to 0.7; the siblings of a
 * series written to one pattern ("rewrite the UI of X on synstate-dom") score
 * as high, and are what `--not-duplicate` is for.
 */
export const DUPLICATE_THRESHOLD = 0.5;

/** Below this, a shared word is chance. */
const SIMILAR_FLOOR = 0.2;

const SIMILAR_LIMIT = 10;

/**
 * Words every title has, which say nothing about which problem it is: English
 * filler, and the Conventional Commits types a title may start with.
 */
const FILLER = new Set<string>([
  'and',
  'are',
  'but',
  'can',
  'chore',
  'docs',
  'does',
  'feat',
  'fix',
  'for',
  'from',
  'has',
  'its',
  'not',
  'one',
  'perf',
  'refactor',
  'style',
  'test',
  'that',
  'the',
  'then',
  'this',
  'when',
  'with',
]);

const titleWords = (title: string): ReadonlySet<string> => {
  const lower = title.toLowerCase();

  const ascii = (lower.match(/[a-z0-9_$.-]+/gu) ?? [])
    .map((word) => word.replaceAll(/^[.-]+|[.-]+$/gu, ''))
    // A bare number (`100`, `1,000`'s `000`) is a count or a year, not a name.
    .filter(
      (word) => word.length >= 3 && !/^\d+$/u.test(word) && !FILLER.has(word),
    );

  const japanese = (lower.match(/[぀-ヿ一-鿿]+/gu) ?? []).flatMap((run) =>
    Array.from({ length: Math.max(run.length - 1, 0) }, (_, index) =>
      run.slice(index, index + 2),
    ),
  );

  return new Set<string>([...ascii, ...japanese]);
};

/** The Dice coefficient of two sets of title words. */
const wordSimilarity = (
  wordsA: ReadonlySet<string>,
  wordsB: ReadonlySet<string>,
): number => {
  const total = wordsA.size + wordsB.size;

  if (!Num.isNonZero(total)) {
    return 0;
  }

  const shared = Array.from(wordsA).filter((word) => wordsB.has(word)).length;

  return Num.div(2 * shared, total);
};

const isWordCharacter = (character: string): boolean =>
  /^[\w$]$/u.test(character);

/**
 * Whether `text` has `keyword` with no word character on either side, so that
 * `useAlive` is not found in `useAliveRef`.
 */
const namesKeyword = (text: string, keyword: string): boolean => {
  if (keyword === '') {
    return false;
  }

  for (
    let mut_at = text.indexOf(keyword);
    mut_at !== -1;
    mut_at = text.indexOf(keyword, mut_at + 1)
  ) {
    const end = mut_at + keyword.length;

    if (
      !isWordCharacter(text.slice(Math.max(mut_at - 1, 0), mut_at)) &&
      !isWordCharacter(text.slice(end, end + 1))
    ) {
      return true;
    }
  }

  return false;
};

/** Naming a keyword as written is the stronger sign, so it goes first. */
const byCloseness = (a: ScoredIssue, b: ScoredIssue): number =>
  a.keywords.length !== b.keywords.length
    ? b.keywords.length - a.keywords.length
    : a.score !== b.score
      ? b.score - a.score
      : a.number - b.number;
