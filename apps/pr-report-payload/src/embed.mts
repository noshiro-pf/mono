/**
 * How the payload travels: as a block inside the body of the report issue.
 *
 * The issue is the transport because it is already there. `pr-report` writes
 * one body and overwrites it on every run, the repository is public so anyone
 * — including a browser with no token — can read it back, and the report
 * stays a thing a person can read without an app. Carrying the data in the
 * same body means the two cannot drift apart: there is no second place to
 * update, and no moment where the prose and the numbers disagree.
 *
 * Both sides of that convention live here, so that the writer cannot invent a
 * marker the reader does not look for.
 */

import { hasKey, isNumber, isRecord, Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  PAYLOAD_VERSION,
  PrReportPayloadSchema,
  type PrReportPayload,
} from './payload.mjs';

/**
 * The payload as the block to append to the report's Markdown.
 *
 * Three properties are wanted at once, and the shape is what gets all three.
 * A reader of the issue should not have to look at it — hence `<details>`,
 * collapsed, at the bottom. A writer of a pull request title should not be
 * able to break it — hence one line of JSON inside a fence, which nothing can
 * escape, because escaping a fence needs a newline and `JSON.stringify`
 * writes none. And the reader has to find it without parsing Markdown — hence
 * the two comment markers, which render as nothing at all.
 */
export const embedPayload = (payload: PrReportPayload): string =>
  [
    PAYLOAD_BEGIN,
    '<details>',
    '<summary>Machine-readable copy of this report</summary>',
    '',
    '```json',
    JSON.stringify(payload),
    '```',
    '',
    '</details>',
    PAYLOAD_END,
  ].join('\n');

/**
 * The payload back out of an issue body, or a sentence saying why not.
 *
 * Every failure here is one a reader of the app will see, so each says what
 * happened rather than what was expected: an issue written by a `pr-report`
 * too old to embed anything, a version this build does not read, or a body
 * that has been edited by hand.
 */
export const extractPayload = (
  issueBody: string,
): Result<PrReportPayload, string> => {
  const json = extractJsonLine(issueBody);

  if (json === undefined) {
    return Result.err(
      'This report carries no machine-readable payload. It was written by a version of `pr-report` that did not embed one; the next run will.',
    );
  }

  const parsed = Json.parse(json);

  if (Result.isErr(parsed)) {
    return Result.err(`The payload is not JSON: ${parsed.value}`);
  }

  const version = readVersion(parsed.value);

  if (version !== undefined && version !== PAYLOAD_VERSION) {
    return Result.err(
      `The payload is version ${version} and this app reads version ${PAYLOAD_VERSION}. The two are deployed together, so this passes on its own: reload once the next report is written.`,
    );
  }

  const validated = PrReportPayloadSchema.validate(parsed.value);

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
const PAYLOAD_BEGIN = '<!-- pr-report:payload:begin -->';

const PAYLOAD_END = '<!-- pr-report:payload:end -->';

/**
 * The one line of JSON between the markers, found by scanning lines rather
 * than by a regular expression over the whole body: the body is other
 * people's prose, and a search that can match across lines is a search a
 * title can be written to fool.
 */
const extractJsonLine = (issueBody: string): string | undefined => {
  const lines = issueBody.split('\n').map((line) => line.trimEnd());

  const begin = lines.indexOf(PAYLOAD_BEGIN);

  if (begin === -1) return undefined;

  const end = lines.indexOf(PAYLOAD_END, begin + 1);

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
