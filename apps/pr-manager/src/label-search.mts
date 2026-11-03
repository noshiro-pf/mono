/**
 * Labels in GitHub's search syntax, for the "on GitHub" links of the merge
 * order (`merge-order-view.mts`) and of the issues (`issues-search.mts`), so
 * that the two write a label alike. Every name is quoted, since a label's name
 * can hold a space or a comma; a quote in it, which GitHub's search cannot
 * take, is left out.
 */

/** `label:"a","b"`, which GitHub reads as any of them. */
export const anyLabelQualifier = (names: readonly string[]): string =>
  `label:${names.map(quoted).join(',')}` as const;

/** `-label:"a"`, which leaves out what carries it. */
export const notLabelQualifier = (name: string): string =>
  `-label:${quoted(name)}` as const;

const quoted = (name: string): string =>
  `"${name.replaceAll('"', '')}"` as const;
