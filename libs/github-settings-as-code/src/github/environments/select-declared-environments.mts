/**
 * The live environments `apply` may write back: those whose name a declaration
 * file names. One that exists only on GitHub (made in the UI, or created by
 * GitHub when a workflow names it) is left to the drift check rather than
 * adopted as a declaration.
 */
export const selectDeclaredEnvironments = <
  const E extends Readonly<{ name: string }>,
>(
  live: readonly E[],
  declared: readonly Readonly<{ name: string }>[],
): readonly E[] => {
  const declaredNames: ReadonlySet<string> = new Set(
    declared.map((e) => e.name),
  );

  return live.filter((e) => declaredNames.has(e.name));
};
