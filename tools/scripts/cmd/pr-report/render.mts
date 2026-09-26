/** The report as text: Markdown for GitHub and Claude, plain for a terminal. */

import {
  summarize,
  type ChecksSummary,
  type PrReport,
  type ReportEntry,
  type TreeNode,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';

const EMPTY = 'No open pull requests.';

/** What each verdict looks like, in a document and in a terminal. */
const GLYPH = {
  failing: { markdown: '❌', terminal: '✗' },
  passed: { markdown: '✅', terminal: '✓' },
  paused: { markdown: '⏸️', terminal: '⏸' },
  pending: { markdown: '🟡', terminal: '•' },
} as const satisfies ReadonlyRecord<
  ChecksSummary['verdict'],
  Readonly<{ markdown: string; terminal: string }>
>;

/**
 * The report as Markdown, for pasting into GitHub or a conversation with
 * Claude.
 *
 * The merge order is a nested list rather than a table because the nesting
 * *is* the information — a table would have to spell the tree back out in a
 * column, and a reader would have to rebuild it.
 */
export const renderMarkdown = (report: PrReport): string => {
  if (!Arr.isNonEmpty(report.entries)) {
    return [
      heading(report),
      '',
      EMPTY,
      ...mergedSection(report, 'markdown'),
      ...issuesSection(report, 'markdown'),
      '',
    ].join('\n');
  }

  const byNumber = index(report);

  const line = (node: TreeNode, depth: number): readonly string[] => {
    const entry = byNumber.get(node.number);

    if (entry === undefined) {
      return [];
    }

    const indent = '  '.repeat(depth);

    const body = node.repeated
      ? (`[#${node.number}](${entry.url}) — see above` as const)
      : describe(entry, 'markdown');

    return Arr.toUnshifted(`${indent}- ${body}`)(
      node.children.flatMap((child) => line(child, depth + 1)),
    );
  };

  return [
    heading(report),
    '',
    summary(report),
    '',
    '## Merge order',
    '',
    ...report.roots.flatMap((root) => line(root, 0)),
    ...cyclesSection(report),
    ...mergedSection(report, 'markdown'),
    ...issuesSection(report, 'markdown'),
    ...footnote(report),
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
      '',
    ].join('\n');
  }

  const byNumber = index(report);

  const line = (
    node: TreeNode,
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
        : (`${prefix}${connector === '└─ ' ? ' '.repeat(3) : '│  '}` as const);

    return Arr.toUnshifted(`${prefix}${connector}${body}`)(
      node.children.flatMap((child, i) =>
        line(
          child,
          childPrefix,
          i === node.children.length - 1 ? '└─ ' : '├─ ',
        ),
      ),
    );
  };

  return [
    title(report),
    summary(report).replaceAll('*', ''),
    '',
    ...report.roots.flatMap((root) => line(root, '', '')),
    ...cyclesSection(report).map(withoutHeadingMark),
    ...mergedSection(report, 'terminal').map(withoutHeadingMark),
    ...issuesSection(report, 'terminal').map(withoutHeadingMark),
    ...footnote(report).map((l) => l.replace(/^> /u, '')),
    '',
  ].join('\n');
};

