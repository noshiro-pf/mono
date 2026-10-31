// cspell:ignore PCRE pcre amannn

import { Arr } from 'ts-data-forge';

/**
 * The checks `lint-pull-request.yml` makes of a pull request's commits, made
 * of the branch before it is pushed.
 *
 * **The language pattern is read from the workflow, not restated.** The
 * workflow keeps it as `JAPANESE_PATTERN` in its `env:`, a PCRE for `grep -P`;
 * {@link readJapanesePattern} takes that line and {@link pcreToRegExp} turns
 * its `\x{…}` escapes into the `\u{…}` a `u`-flag `RegExp` reads. The
 * workflow cannot call a script instead, because it runs on
 * `pull_request_target` without a checkout (README.md there says why), so the
 * one copy lives in the YAML and this side follows it.
 *
 * **The title check is approximated.** `action-semantic-pull-request` checks
 * the title against Conventional Commits with its default type list, and
 * `open-pr` takes the title from the tip's subject; the subject is checked
 * against {@link CONVENTIONAL_TYPES}, that action's default, as a warning
 * only, since `open-pr --title` can still give the pull request another one.
 */
export const checkCommitMessages = ({
  commits,
  japanesePattern,
}: Readonly<{
  /** Oldest first, as `git log --reverse` lists them. */
  commits: readonly Commit[];
  japanesePattern: RegExp;
}>): Readonly<{ errors: readonly string[]; warnings: readonly string[] }> => {
  const offending = commits.filter(({ message }) =>
    japanesePattern.test(message),
  );

  const subject = commits.at(-1)?.message.split('\n', 1)[0];

  return {
    errors: [
      ...(Arr.isNonEmpty(offending)
        ? [
            Arr.toUnshifted(
              offending.map(
                ({ sha, message }) =>
                  `      ${sha.slice(0, SHORT_SHA)} ${message.trim().replaceAll('\n', ' / ')}`,
              ),
              'Every commit message must be written in English (lint-pull-request.yml, "Validate commit messages"). These are not:',
            ).join('\n'),
          ]
        : []),
      ...(commits.length > 1
        ? [
            `The branch is ${commits.length} commits; a pull request is one (lint-pull-request.yml, "Validate commit count"). Squash them: git reset --soft <base> && git commit.`,
          ]
        : []),
    ],
    warnings:
      subject === undefined || isConventionalSubject(subject)
        ? []
        : [
            `The tip's subject, which open-pr uses as the pull request title, is not Conventional Commits (type(scope): description, type one of ${CONVENTIONAL_TYPES.join(', ')}): ${subject}`,
          ],
  };
};

export type Commit = Readonly<{ sha: string; message: string }>;

/**
 * The `JAPANESE_PATTERN` value of `lint-pull-request.yml`, as a `RegExp`, or
 * `undefined` when the workflow no longer declares it in the shape read here
 * — which the caller reports, since a check that silently passes is the thing
 * to avoid.
 */
export const readJapanesePattern = (
  workflowYaml: string,
): RegExp | undefined => {
  const pcre = PATTERN_LINE.exec(workflowYaml)?.[1];

  return pcre === undefined ? undefined : pcreToRegExp(pcre);
};

/** `\x{3000}` (PCRE) to `\u{3000}` (a `u`-flag `RegExp`); nothing else differs. */
export const pcreToRegExp = (pcre: string): RegExp =>
  // The workflow's own pattern, which is the point of reading it; it is not
  // input from anyone else.
  // eslint-disable-next-line security/detect-non-literal-regexp
  new RegExp(pcre.replaceAll(PCRE_CODE_POINT, String.raw`\u{$1}`), 'u');

export const isConventionalSubject = (subject: string): boolean => {
  const type = TYPE_PREFIX.exec(subject)?.[0];

  if (type === undefined || !CONVENTIONAL_TYPE_SET.has(type)) {
    return false;
  }

  const afterType = subject.slice(type.length);

  const scope = SCOPE.exec(afterType)?.[0] ?? '';

  return DESCRIPTION.test(afterType.slice(scope.length));
};

/**
 * The default `types` of `amannn/action-semantic-pull-request`, which
 * `lint-pull-request.yml` uses without overriding (from the
 * `conventional-commit-types` package it depends on).
 */
export const CONVENTIONAL_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
] as const;

const CONVENTIONAL_TYPE_SET: ReadonlySet<string> = new Set<string>(
  CONVENTIONAL_TYPES,
);

// `type(scope)!: description`, the scope and the `!` optional, read a part at
// a time rather than by one pattern with a quantified group.
const TYPE_PREFIX = /^[a-z]+/u;

const SCOPE = /^\([^()]+\)/u;

const DESCRIPTION = /^!?: \S/u;

const SHORT_SHA = 7;

const PATTERN_LINE = /^\s*JAPANESE_PATTERN:\s*'([^']+)'\s*$/mu;

const PCRE_CODE_POINT = /\\x\{([0-9A-Fa-f]+)\}/gu;
