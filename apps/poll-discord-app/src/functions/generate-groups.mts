import { Arr, Num, pipe, tp } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import { type Group, type NumGroups } from '../types/index.mjs';
import { upperAlphabets } from '../utils/index.mjs';

export const generateGroups = (
  numGroups: NumGroups,
  nameList: readonly string[],
): readonly Group[] => {
  const nameListWithRand: DeepReadonly<[string, number, number][]> = pipe(
    nameList,
  )
    .map((list) => list.map((n, i) => tp(n, i, Math.random())))
    .map((list) =>
      list.toSorted(([_n1, _i1, r1], [_n2, _i2, r2]) => r1 - r2),
    ).value;

  return upperAlphabets
    .filter((_, i) => i < numGroups)
    .map((al, idx) => ({
      no: al,
      nameList: pipe(nameListWithRand)
        .map((list) =>
          list.filter((_, i) =>
            Num.isInRange(
              Math.floor(nameList.length * (idx / numGroups)),
              Math.floor(nameList.length * ((idx + 1) / numGroups)),
            )(i),
          ),
        )
        .map((list) => Arr.toSortedBy(list, ([_, i]) => i))
        .map((list) => list.map(([n]) => n)).value,
    }));
};
