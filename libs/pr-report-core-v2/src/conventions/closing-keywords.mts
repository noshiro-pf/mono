/**
 * The issues of this repository a pull request body closes by keyword
 * (`spec/conventions.md`, "Closing issues"), in first-appearance order, each
 * once. GitHub's own `closingIssuesReferences` is the reader's to decode.
 */

import { Arr, Num, Result } from 'ts-data-forge';
import type { RepoRef } from '../snapshot/index.mjs';
import { outsideCodeFences } from './declarations.mjs';

/**
 * Read from GitHub's rendering of the body: each `<span class="issue-keyword">`
 * GitHub marked, then the link right after it. GitHub marks a keyword whatever
 * the base branch, while `closingIssuesReferences` lists one only for a pull
 * request into the default branch; and which spellings count is GitHub's to
 * decide. A body cannot forge the mark: GitHub strips `class` from written HTML.
 */
export const closingKeywordIssuesInHtml = (
  repo: RepoRef,
  bodyHtml: string,
): readonly number[] =>
  Arr.uniq(
    Array.from(bodyHtml.matchAll(KEYWORD_THEN_LINK)).flatMap((match) => {
      const attributes = attributesOf(match.groups?.['attributes'] ?? '');

      const target = ISSUE_URL.exec(attributes.get('data-url') ?? '')?.groups;

      return target !== undefined &&
        attributes.get('data-hovercard-type') === 'issue' &&
        isRepo(repo, target['owner'], target['name'])
        ? numberOf(target['number'])
        : [];
    }),
  );

/**
 * Read from the text, outside fenced code, for a reader with neither GraphQL
 * nor a token: a closing keyword, then `#N` or this repository's issue URL. A
 * bare mention of `#N` is a cross-reference, which closes nothing.
 */
export const closingKeywordIssuesInText = (
  repo: RepoRef,
  body: string,
): readonly number[] =>
  Arr.uniq(
    Array.from(outsideCodeFences(body).matchAll(CLOSING_REFERENCE)).flatMap(
      (match) => {
        const { number, owner, name, urlNumber } = match.groups ?? {};

        return number !== undefined
          ? numberOf(number)
          : isRepo(repo, owner, name)
            ? numberOf(urlNumber)
            : [];
      },
    ),
  );

/** A keyword GitHub marked, then the link after it with only text between. */
const KEYWORD_THEN_LINK =
  /<span class="issue-keyword[ "][^>]*>[^<]*<\/span>[^<]*<a (?<attributes>[^>]*)>/gu;

const ISSUE_URL =
  /^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<name>[^/]+)\/issues\/(?<number>\d+)$/u;

const ATTRIBUTE = /(?<name>[\w-]+)="(?<value>[^"]*)"/gu;

const CLOSING_REFERENCE =
  /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\b[^\S\n]*:?[^\S\n]*(?:#(?<number>\d+)|https:\/\/github\.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)\/issues\/(?<urlNumber>\d+))\b/giu;

/** GitHub's owner and repository names are case-insensitive. */
const isRepo = (
  repo: RepoRef,
  owner: string | undefined,
  name: string | undefined,
): boolean =>
  owner?.toLowerCase() === repo.owner.toLowerCase() &&
  name?.toLowerCase() === repo.name.toLowerCase();

const numberOf = (digits: string | undefined): readonly number[] => {
  const parsed = Num.safeParseInt(digits ?? '');

  return Result.isOk(parsed) ? [parsed.value] : [];
};

/** The attributes of a tag GitHub wrote, which always quotes them. */
const attributesOf = (attributes: string): ReadonlyMap<string, string> =>
  new Map(
    Array.from(
      attributes.matchAll(ATTRIBUTE),
      (match) =>
        [match.groups?.['name'] ?? '', match.groups?.['value'] ?? ''] as const,
    ),
  );
