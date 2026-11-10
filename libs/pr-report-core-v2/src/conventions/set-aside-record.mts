/** The record `unblock-prs` writes on a pull request it set aside. */

import { firstLineOf } from './records.mjs';

export const writeSetAsideComment = (
  record: SetAsideRecord,
  prose: string,
): string =>
  [
    setAsideLine(record),
    '',
    prose.trim(),
    '',
    '- [ ] Retry: tick this box and the next survey tries this pull request again.',
  ].join('\n');

/** One resolved line, then one line of prose saying why. */
export const writeResolvedSetAsideComment = (prose: string): string =>
  [SET_ASIDE_RESOLVED, '', prose.trim()].join('\n');

/**
 * A standing comment with `baseSha` as its base and every other line, the retry
 * box included, kept; anything else unchanged.
 */
export const moveSetAsideBase = (body: string, baseSha: string): string => {
  // The record is the line the parser reads ({@link firstLineOf}); the rest of
  // the trimmed body is kept as it is.
  const record = parseSetAsideLine(firstLineOf(body));

  const text = body.trimStart();

  const end = text.indexOf('\n');

  return record === undefined
    ? body
    : `${setAsideLine({ ...record, baseSha })}${end === -1 ? '' : text.slice(end)}`;
};

export const parseSetAsideComment = (
  body: string,
): SetAsideComment | undefined => {
  const first = firstLineOf(body);

  if (first === SET_ASIDE_RESOLVED) {
    return { kind: 'resolved' };
  }

  const record = parseSetAsideLine(first);

  if (record === undefined) {
    return undefined;
  }

  // The last line only: a box in the prose is not the one written here.
  const mark = RETRY_LINE.exec(lastLineOf(body))?.groups?.['mark'];

  return {
    kind: 'standing',
    record,
    retry: mark !== undefined && mark !== ' ',
  };
};

export type SetAsideRecord = Readonly<{
  /** `[a-z][a-z-]*`; a reason the reader does not know is still a record. */
  reason: string;
  /** The head it was set aside at. */
  headSha: string;
  /** The tip of the base when it was set aside. */
  baseSha: string;
}>;

export type SetAsideComment = Readonly<
  | { kind: 'resolved' }
  | { kind: 'standing'; record: SetAsideRecord; retry: boolean }
>;

const SET_ASIDE_RESOLVED = '<!-- unblock-prs:set-aside resolved -->';

const SET_ASIDE_LINE =
  /^<!-- unblock-prs:set-aside reason=(?<reason>[a-z][a-z-]*) head=(?<headSha>[0-9a-f]{40}) base=(?<baseSha>[0-9a-f]{40}) -->$/u;

const RETRY_LINE = /^[-*] \[(?<mark>[ xX])\] Retry:/u;

const setAsideLine = ({ reason, headSha, baseSha }: SetAsideRecord): string =>
  `<!-- unblock-prs:set-aside reason=${reason} head=${headSha} base=${baseSha} -->` as const;

const parseSetAsideLine = (line: string): SetAsideRecord | undefined => {
  const groups = SET_ASIDE_LINE.exec(line)?.groups;

  const reason = groups?.['reason'];

  const headSha = groups?.['headSha'];

  const baseSha = groups?.['baseSha'];

  return reason === undefined || headSha === undefined || baseSha === undefined
    ? undefined
    : { reason, headSha, baseSha };
};

const lastLineOf = (body: string): string =>
  body.trim().split(/\r?\n/u).at(-1)?.trim() ?? '';
