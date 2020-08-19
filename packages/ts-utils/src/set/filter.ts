export const filter = <A>(set: Set<A>, filterFn: (a: A) => boolean): Set<A> => {
  const filtered = new Set<A>();
  for (const e of set) {
    if (filterFn(e)) {
      filtered.add(e);
    }
  }
  return filtered;
};
