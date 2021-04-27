/** @internal */
export const testArrayEquality = <T>({
  testName,
  target,
  toBe,
}: {
  testName: string;
  target: readonly T[] | undefined;
  toBe: readonly T[] | undefined;
}): void => {
  test(testName, () => {
    expect(target).toEqual(toBe);
  });
};
