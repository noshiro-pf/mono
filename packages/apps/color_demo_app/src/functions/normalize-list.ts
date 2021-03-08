import { max } from '@noshiro/ts-utils';

export const normalizeList = (list: readonly number[]): readonly number[] => {
  const maxValueInList = max(list);
  if (maxValueInList === undefined || maxValueInList === 0) return list;
  return list.map((l) => l / maxValueInList);
};
