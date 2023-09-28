export type HistoryState = DeepReadonly<{
  index: SafeUint | -1;
  history: [SafeUint, SafeUint][];
}>;

export const defaultHistoryState = {
  index: -1,
  history: [],
} as const satisfies HistoryState;

type Idx = HistoryState['index'];

export const add1 = (index: Idx): SafeUint =>
  index === -1 ? toSafeUint(0) : SafeUint.add(index, 1);

export const sub1 = (index: Idx): Idx =>
  index === -1 ? -1 : index === 0 ? -1 : SafeUint.sub(index, 1);
