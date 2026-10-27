import { Arr } from 'ts-data-forge';

/**
 * Labels as typed into one text field: separated by commas — ASCII `,`, or
 * the Japanese `、` and `，` an IME is likely to produce — trimmed, without
 * empty entries or repeats.
 */
export const parseLabels = (text: string): readonly string[] =>
  Arr.uniq(
    text
      .split(/[,、，]/u)
      .map((label) => label.trim())
      .filter((label) => label !== ''),
  );

export const formatLabels = (labels: readonly string[]): string =>
  labels.join(', ');
