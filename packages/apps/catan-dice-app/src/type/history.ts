export type HistoryState = DeepReadonly<{
  index: Uint32 | -1;
  history: [Uint32, Uint32][];
}>;

export const defaultHistoryState: HistoryState = {
  index: -1,
  history: [],
} as const;

type Idx = HistoryState['index'];

export const incrementHistoryIndex = (
  index: Idx,
  historySize: Uint32
): Uint32 =>
  index === -1
    ? toUint32(0)
    : Uint32.min(Uint32.sub0(historySize, 1), Uint32.add(index, 1));

export const decrementHistoryIndex = (index: Idx): Idx =>
  index === -1 ? -1 : index === 0 ? -1 : Uint32.sub0(index, 1);
