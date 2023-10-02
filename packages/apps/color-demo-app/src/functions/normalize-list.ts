export const normalizeList = (
  list: NonEmptyArray<NonNegativeFiniteNumber>
): NonEmptyArray<NonNegativeFiniteNumber> => {
  const maxValueInList = Arr.max(list);
  if (Num.isNonZero(maxValueInList)) {
    return Tpl.map(list, (l) => NonNegativeFiniteNumber.div(l, maxValueInList));
  }
  return list;
};
