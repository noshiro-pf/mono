/** The report as text: Markdown for GitHub and Claude, plain for a terminal. */

import {
  epochMsOf,
  hasLabel,
  issueTierLabel,
  issueTierOf,
  PullRequestLabel,
  type ChecksSummary,
  type ForestNode,
  type IssueStartState,
  type ReferenceStatus,
} from 'pr-report-core-v2';
import { Arr, asNonZeroSafeInt, Num } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  summarize,
  type PrReport,
  type ReportEntry,
  type ReportIssue,
} from './report.mjs';

/**
 * The report as Markdown. The merge order is a nested list, not a table: the
 * nesting is the information, and a table would spell the tree out again in a
 * column for the reader to rebuild.
 */
export const renderMarkdown = (report: PrReport): string => {
  if (!Arr.isNonEmpty(report.entries)) {
    return [
      `# ${title(report)}`,
      '',
      EMPTY,
      ...mergedSection(report, 'markdown'),
      ...issuesSection(report, 'markdown'),
      ...footnote(report, 'markdown'),
      '',
    ].join('\n');
  }

  const byNumber = indexOf(report);

  const line = (node: ForestNode, depth: number): readonly string[] => {
    const entry = byNumber.get(node.number);

    if (entry === undefined) {
      return [];
    }

    const body = node.repeated
      ? (`[#${node.number}](${entry.url}) — see above` as const)
      : describe(entry, 'markdown');

    return Arr.toUnshifted(`${'  '.repeat(depth)}- ${body}`)(
      node.children.flatMap((child) => line(child, depth + 1)),
    );
  };

  return [
    `# ${title(report)}`,
    '',
    summaryLine(report),
    '',
    '## Merge order',
    '',
    ...report.roots.flatMap((root) => line(root, 0)),
    ...cyclesSection(report),
    ...mergedSection(report, 'markdown'),
    ...issuesSection(report, 'markdown'),
    ...footnote(report, 'markdown'),
    '',
  ].join('\n');
};

/** The same report drawn with box characters, for a terminal. */
export const renderTerminal = (report: PrReport): string => {
  if (!Arr.isNonEmpty(report.entries)) {
    return [
      title(report),
      '',
      EMPTY,
      ...mergedSection(report, 'terminal').map(withoutHeadingMark),
      ...issuesSection(report, 'terminal').map(withoutHeadingMark),
      ...footnote(report, 'terminal'),
      '',
    ].join('\n');
  }

  const byNumber = indexOf(report);

  const line = (
    node: ForestNode,
    prefix: string,
    connector: string,
  ): readonly string[] => {
    const entry = byNumber.get(node.number);

    if (entry === undefined) {
      return [];
    }

    const body = node.repeated
      ? (`#${node.number} — see above` as const)
      : describe(entry, 'terminal');

    const childPrefix =
      connector === ''
        ? prefix
        : (`${prefix}${connector === LAST ? ' '.repeat(3) : '│  '}` as const);

    return Arr.toUnshifted(`${prefix}${connector}${body}`)(
      node.children.flatMap((child, i) =>
        line(child, childPrefix, i === node.children.length - 1 ? LAST : MID),
      ),
    );
  };

  return [
    title(report),
    summaryLine(report).replaceAll('*', ''),
    '',
    ...report.roots.flatMap((root) => line(root, '', '')),
    ...cyclesSection(report).map(withoutHeadingMark),
    ...mergedSection(report, 'terminal').map(withoutHeadingMark),
    ...issuesSection(report, 'terminal').map(withoutHeadingMark),
    ...footnote(report, 'terminal'),
    '',
  ].join('\n');
};

/** How long ago `at` was, measured from `now`, in the largest whole unit. */
export const ageOf = (atEpochMs: number, nowEpochMs: number): string => {
  const minutes = Math.max(
    0,
    Math.floor(Num.div(nowEpochMs - atEpochMs, MINUTE_MS)),
  );

  return minutes < 60
    ? `${minutes}m`
    : minutes < 48 * 60
      ? `${Math.floor(Num.div(minutes, MINUTES_PER_HOUR))}h`
      : `${Math.floor(Num.div(minutes, MINUTES_PER_DAY))}d`;
};

const MINUTE_MS = asNonZeroSafeInt(60_000);

const MINUTES_PER_HOUR = asNonZeroSafeInt(60);

const MINUTES_PER_DAY = asNonZeroSafeInt(24 * 60);

type Format = 'markdown' | 'terminal';

const EMPTY = 'No open pull requests.';

