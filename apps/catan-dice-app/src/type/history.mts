import { Uint32, asUint32 } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';

export type HistoryState = DeepReadonly<{
  index: Uint32 | -1;
  history: [Uint32, Uint32][];
}>;

export const defaultHistoryState = {
  index: -1,
  history: [],
} as const satisfies HistoryState;

type Idx = HistoryState['index'];

export const add1 = (index: Idx): Uint32 =>
  index === -1 ? asUint32(0) : Uint32.add(index, 1);

export const sub1 = (index: Idx): Idx =>
  index === -1 || index === 0 ? -1 : Uint32.sub(index, 1);
