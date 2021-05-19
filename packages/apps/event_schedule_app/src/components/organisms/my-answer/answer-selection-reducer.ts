import type { ReducerType } from '@noshiro/ts-utils';
import type { AnswerSymbolIconId, IDatetimeRange } from '../../../types';
import type { IList } from '../../../utils';
import { IMap } from '../../../utils';

export type AnswerSelectionReducerAction = Readonly<
  | {
      type: 'cell';
      datetimeRange: IDatetimeRange;
      icon: AnswerSymbolIconId | undefined;
    }
  | {
      type: 'header';
      icon: AnswerSymbolIconId | undefined;
      datetimeRangeList: IList<IDatetimeRange>;
    }
>;

export type AnswerSelectionReducerState = IMap<
  IDatetimeRange,
  AnswerSymbolIconId | undefined
>;

export const answerSelectionReducer: ReducerType<
  AnswerSelectionReducerState,
  AnswerSelectionReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'cell':
      return state.set(action.datetimeRange, action.icon);
    case 'header':
      return IMap(action.datetimeRangeList.map((d) => [d, action.icon]));
  }
};
