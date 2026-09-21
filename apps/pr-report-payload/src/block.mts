/**
 * How a payload travels: as a block inside the body of a GitHub issue.
 *
 * The issue is the transport because it is already there. A report writes one
 * body and overwrites it on every run, the repository is public so anyone —
 * including a browser with no token — can read it back, and the body stays
 * something a person can read without an app. Carrying the data in the same
 * body means the two cannot drift apart: there is no second place to update,
 * and no moment where the prose and the numbers disagree.
 *
 * Both sides of that convention live here, so that a writer cannot invent a
 * marker its reader does not look for.
 */

import { hasKey, isNumber, isRecord, Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';

/**
 * Which block, of the ones an issue body may carry. The name is the whole of
 * the marker, so adding a kind is adding a member here.
 */
export type BlockKind = 'pr-report:payload' | 'unblock-prs:log';

/**
 * A payload as the block to append to an issue's Markdown.
 *
 * Three properties are wanted at once, and the shape is what gets all three.
 * A reader of the issue should not have to look at it — hence `<details>`,
 * collapsed, at the bottom. A writer of a pull request title should not be
 * able to break it — hence one line of JSON inside a fence, which nothing can
 * escape, because escaping a fence needs a newline and `JSON.stringify`
 * writes none. And the reader has to find it without parsing Markdown — hence
 * the two comment markers, which render as nothing at all.
 */
export const embedBlock = (kind: BlockKind, payload: unknown): string =>
  [
    beginMarker(kind),
    '<details>',
    '<summary>Machine-readable copy of this report</summary>',
    '',
    '```json',
    JSON.stringify(payload),
    '```',
    '',
    '</details>',
    endMarker(kind),
  ].join('\n');

/**
 * A payload back out of an issue body, or a sentence saying why not.
 *
 * Every failure here is one a reader of the app will see, so each says what
 * happened rather than what was expected: an issue written before there was a
 * block to write, a version this build does not read, or a body that has been
 * edited by hand.
 */
export const extractBlock = <A,>(
  kind: BlockKind,
  version: number,
  schema: t.Type<A>,
  issueBody: string,
): Result<A, string> => {
  const json = extractJsonLine(kind, issueBody);

  if (json === undefined) {
    return Result.err(
      `This issue carries no machine-readable \`${kind}\` block. It was written by a version that did not embed one; the next run will.`,
    );
  }

  const parsed = Json.parse(json);

  if (Result.isErr(parsed)) {
    return Result.err(`The payload is not JSON: ${parsed.value}`);
  }

  const written = readVersion(parsed.value);

  if (written !== undefined && written !== version) {
    return Result.err(
      `The payload is version ${written} and this app reads version ${version}. The two are deployed together, so this passes on its own: reload once the next report is written.`,
    );
  }

  const validated = schema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(
        `The payload is not the shape this app reads:\n${t.validationErrorsToMessages(validated.value).join('\n')}`,
      )
    : Result.ok(validated.value);
};

/**
 * Written at the start of a line and nowhere else, which is what makes the
 * scan below safe. A pull request title containing one of these strings ends
 * up inside the JSON — one line, beginning with `{` — so it can never be at
 * the start of a line, and never be mistaken for the marker itself.
 */
const beginMarker = (kind: BlockKind): string =>
  `<!-- ${kind}:begin -->` as const;

const endMarker = (kind: BlockKind): string => `<!-- ${kind}:end -->` as const;

/**
 * The one line of JSON between the markers, found by scanning lines rather
 * than by a regular expression over the whole body: the body is other
 * people's prose, and a search that can match across lines is a search a
 * title can be written to fool.
 */
const extractJsonLine = (
  kind: BlockKind,
  issueBody: string,
): string | undefined => {
  const lines = issueBody.split('\n').map((line) => line.trimEnd());

  const begin = lines.indexOf(beginMarker(kind));

  if (begin === -1) return undefined;

  const end = lines.indexOf(endMarker(kind), begin + 1);

  if (end === -1) return undefined;

  return lines
    .slice(begin + 1, end)
    .find((line) => line.startsWith('{') && line.endsWith('}'));
};

/** The version out of a payload that has not been validated yet. */
const readVersion = (parsed: unknown): number | undefined =>
  isRecord(parsed) && hasKey(parsed, 'version') && isNumber(parsed.version)
    ? parsed.version
    : undefined;
