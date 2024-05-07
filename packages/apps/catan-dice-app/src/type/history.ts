export type HistoryState = DeepReadonly<{
  index: NumberType.ArraySize | -1;
  history: [NumberType.ArraySize, NumberType.ArraySize][];
}>;

export const defaultHistoryState = {
  index: -1,
  history: [],
} as const satisfies HistoryState;

type Idx = HistoryState['index'];

export const add1 = (index: Idx): NumberType.ArraySize =>
  index === -1 ? toUint32(0) : Uint32.add(index, 1);

export const sub1 = (index: Idx): Idx =>
  index === -1 ? -1 : index === 0 ? -1 : Uint32.sub(index, 1);
