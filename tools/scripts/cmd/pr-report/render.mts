/** The report as text: Markdown for GitHub and Claude, plain for a terminal. */

import { Arr } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { MERGE_QUEUED_LABEL } from '../unblock-prs/labels.mjs';
import { summarize } from './summarize.mjs';
import {
  type ChecksSummary,
  type PrReport,
  type ReportEntry,
  type TreeNode,
} from './types.mjs';

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
 * The report as Markdown, for the file on the report's branch, the run
 * summary, or the Claude app.
 *
 * The merge order is a nested list rather than a table because the nesting
 * *is* the information — a table would have to spell the tree back out in a
 * column, and a reader would have to rebuild it.
 *
 * Prose only. The machine-readable copy the Pull Requests Manager app reads
 * used to be a collapsed JSON block at the bottom of this; it is now a file
 * on a branch of its own, written by the same run — see
 * `apps/pr-report-payload`, and `--format payload` for the other half.
 */
export const renderMarkdown = (report: PrReport): string => {
  if (!Arr.isNonEmpty(report.entries)) {
    return [heading(report), '', EMPTY, ''].join('\n');
  }

  const byNumber = index(report);

  const line = (node: TreeNode, depth: number): readonly string[] => {
    const entry = byNumber.get(node.number);

    if (entry === undefined) return [];

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
    ...footnote(report),
    '',
  ].join('\n');
};

/** The same report drawn with box characters, for a terminal. */
export const renderTerminal = (report: PrReport): string => {
  if (!Arr.isNonEmpty(report.entries)) {
    return [title(report), '', EMPTY, ''].join('\n');
  }

  const byNumber = index(report);

  const line = (
    node: TreeNode,
    prefix: string,
    connector: string,
  ): readonly string[] => {
    const entry = byNumber.get(node.number);

    if (entry === undefined) return [];

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
    ...cyclesSection(report).map((l) => l.replace(/^#+ /u, '')),
    ...mergedSection(report, 'terminal').map((l) => l.replace(/^#+ /u, '')),
    ...footnote(report).map((l) => l.replace(/^> /u, '')),
    '',
  ].join('\n');
};

const index = (report: PrReport): ReadonlyMap<number, ReportEntry> =>
  new Map(report.entries.map((entry) => [entry.number, entry]));

const title = (report: PrReport): string =>
  `Open pull requests — ${report.repo.owner}/${report.repo.name}` as const;

const heading = (report: PrReport): string => `# ${title(report)}` as const;

/**
 * One line saying how much there is and how much of it wants attention, so
 * that a reader who opens the report and closes it again has still learnt
 * the only thing a daily report has to tell them. The same counts travel in
 * the payload, from the same {@link summarize}.
 */
const summary = (report: PrReport): string => {
  const counts = summarize(report);

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
 * Whether anything will land the pull request once the checks go green.
 *
 * Said only when it is news. A pull request nobody has queued and nobody has
 * armed is the ordinary case, and a line for it on every entry would bury the
 * one combination that matters: `merge-queued` — the author saying this is to
 * be landed — with no auto-merge to land it. `unblock-prs` passes such a pull
 * request over with "auto-merge is not enabled", and until now the only place
 * that was visible was that script's own log.
 */
const autoMerge = (entry: ReportEntry): string | undefined =>
  entry.autoMerge
    ? 'auto-merge'
    : entry.labels.some((label) => label.name === MERGE_QUEUED_LABEL)
      ? 'no auto-merge'
      : undefined;

/**
 * `+3 / -12`: three commits of its own, twelve of `main` it has not got.
 * The second number is the one that matters — the ruleset blocks a branch
 * that is behind, so anything but `-0` is a rebase waiting to happen.
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
  if (!Arr.isNonEmpty(report.merged)) return [] as const;

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

/** Said once, at the bottom, rather than beside every pull request. */
const footnote = (report: PrReport): readonly string[] =>
  report.authenticated
    ? ([] as const)
    : ([
        '',
        '> Read without a token: the linked issues are the ones the bodies',
        "> declare with a closing keyword, not GitHub's own list.",
      ] as const);
