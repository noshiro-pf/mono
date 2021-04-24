export type GroupedSetDiffKeyType = 'added' | 'deleted' | 'updated';

type GroupedSetDiff<T> = {
  [key in GroupedSetDiffKeyType]: Set<T>;
};

export type IGroupedSetDiffType<T> = Map<GroupedSetDiffKeyType, Set<T>>;

export const IGroupedSetDiff = <T>({
  deleted,
  added,
  updated,
}: Partial<GroupedSetDiff<T>>): IGroupedSetDiffType<T> =>
  new Map<GroupedSetDiffKeyType, Set<T>>([
    ['deleted', deleted ?? new Set<T>()],
    ['added', added ?? new Set<T>()],
    ['updated', updated ?? new Set<T>()],
  ]);
