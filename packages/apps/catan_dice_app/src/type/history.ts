import { IList, IRecord } from '../immutable';

type IHistoryState = {
  index: number;
  history: IList<[number, number]>;
};

export const HistoryState = IRecord<IHistoryState>({
  index: -1,
  history: IList<[number, number]>([]),
});

export type THistoryState = IRecord<IHistoryState> & Readonly<IHistoryState>;
