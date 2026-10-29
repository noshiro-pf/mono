import { Arr } from 'ts-data-forge';

/** `labels` with each of `added` that it has in no case. */
export const withLabelsAdded = (
  labels: readonly string[],
  added: readonly string[],
): readonly string[] =>
  added.reduce<readonly string[]>(
    (kept, label) =>
      kept.some((each) => sameLabel(each, label))
        ? kept
        : Arr.toPushed(kept, label),
    labels,
  );

/**
 * Whether `a` and `b` are the same label, perhaps in different cases or
 * widths — `ＵＩ` as an IME may type it is `UI`.
 */
export const sameLabel = (a: string, b: string): boolean =>
  labelKey(a) === labelKey(b);

/** What is the same for every spelling of a label ({@link sameLabel}). */
export const labelKey = (label: string): string =>
  label
    .replaceAll(FULL_WIDTH_ASCII, (wide) =>
      String.fromCodePoint((wide.codePointAt(0) ?? 0) - FULL_WIDTH_OFFSET),
    )
    .replaceAll(HALF_WIDTH_KANA, (narrow) => narrow.normalize('NFKC'))
    .toLowerCase();

/** Runs of half-width katakana, which may carry their voicing marks. */
const HALF_WIDTH_KANA = /[｡-ﾟ]+/gu;

/** The full-width forms of the printable ASCII characters but space. */
const FULL_WIDTH_ASCII = /[！-～]/gu;

const FULL_WIDTH_OFFSET = 0xfee0;
