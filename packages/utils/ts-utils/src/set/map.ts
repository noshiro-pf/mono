export const mappedSet = <A, B>(set: Set<A>, mapFn: (a: A) => B): Set<B> => {
  const mapped = new Set<B>();
  for (const e of set) {
    mapped.add(mapFn(e));
  }
  return mapped;
};
