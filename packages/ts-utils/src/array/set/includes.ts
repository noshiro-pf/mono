export function includes<A, B>(
  array: readonly A[],
  target: B,
  mapFn: (v: A) => B
): boolean {
  return array.findIndex((a) => mapFn(a) === target) !== -1;
}
