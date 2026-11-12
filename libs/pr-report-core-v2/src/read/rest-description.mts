/**
 * What `pr-description` reads and writes over REST: a description, whether it
 * is an issue's or a pull request's, the open issues' texts, and a new issue.
 * A pull request's description and an issue's are the same field of the same
 * object to the issues route, so each takes either.
 */

import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  descriptionKindOf,
  lfOnly,
  type DescriptionKind,
} from '../conventions/index.mjs';
import type { OpenIssueText } from '../decide/index.mjs';
import type { Read } from '../snapshot/index.mjs';
import { malformed } from './classify.mjs';
import { answersAsContext, restAllPages, restGet, restWrite } from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * The description of `#number`, LF only, and whether it is a pull request's: the
 * issues route answers both, and says which by `pull_request`. One transferred
 * away answers, redirected, as another repository's, and is refused: an edit
 * pushed back would land there (**Changed in v2**: v1 followed it).
 */
export const readDescription = async (
  context: ReadContext,
  number: number,
): Promise<Read<Readonly<{ body: string; kind: DescriptionKind }>>> => {
  const issue = await restGet(
    context,
    `#${number}`,
    `/issues/${number}`,
    t.record({
      body: t.union([t.string(), t.nullType]),
      repository_url: t.string(),
      pull_request: t.optional(t.unknown()),
    }),
  );

  if (Result.isErr(issue)) {
    return issue;
  }

  return answersAsContext(issue.value.repository_url, context)
    ? Result.ok({
        body: lfOnly(issue.value.body ?? ''),
        kind: descriptionKindOf(issue.value),
      })
    : // `malformed`, as `ReadError` has an answer not of what was asked;
      // `refused` is GitHub's refusal, which this is not.
      Result.err(
        malformed(
          `#${number}`,
          `it answers as ${issue.value.repository_url.split('/repos/', 2).at(1) ?? 'another repository'}'s: transferred, it is edited there`,
        ),
      );
};

/**
 * Writes `body` as the description of `#number`. Its caller reads it first
 * ({@link readDescription}), which refuses one transferred away; one
 * transferred in the seconds between answers the write with a redirect, which a
 * command's transport does not follow for a write.
 */
export const writeDescription = async (
  context: ReadContext,
  number: number,
  body: string,
): Promise<Read<undefined>> =>
  Result.map(
    await restWrite(
      context,
      `the description of #${number}`,
      'PATCH',
      `/issues/${number}`,
      { body },
      t.unknown(),
    ),
    () => undefined,
  );

/** The open issues, every page, without the pull requests the route answers too. */
export const readOpenIssueTexts = async (
  context: ReadContext,
): Promise<Read<readonly OpenIssueText[]>> =>
  Result.map(
    await restAllPages(
      context,
      'the open issues',
      '/issues?state=open',
      t.array(OpenIssueSchema),
    ),
    (issues) =>
      Arr.generate(function* () {
        for (const issue of issues) {
          if (descriptionKindOf(issue) === 'issue') {
            yield {
              number: issue.number,
              title: issue.title,
              body: lfOnly(issue.body ?? ''),
              url: issue.html_url,
            };
          }
        }
      }),
  );

/** Files an issue; answers its number and URL. */
export const createIssue = async (
  context: ReadContext,
  issue: Readonly<{ title: string; body: string; labels: readonly string[] }>,
): Promise<Read<Readonly<{ number: number; url: string }>>> =>
  Result.map(
    await restWrite(
      context,
      'a new issue',
      'POST',
      '/issues',
      issue,
      t.record({ number: t.number(), html_url: t.string() }),
    ),
    ({ number, html_url: url }) => ({ number, url }),
  );

const OpenIssueSchema = t.record({
  number: t.number(),
  title: t.string(),
  body: t.union([t.string(), t.nullType]),
  html_url: t.string(),
  pull_request: t.optional(t.unknown()),
});
