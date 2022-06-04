export const normalizeList = (list: readonly number[]): readonly number[] => {
  const maxValueInList = IList.max(list);
  if (maxValueInList === undefined || maxValueInList === 0) return list;
  return list.map((l) => l / maxValueInList);
};