/** A Markdown heading as the plain line a terminal shows. */
const withoutHeadingMark = (line: string): string => line.replace(/^#+ /u, '');

const index = (report: PrReport): ReadonlyMap<number, ReportEntry> =>
  new Map(report.entries.map((entry) => [entry.number, entry]));

const title = (report: PrReport): string =>
  `Open pull requests — ${report.repo.owner}/${report.repo.name}` as const;

const heading = (report: PrReport): string => `# ${title(report)}` as const;

/**
 * One line saying how much there is and how much of it wants attention, so
 * that a reader who opens the report and closes it again has still learnt
 * the only thing a daily report has to tell them. The Pull Requests
 * Manager page leads with the same counts, from the same {@link summarize}.
 */
const summary = (report: PrReport): string => {
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

/** One pull request on one line: what it is, and what is holding it up. */
const describe = (
  entry: ReportEntry,
  format: 'markdown' | 'terminal',
): string => {
  const markdown = format === 'markdown';

  const ref = markdown
    ? (`[#${entry.number}](${entry.url})` as const)
    : (`#${entry.number}` as const);

  const glyph = GLYPH[entry.checks.verdict][format];

  const detail = [
    entry.isDraft ? 'draft' : undefined,
    entry.stackedOn === undefined
      ? undefined
      : (`stacked on #${entry.stackedOn}` as const),
    commits(entry),
    ...entry.labels.map(({ name }) => (markdown ? `\`${name}\`` : `[${name}]`)),
    autoMerge(entry),
    issues(entry, markdown),
    failures(entry.checks),
  ].filter((part) => part !== undefined);

  const title_ = markdown ? (`**${entry.title}**` as const) : entry.title;

  return Arr.toUnshifted(`${glyph} ${ref} ${title_}`)(detail).join(' · ');
};

/**
 * Whether anything will land the pull request once the checks go green, said
 * only when something will. `unblock-prs` arms a queued pull request when it
 * picks it, so one not yet armed — queued or not — is the ordinary case, and
 * armed is the news: its turn has come.
 */
const autoMerge = (entry: ReportEntry): string | undefined =>
  entry.autoMerge ? 'auto-merge' : undefined;

/**
 * `+3 / -12`: three commits of its own, twelve of its base it has not got.
 * The second number is the one that matters — the ruleset blocks a branch
 * that is behind `main`, and a stacked one behind the layer below it shows
 * that layer's old commits in its diff — so anything but `-0` is a rebase
 * waiting to happen.
 */
const commits = (entry: ReportEntry): string =>
  entry.comparison === undefined
    ? 'ahead/behind unread'
    : (`+${entry.comparison.aheadBy} / -${entry.comparison.behindBy}` as const);

const issues = (entry: ReportEntry, markdown: boolean): string | undefined =>
  Arr.isNonEmpty(entry.linkedIssues)
    ? (`closes ${entry.linkedIssues
        .map((issue) =>
          markdown ? `[#${issue.number}](${issue.url})` : `#${issue.number}`,
        )
        .join(', ')}` as const)
    : undefined;

/**
 * Which required contexts are red, because "failing" without the name of
 * what failed is a second click for every reader of the report.
 *
 * While `skip-ci` is on, red is the normal state rather than news: the
 * `opened` run is cancelled by the `labeled` run that supersedes it and
 * leaves `*-result` checks red naming nothing, and no run since has been
 * allowed to start. Reported as stale, so that a reader is not sent to open
 * a run that was never about the current commit.
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
            `- ${Arr.toPushed(cycle, cycle[0])
              .map((n) => `#${n}`)
              .join(' → ')}`,
        ),
      ] as const)
    : ([] as const);

/**
 * What landed, and when.
 *
 * Below the queue rather than above it, because the queue is what a reader
 * can act on and this is what they no longer have to. Omitted entirely when
 * nothing merged inside the window, rather than left as an empty heading
 * saying the report looked.
 */
const mergedSection = (
  report: PrReport,
  format: 'markdown' | 'terminal',
): readonly string[] => {
  if (!Arr.isNonEmpty(report.merged)) {
    return [] as const;
  }

  const markdown = format === 'markdown';

  return [
    '',
    `## Merged in the last ${report.mergedWithinDays} day${report.mergedWithinDays === 1 ? '' : 's'}`,
    '',
    ...report.merged.map((pr) => {
      const ref = markdown
        ? (`[#${pr.number}](${pr.url})` as const)
        : (`#${pr.number}` as const);

      const detail = [
        pr.mergedAt,
        `by ${pr.author}`,
        ...pr.linkedIssues.map(({ number, url }) =>
          markdown ? `closes [#${number}](${url})` : `closes #${number}`,
        ),
      ] as const;

      return `- ${ref} ${markdown ? `**${pr.title}**` : pr.title} · ${detail.join(' · ')}`;
    }),
  ] as const;
};

/**
 * What is open that is not a pull request.
 *
 * Last, after what merged, because it is the one section that is not about
 * the queue at all: a reader asks "what is in flight" first and "what is
 * waiting to be started" second. A list as long as its cap says `+`, since
 * it may not be all of them.
 */
const issuesSection = (
  report: PrReport,
  format: 'markdown' | 'terminal',
): readonly string[] => {
  if (!Arr.isNonEmpty(report.issues)) {
    return [] as const;
  }

  const markdown = format === 'markdown';

  const full = report.issues.length >= report.issuesLimit;

  return [
    '',
    `## Open issues (${report.issues.length}${full ? '+' : ''})`,
    '',
    ...report.issues.map((issue) => {
      const ref = markdown
        ? (`[#${issue.number}](${issue.url})` as const)
        : (`#${issue.number}` as const);

      const detail = [
        `updated ${issue.updatedAt}`,
        `by ${issue.author}`,
        ...(issue.comments > 0
          ? ([
              `${issue.comments} comment${issue.comments === 1 ? '' : 's'}`,
            ] as const)
          : ([] as const)),
        ...issue.labels.map(({ name }) =>
          markdown ? `\`${name}\`` : `[${name}]`,
        ),
      ] as const;

      return `- ${ref} ${markdown ? `**${issue.title}**` : issue.title} · ${detail.join(' · ')}`;
    }),
  ] as const;
};

/** Said once, at the bottom, rather than beside every pull request. */
const footnote = (report: PrReport): readonly string[] =>
  report.authenticated
    ? ([] as const)
    : ([
        '',
        '> Read without a token: the linked issues are the ones the bodies',
        "> declare with a closing keyword, not GitHub's own list.",
      ] as const);
