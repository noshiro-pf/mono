// A module with a `createState` of its own, which is not synstate's: what is
// made through it is no state, for `no-write-during-propagation.typed.test.mts`.
export const createState = <A,>(
  initialValue: A,
): readonly [A, (value: A) => void] => [initialValue, () => {}] as const;
