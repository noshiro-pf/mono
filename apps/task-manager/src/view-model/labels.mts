import { Arr } from 'ts-data-forge';
import { labelKey, sameLabel, type DomainState } from '../domain/index.mjs';

/**
 * Labels as typed into one text field: separated by commas — ASCII `,`, or
 * the Japanese `、` and `，` an IME is likely to produce — trimmed, without
 * empty entries or repeats.
 */
export const parseLabels = (text: string): readonly string[] =>
  Arr.uniq(
    text
      .split(SEPARATOR)
      .map((label) => label.trim())
      .filter((label) => label !== ''),
  );

export const formatLabels = (labels: readonly string[]): string =>
  labels.join(', ');

/**
 * What is typed into a label box: the labels a comma has ended, and what is
 * still being typed after the last comma, without the spaces before it.
 */
export const splitTypedLabels = (
  text: string,
): Readonly<{ ended: readonly string[]; rest: string }> => {
  const end = text.search(LAST_SEPARATOR);

  return end === -1
    ? ({ ended: [], rest: text } as const)
    : ({
        ended: parseLabels(text.slice(0, end)),
        rest: text.slice(end + 1).trimStart(),
      } as const);
};

/**
 * Every label on a task, once each, in any case: the most used first, then
 * by name. A label used in several cases is counted in all of them, and
 * spelled as it is most used.
 */
export const labelsByUse = (state: DomainState): readonly string[] => {
  const spellings = Arr.countBy(
    state.tasks.flatMap(({ labels }) => labels),
    (label) => label,
  )
    .toArray()
    .toSorted(byUse);

  const mut_labels = new Map<string, readonly [string, number]>();

  for (const [spelling, count] of spellings) {
    const key = labelKey(spelling);

    const known = mut_labels.get(key);

    mut_labels.set(
      key,
      known === undefined ? [spelling, count] : [known[0], known[1] + count],
    );
  }

  return Array.from(mut_labels.values())
    .toSorted(byUse)
    .map(([label]) => label);
};

/**
 * Each of `labels` spelled as the first of `known` that is the same label in
 * some case or width, if any, so that typing one in use adds it as in use.
 */
export const spellAsInUse = (
  labels: readonly string[],
  known: readonly string[],
): readonly string[] =>
  labels.map((label) => known.find((each) => sameLabel(each, label)) ?? label);

/**
 * The labels of `known`, in its order, to suggest for `typed`: those that
 * start with it, then those that contain it, ignoring case, without those
 * `chosen` has in any case; none while nothing is typed.
 */
export const suggestLabels = (
  known: readonly string[],
  chosen: readonly string[],
  typed: string,
): readonly string[] => {
  const query = labelKey(typed.trim());

  if (query === '') {
    return [];
  }

  const taken = new Set(chosen.map(labelKey));

  const open = known
    .map((label) => [label, labelKey(label)] as const)
    .filter(([, lower]) => !taken.has(lower));

  return [
    ...open.filter(([, lower]) => lower.startsWith(query)),
    ...open.filter(
      ([, lower]) => !lower.startsWith(query) && lower.includes(query),
    ),
  ]
    .slice(0, MAX_SUGGESTIONS)
    .map(([label]) => label);
};

const SEPARATORS = ',、，';

const SEPARATOR = new RegExp(`[${SEPARATORS}]`, 'u');

/** The last separator, and what follows it. */
const LAST_SEPARATOR = new RegExp(`[${SEPARATORS}][^${SEPARATORS}]*$`, 'u');

const MAX_SUGGESTIONS = 8;

const byUse = (
  [a, m]: readonly [string, number],
  [b, n]: readonly [string, number],
): number => (m !== n ? n - m : a.localeCompare(b, 'en'));
