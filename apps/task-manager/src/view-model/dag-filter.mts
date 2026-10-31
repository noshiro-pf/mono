/**
 * Which part of the graph the graph screen shows: the nodes of some groups, the
 * tasks with some labels, or both — a theme at a time, when the whole is too
 * large to read. A view only: nothing is moved, and every node keeps its place
 * in the arrangement (`dag/node-filter.mts` says what it leaves out).
 *
 * Kept in the URL's query, as `?group=<id>&label=<label>`, one parameter per
 * choice, so that a theme can be bookmarked; an empty value is 「グループなし」
 * or 「ラベルなし」. Written while the graph is shown only, as its mode is
 * (`store/view-query-sync.mts`), and every other parameter is left where it is.
 */

import { Arr } from 'ts-data-forge';
import { asGroupId, type GroupId } from '../domain/index.mjs';

export type DagFilter = Readonly<{
  /** The groups whose nodes are shown; `undefined` is the nodes in none. */
  groups: readonly (GroupId | undefined)[];
  /** The labels whose tasks are shown; `undefined` is the tasks with none. */
  labels: readonly (string | undefined)[];
}>;

/** Every node: no group or label chosen. */
export const NO_DAG_FILTER: DagFilter = { groups: [], labels: [] } as const;

export const isDagFilterEmpty = (filter: DagFilter): boolean =>
  Arr.isEmpty(filter.groups) && Arr.isEmpty(filter.labels);

/** The filter `search` asks for; repeats are read once. */
export const parseDagFilterQuery = (search: string): DagFilter => {
  const params = new URLSearchParams(search);

  return {
    groups: Arr.uniq(params.getAll(GROUP_KEY)).map((value) =>
      value === '' ? undefined : asGroupId(value),
    ),
    labels: Arr.uniq(params.getAll(LABEL_KEY)).map((value) =>
      value === '' ? undefined : value,
    ),
  } as const;
};

/**
 * `search` saying that `filter` is shown, with a `?` unless it is empty, or
 * `search` itself when it already says so.
 */
export const withDagFilterQuery = (
  search: string,
  filter: DagFilter,
): string => {
  const params = new URLSearchParams(search);

  const groups = filter.groups.map((id) => id ?? '');

  const labels = filter.labels.map((label) => label ?? '');

  if (
    sameValues(params.getAll(GROUP_KEY), groups) &&
    sameValues(params.getAll(LABEL_KEY), labels)
  ) {
    return search;
  }

  params.delete(GROUP_KEY);

  params.delete(LABEL_KEY);

  for (const id of groups) {
    params.append(GROUP_KEY, id);
  }

  for (const label of labels) {
    params.append(LABEL_KEY, label);
  }

  const query = params.toString();

  return query === '' ? '' : `?${query}`;
};

/** `values` with `value` taken out if it is there, put at the end if not. */
export const toggled = <T,>(values: readonly T[], value: T): readonly T[] =>
  values.includes(value)
    ? values.filter((v) => v !== value)
    : Arr.concat(values, [value]);

const GROUP_KEY = 'group';

const LABEL_KEY = 'label';

const sameValues = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((value, i) => value === b[i]);
