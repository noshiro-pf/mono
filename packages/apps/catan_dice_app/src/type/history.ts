import { IList, IRecord } from '../immutable';

type IHistoryState = Readonly<{
  index: number;
  history: IList<readonly [number, number]>;
}>;

export const HistoryState = IRecord<IHistoryState>({
  index: -1,
  history: IList<readonly [number, number]>([]),
} as const);

export type THistoryState = IRecord<IHistoryState> & Readonly<IHistoryState>;
