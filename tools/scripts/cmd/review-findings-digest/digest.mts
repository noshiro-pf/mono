import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { CATEGORIES, classify, type CategoryId } from './classify.mjs';
import { parseReview, type Disposition, type Finding } from './parse.mjs';

/**
 * The digest of the merged pull requests given: what each one's `## Review`
 * section records, and its findings counted by class.
 */
export const buildDigest = ({
  range,
  pulls,
}: Readonly<{ range: string; pulls: readonly MergedPull[] }>): Digest => {
  const reviewed = Arr.generate(function* () {
    for (const pull of pulls) {
      const review = parseReview(pull.body);

      if (review !== undefined) {
        yield {
          number: pull.number,
          title: pull.title,
          url: pull.url,
          mergedAt: pull.mergedAt,
          additions: pull.additions,
          deletions: pull.deletions,
          levels: review.levels,
          rounds: review.rounds,
          findings: review.findings.map((finding) => ({
            ...finding,
            categories: classify(finding.text),
          })),
        } satisfies ReviewedPull;
      }
    }
  });

  const findings = reviewed.flatMap((pull) =>
    pull.findings.map((finding) => ({ pull: pull.number, ...finding })),
  );

  return {
    range,
    merged: pulls.length,
    reviewed,
    categories: CATEGORIES.map(({ id, label }) => {
      const inCategory = findings.filter((finding) =>
        finding.categories.includes(id),
      );

      return {
        id,
        label,
        counts: countByDisposition(inCategory),
        pulls: Arr.uniq(inCategory.map((finding) => finding.pull)),
      };
    }),
    other: findings
      .filter((finding) => !Arr.isNonEmpty(finding.categories))
      .map(({ pull, disposition, text }) => ({ pull, disposition, text })),
  };
};

/** The digest as Markdown, for a person or a session to read. */
export const renderMarkdown = (digest: Digest): string => {
  const stated = digest.reviewed
    .map((pull) => pull.rounds)
    .filter((rounds) => rounds !== undefined);

  const findingCount = Arr.sum(
    digest.reviewed.map((pull) => pull.findings.length),
  );

  const deferred = digest.reviewed.flatMap((pull) =>
    pull.findings
      .filter((finding) => finding.disposition === 'deferred')
      .map((finding) => ({ pull: pull.number, ...finding })),
  );

  return [
    '# Review findings digest',
    '',
    `${digest.range}: ${digest.merged} merged pull requests, ${digest.reviewed.length} with a \`## Review\` section, ${findingCount} findings read from them.`,
    '',
    'The classes are keyword matches over each finding (`classify.mts`), a pointer for the reader rather than a measurement. A class that recurs across pull requests is a candidate for a check (`docs/checks-over-fixes.md`).',
    '',
    '## Rounds per pull request',
    '',
    Arr.isNonEmpty(stated)
      ? `${Arr.sum(stated)} rounds over the ${stated.length} pull requests that state a count; ${digest.reviewed.length - stated.length} do not.`
      : 'No pull request states a round count.',
    '',
    '| PR | Title | Level | Rounds | Diff | Findings |',
    '| --: | :-- | :-- | --: | --: | --: |',
    ...digest.reviewed.map(
      (pull) =>
        `| #${pull.number} | ${cell(pull.title)} | ${pull.levels.join(', ')} | ${pull.rounds ?? '?'} | ${diffSize(pull)} | ${pull.findings.length} |`,
    ),
    '',
    '## Findings by class',
    '',
    '| Class | Fixed | Dismissed | Deferred | Unstated | Pull requests |',
    '| :-- | --: | --: | --: | --: | :-- |',
    ...digest.categories
      .filter((category) => Arr.isNonEmpty(category.pulls))
      .toSorted((a, b) => b.pulls.length - a.pulls.length)
      .map(
        ({ label, counts, pulls }) =>
          `| ${label} | ${counts.fixed} | ${counts.dismissed} | ${counts.deferred} | ${counts.unknown} | ${pulls.map((n) => `#${n}`).join(' ')} |`,
      ),
    '',
    '## Deferred',
    '',
    ...(Arr.isNonEmpty(deferred)
      ? deferred.map(
          ({ pull, issues, text }) =>
            `- #${pull}${Arr.isNonEmpty(issues) ? ` → ${issues.map((n) => `#${n}`).join(', ')}` : ''}: ${oneLine(text)}`,
        )
      : ['None.']),
    '',
    '## Other (no class matched)',
    '',
    ...(Arr.isNonEmpty(digest.other)
      ? digest.other.map(
          ({ pull, disposition, text }) =>
            `- #${pull} (${disposition}): ${oneLine(text)}`,
        )
      : ['None.']),
    '',
  ].join('\n');
};

/** A merged pull request, as the digest needs it from the API. */
export type MergedPull = Readonly<{
  number: number;
  title: string;
  url: string;
  mergedAt: string;
  body: string;
  /** `undefined` when the size was not fetched (no `## Review` section). */
  additions: number | undefined;
  deletions: number | undefined;
}>;

export type Digest = Readonly<{
  /** What the pull requests were selected by, in words. */
  range: string;
  merged: number;
  reviewed: readonly ReviewedPull[];
  categories: readonly Readonly<{
    id: CategoryId;
    label: string;
    counts: DispositionCounts;
    pulls: readonly number[];
  }>[];
  other: readonly Readonly<{
    pull: number;
    disposition: Disposition;
    text: string;
  }>[];
}>;

export type ReviewedPull = Readonly<{
  number: number;
  title: string;
  url: string;
  mergedAt: string;
  additions: number | undefined;
  deletions: number | undefined;
  levels: readonly string[];
  rounds: number | undefined;
  findings: readonly ClassifiedFinding[];
}>;

type ClassifiedFinding = Finding &
  Readonly<{ categories: readonly CategoryId[] }>;

type DispositionCounts = ReadonlyRecord<Disposition, number>;

const countByDisposition = (
  findings: readonly Readonly<{ disposition: Disposition }>[],
): DispositionCounts =>
  ({
    fixed: findings.filter((f) => f.disposition === 'fixed').length,
    dismissed: findings.filter((f) => f.disposition === 'dismissed').length,
    deferred: findings.filter((f) => f.disposition === 'deferred').length,
    unknown: findings.filter((f) => f.disposition === 'unknown').length,
  }) as const;

const diffSize = (
  pull: Readonly<{
    additions: number | undefined;
    deletions: number | undefined;
  }>,
): string =>
  pull.additions === undefined || pull.deletions === undefined
    ? '?'
    : (`+${pull.additions} −${pull.deletions}` as const);

const oneLine = (text: string): string => text.replaceAll(/\s+/gu, ' ').trim();

/** Text safe in a Markdown table cell. */
const cell = (text: string): string =>
  oneLine(text).replaceAll('|', String.raw`\|`);
