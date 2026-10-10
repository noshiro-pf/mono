/**
 * The prose of the comment a pull request gets when this script sets it
 * aside, and of the one line it is rewritten to once that is over.
 * `pr-report-core`'s `set-aside.mts` wraps it in the record the script and
 * the page read back; nothing reads the prose.
 */

import {
  writeResolvedComment,
  writeSetAsideComment,
  type SetAside,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import type { SkipRecord } from './types.mjs';
import { lastLines } from './util.mjs';

/**
 * What a reader needs without the terminal this ran in: the reason and its
 * sentence, each failed check with its run, what the command printed —
 * folded, and cut to its end — and what will take it off.
 */
export const setAsideCommentBody = (
  skip: SkipRecord,
  defaultBranch: string,
): string => {
  const failedChecks = skip.failedChecks ?? [];

  const output = skip.output?.trim() ?? '';

  return writeSetAsideComment(
    { reason: skip.reason, headSha: skip.headSha, baseSha: skip.baseSha },
    [
      `**\`unblock-prs\` set this pull request aside** (\`${skip.reason}\`): ${escapeMarkdown(skip.detail.replaceAll(/\s+/gu, ' ').trim())}`,
      ...(Arr.isNonEmpty(failedChecks)
        ? [
            '',
            'Failed required checks:',
            '',
            ...failedChecks.map(({ name, link }) =>
              link === ''
                ? `- ${escapeMarkdown(name)}`
                : `- [${escapeMarkdown(name)}](${link})`,
            ),
          ]
        : []),
      ...(output === ''
        ? []
        : [
            '',
            '<details><summary>What the command printed</summary>',
            '',
            fenced(tailOf(output)),
            '',
            '</details>',
          ]),
      '',
      `Set aside at \`${short(skip.headSha)}\`, with \`${defaultBranch}\` at \`${short(skip.baseSha)}\`. ${
        skip.reason === 'checks-failed'
          ? 'It stays aside until the branch is pushed again: rebasing it would only put the same failing checks through again.'
          : `It stays aside until the branch is pushed again or \`${defaultBranch}\` moves.`
      }`,
    ].join('\n'),
  );
};

/** The one line a comment is rewritten to: what it was, what ended it, when. */
export const resolvedCommentBody = (
  setAside: SetAside,
  resolvedBy: ResolvedBy,
  defaultBranch: string,
  at: Temporal.Instant,
): string =>
  writeResolvedComment(
    `Resolved at ${at.toString({ smallestUnit: 'second' })}: no longer set aside (\`${setAside.reason}\` at \`${short(setAside.headSha)}\`) — ${describeResolvedBy(resolvedBy, defaultBranch)}.`,
  );

export const describeResolvedBy = (
  resolvedBy: ResolvedBy,
  defaultBranch: string,
): string => {
  switch (resolvedBy) {
    case 'base-moved':
      return `\`${defaultBranch}\` moved`;

    case 'pushed':
      return 'the branch was pushed';

    case 'retry':
      return 'a retry was asked for';
  }
};

/** What ended a set-aside, as the resolved line says it. */
export type ResolvedBy = 'base-moved' | 'pushed' | 'retry';

/**
 * How much of what a command printed the comment keeps, from its end, where
 * git says what stopped it. GitHub takes a comment of up to 65,536
 * characters, and the whole body is one argument to `gh`.
 */
const OUTPUT_LINES = 60;

const OUTPUT_CHARS = 20_000;

const tailOf = (output: string): string => {
  const kept = lastLines(output, OUTPUT_LINES);

  const cut = kept.length > OUTPUT_CHARS ? kept.slice(-OUTPUT_CHARS) : kept;

  return cut === output ? cut : `…\n${cut}`;
};

/** A fence longer than any run of backticks inside it, so none closes it. */
const fenced = (text: string): string => {
  const longest = Math.max(
    0,
    ...Array.from(text.matchAll(/`+/gu), ([run]) => run.length),
  );

  const fence = '`'.repeat(Math.max(3, longest + 1));

  return [`${fence}text`, text, fence].join('\n');
};

/**
 * A sentence built from what git and GitHub said, as literal text: file
 * names carry underscores, and nothing in it should mention anyone.
 */
const escapeMarkdown = (text: string): string =>
  text.replaceAll(/[\\`*_[\]<>|~@]/gu, String.raw`\$&`);

const short = (sha: string): string => sha.slice(0, 10);
