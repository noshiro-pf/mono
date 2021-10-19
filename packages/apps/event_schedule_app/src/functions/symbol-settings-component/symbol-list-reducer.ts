import type {
  AnswerSymbolId,
  AnswerSymbolPoint,
  SymbolSettings,
} from '@noshiro/event-schedule-app-shared';
import { IRecord } from '@noshiro/ts-utils';

export type SymbolListReducerAction =
  | {
      type: 'update-description';
      iconId: AnswerSymbolId;
      description: string;
    }
  | {
      type: 'update-point';
      iconId: AnswerSymbolId;
      point: AnswerSymbolPoint;
    };

export type SymbolListReducerState = SymbolSettings;

export const symbolListReducer: ReducerType<
  SymbolListReducerState,
  SymbolListReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'update-description':
      return IRecord.setIn(
        state,
        [action.iconId, 'description'],
        action.description
      );
    case 'update-point':
      return IRecord.setIn(state, [action.iconId, 'point'], action.point);
  }
};
