import { getAlphabets } from '@noshiro/ts-utils-additional';
import { type Group, type NumGroups } from '../types';

export const generateGroups = (
  numGroups: NumGroups,
  nameList: readonly string[]
): readonly Group[] => {
  const nameListWithRand: DeepReadonly<[string, number, number][]> = pipe(
    nameList
  )
    .chain((list) => Tpl.map(list, (n, i) => tp(n, i, Math.random())))
    .chain((list) =>
      Arr.sorted(list, ([_n1, _i1, r1], [_n2, _i2, r2]) => r1 - r2)
    ).value;

  return getAlphabets('upper')
    .filter((_, i) => i < numGroups)
    .map((al, idx) => ({
      no: al,
      nameList: pipe(nameListWithRand)
        .chain((list) =>
          list.filter((_, i) =>
            Num.isInRange(
              Math.floor(nameList.length * (idx / numGroups)),
              Math.floor(nameList.length * ((idx + 1) / numGroups)) - 1
            )(i)
          )
        )
        .chain((list) => Arr.sortedBy(list, ([_, i]) => i))
        .chain((list) => Tpl.map(list, ([n]) => n)).value,
    }));
};
