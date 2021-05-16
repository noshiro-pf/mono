import type { ReducerType } from '@noshiro/ts-utils';
import type { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import type { IDatetimeRange } from '../../../types/record/datetime-range';
import type { IList } from '../../../utils/immutable';
import { IMap } from '../../../utils/immutable';

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
