/** @internal */
export const testArrayEquality = <T>({
  testName,
  target,
  toBe,
}: {
  testName: string;
  target: readonly T[];
  toBe: readonly T[];
}): void => {
  test(testName, () => {
    expect(target).toEqual(toBe);
  });
};
