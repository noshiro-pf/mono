import * as t from 'ts-fortress';
import { type StrictExclude } from 'ts-type-forge';
import {
  displayStatuses,
  type DisplayStatus,
  type Task,
  type TaskId,
} from './types.mjs';

/**
 * `tasks` sorted by `keys` lexicographically: an earlier key decides, and a
 * tie falls through to the next one, then to the id (compared by code unit),
 * so the result does not depend on the input order. A task with no value for
 * a key — no due date, no estimate, no entry in `depthById` or
 * `displayStatusById` — comes last whichever the order. Status follows the
 * order of {@link displayStatuses}, and priority ascending puts `1` (the
 * highest) first.
 * Titles are compared with an `Intl.Collator` for `locale`, by default
 * `'ja'`.
 *
 * Returns a new array; `tasks` is left as it is.
 */
export const sortTasks = (
  tasks: readonly Task[],
  keys: readonly SortSpec[],
  context: SortContext = {},
): readonly Task[] => {
  const collator = new Intl.Collator(context.locale ?? 'ja');

  const compareBy = ({ key, order }: SortSpec, a: Task, b: Task): number => {
    if (key === 'title') {
      const ascending = collator.compare(a.title, b.title);

      return order === 'asc' ? ascending : -ascending;
    }

    return compareMissingLast(
      numericValue(key, a, context),
      numericValue(key, b, context),
      order,
    );
  };

  return tasks.toSorted((a, b) => {
    for (const spec of keys) {
      const result = compareBy(spec, a, b);

      if (result !== 0) {
        return result;
      }
    }

    return compareIds(a.id, b.id);
  });
};

export const sortKeys = [
  'title',
  'dueDate',
  'priority',
  'status',
  'depth',
  'createdAt',
  'updatedAt',
  'estimate',
] as const;

export const SortKeyCodec = t.enumType(sortKeys);

export type SortKey = t.TypeOf<typeof SortKeyCodec>;

export type SortOrder = 'asc' | 'desc';

export type SortSpec = Readonly<{
  key: SortKey;
  order: SortOrder;
}>;

export type SortContext = Readonly<{
  /**
   * The `depth` sort key: the `tasks` of `dependencyDepth` over the whole
   * state, not only the tasks being sorted, which may be a filtered subset.
   */
  depthById?: ReadonlyMap<TaskId, number>;
  /**
   * The `status` sort key, from `displayStatus` — which depends on the time,
   * so it is computed by the caller along with everything else it shows.
   */
  displayStatusById?: ReadonlyMap<TaskId, DisplayStatus>;
  /** For comparing titles. Defaults to `'ja'`. */
  locale?: string;
}>;

const numericValue = (
  key: StrictExclude<SortKey, 'title'>,
  task: Task,
  { depthById, displayStatusById }: SortContext,
): number | undefined => {
  switch (key) {
    case 'dueDate':
    case 'priority':
    case 'createdAt':
    case 'updatedAt':
      return task[key];

    case 'estimate':
      return task.estimateHours;

    case 'status': {
      const shown = displayStatusById?.get(task.id);

      return shown === undefined ? undefined : displayStatuses.indexOf(shown);
    }

    case 'depth':
      return depthById?.get(task.id);
  }
};

/** Orders `x` and `y` by `order`, with `undefined` last either way. */
const compareMissingLast = (
  x: number | undefined,
  y: number | undefined,
  order: SortOrder,
): number =>
  x === undefined || y === undefined
    ? (x === undefined ? 1 : 0) - (y === undefined ? 1 : 0)
    : order === 'asc'
      ? x - y
      : y - x;

const compareIds = (a: TaskId, b: TaskId): number =>
  a < b ? -1 : a > b ? 1 : 0;