const MID = '├─ ';

const LAST = '└─ ';

/** What each verdict looks like, in a document and in a terminal. */
const GLYPH = {
  failing: { markdown: '❌', terminal: '✗' },
  passed: { markdown: '✅', terminal: '✓' },
  paused: { markdown: '⏸️', terminal: '⏸' },
  pending: { markdown: '🟡', terminal: '•' },
} as const satisfies ReadonlyRecord<
  ChecksSummary['verdict'],
  ReadonlyRecord<Format, string>
>;

const START_WORDS = {
  free: 'free',
  ready: 'ready',
  'in-progress': 'in progress',
  planned: 'planned',
  attention: 'needs a look',
  blocked: 'waiting',
  cycle: 'on a Start-After cycle',
} as const satisfies ReadonlyRecord<IssueStartState, string>;

const STATUS_WORDS = {
  waiting: 'open',
  done: 'done',
  abandoned: 'closed unfinished',
  unknown: 'unknown',
} as const satisfies ReadonlyRecord<ReferenceStatus, string>;

const withoutHeadingMark = (line: string): string => line.replace(/^#+ /u, '');

const indexOf = (report: PrReport): ReadonlyMap<number, ReportEntry> =>
  new Map(report.entries.map((entry) => [entry.number, entry]));

const title = (report: PrReport): string =>
  `Open pull requests — ${report.repo.owner}/${report.repo.name}` as const;

/** How much there is, and how much of it wants attention. */
const summaryLine = (report: PrReport): string => {
  const counts = summarize(report.entries);

  return [
    `**${counts.open} open**`,
    `${counts.queued} queued`,
    `${counts.draft} draft`,
    `${counts.failing} failing`,
    `${counts.behind} behind`,
    `generated ${report.generatedAt}`,
  ].join(' · ');
};

const refs = (numbers: readonly number[]): string =>
  numbers.map((number) => `#${number}`).join(', ');

const ref = (number: number, url: string, format: Format): string =>
  format === 'markdown'
    ? (`[#${number}](${url})` as const)
    : (`#${number}` as const);

const label = (name: string, format: Format): string =>
  format === 'markdown' ? (`\`${name}\`` as const) : (`[${name}]` as const);

const bold = (text: string, format: Format): string =>
  format === 'markdown' ? (`**${text}**` as const) : text;

/**
 * Which required contexts are red. Under `skip-ci` red is stale: the run the
 * label cancelled left it, naming nothing about the current commit.
 */
const failures = (checks: ChecksSummary): string | undefined => {
  if (!Arr.isNonEmpty(checks.failed)) {
    return checks.verdict === 'paused' ? 'checks paused' : undefined;
  }

  const names = checks.failed.join(', ');

  return checks.verdict === 'paused'
    ? `checks paused, stale red: ${names}`
    : `failed: ${names}`;
};

/** One pull request on one line: what it is, and what holds it. */
const describe = (entry: ReportEntry, format: Format): string =>
  [
    `${GLYPH[entry.checks.verdict][format]} ${ref(entry.number, entry.url, format)} ${bold(entry.title, format)}`,
    entry.isDraft ? 'draft' : undefined,
    entry.stackedOn === undefined
      ? undefined
      : `stacked on #${entry.stackedOn}`,
    Arr.isNonEmpty(entry.inheritedMergeAfter)
      ? `after ${refs(entry.inheritedMergeAfter)} (Start-After)`
      : undefined,
    Arr.isNonEmpty(entry.notStartedIssues)
      ? `${refs(entry.notStartedIssues)} (issue) not done`
      : undefined,
    // `+3 / -12`: three commits of its own, twelve of its base it lacks.
    entry.comparison === undefined
      ? 'ahead/behind unread'
      : `+${entry.comparison.aheadBy} / -${entry.comparison.behindBy}`,
    ...entry.labels.map(({ name }) => label(name, format)),
    // Armed is the news: `unblock-prs` arms one only when it picks it.
    entry.autoMerge ? 'auto-merge' : undefined,
    Arr.isNonEmpty(entry.linkedIssues)
      ? `closes ${entry.linkedIssues
          .map(({ number, url }) => ref(number, url, format))
          .join(', ')}`
      : undefined,
    failures(entry.checks),
  ]
    .filter((part) => part !== undefined)
    .join(' · ');

const cyclesSection = (report: PrReport): readonly string[] =>
  Arr.isNonEmpty(report.cycles)
    ? ([
        '',
        '## Merge-After cycles',
        '',
        'Each of these waits, in the end, for itself. Nothing can pick them up',
        'until one of the declarations goes.',
        '',
        ...report.cycles.map(
          (cycle) =>
            `- ${[...cycle, ...Arr.take(cycle, 1)].map((n) => `#${n}`).join(' → ')}`,
        ),
      ] as const)
    : ([] as const);

/** What landed inside the window; left out when nothing did. */
const mergedSection = (report: PrReport, format: Format): readonly string[] =>
  Arr.isNonEmpty(report.merged)
    ? ([
        '',
        `## Merged in the last ${report.mergedWithinDays} day${report.mergedWithinDays === 1 ? '' : 's'}`,
        '',
        ...report.merged.map((pr) =>
          [
            `- ${ref(pr.number, pr.url, format)} ${bold(pr.title, format)}`,
            pr.mergedAt,
            `by ${pr.author}`,
            ...pr.linkedIssues.map(
              ({ number, url }) => `closes ${ref(number, url, format)}`,
            ),
          ].join(' · '),
        ),
      ] as const)
    : ([] as const);

/**
 * How an issue stands for starting, unless free; who claimed it and when; what
 * its `Start-After:` names; and a misplaced `Merge-After:`.
 */
const startDetail = (
  issue: ReportIssue,
  nowEpochMs: number | undefined,
): readonly string[] => {
  const claimedAt =
    issue.claim === undefined ? undefined : epochMsOf(issue.claim.at);

  return [
    // A planned claim already says "planned".
    ...(issue.start === 'free' ||
    (issue.start === 'planned' && issue.claim?.state === 'planned')
      ? []
      : [START_WORDS[issue.start]]),
    ...(issue.claim === undefined
      ? []
      : [
          `${issue.claim.state} by ${issue.claim.by}${
            claimedAt === undefined || nowEpochMs === undefined
              ? ''
              : ` ${ageOf(claimedAt, nowEpochMs)} ago`
          }`,
        ]),
    ...(Arr.isNonEmpty(issue.named)
      ? [
          `after ${issue.named
            .map(({ number, status }) => `#${number} (${STATUS_WORDS[status]})`)
            .join(', ')}`,
        ]
      : []),
    ...(Arr.isNonEmpty(issue.misplacedMergeAfter)
      ? [
          `Merge-After: ${refs(issue.misplacedMergeAfter)} is not read on an issue; use Start-After:`,
        ]
      : []),
  ];
};

/**
 * An issue under no tier or several, and one labelled `pending`, a pull
 * request's label (`docs/issue-priority.md`).
 */
const tierDetail = (issue: ReportIssue): readonly string[] => {
  const names = issue.labels.map(({ name }) => name);

  const tier = issueTierOf(names);

  return [
    ...(tier === 'none'
      ? ['no priority tier']
      : tier === 'several'
        ? ['several priority tiers']
        : []),
    ...(hasLabel(names, PullRequestLabel.pending)
      ? [
          `${PullRequestLabel.pending} is for pull requests; hold with ${issueTierLabel('hold')}`,
        ]
      : []),
  ];
};

/** The open issues; `+` on a list as long as its cap. */
const issuesSection = (report: PrReport, format: Format): readonly string[] => {
  if (!Arr.isNonEmpty(report.issues)) {
    return [];
  }

  const full = report.issues.length >= report.issuesLimit;

  const nowEpochMs = epochMsOf(report.generatedAt);

  return [
    '',
    `## Open issues (${report.issues.length}${full ? '+' : ''})`,
    '',
    ...report.issues.map((issue) =>
      [
        `- ${ref(issue.number, issue.url, format)} ${bold(issue.title, format)}`,
        ...startDetail(issue, nowEpochMs),
        ...tierDetail(issue),
        `updated ${issue.updatedAt}`,
        `by ${issue.author}`,
        ...(issue.comments > 0
          ? [`${issue.comments} comment${issue.comments === 1 ? '' : 's'}`]
          : []),
        ...issue.labels.map(({ name }) => label(name, format)),
      ].join(' · '),
    ),
  ];
};

/**
 * Said once at the bottom, not beside every pull request; a quote in Markdown,
 * plain lines in a terminal.
 */
const footnote = (report: PrReport, format: Format): readonly string[] => {
  if (report.authenticated) {
    return [];
  }

  const quote = format === 'markdown' ? '> ' : '';

  return [
    '',
    `${quote}Read without a token: the linked issues are the ones the bodies`,
    `${quote}declare with a closing keyword, not GitHub's own list.`,
  ];
};
