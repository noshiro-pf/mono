import { ReducerType } from '@mono/ts-utils';
import { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import { AnswerSymbolPointEnumType } from '../../../types/enum/answer-symbol-point';
import { IAnswerSymbol } from '../../../types/record/base/answer-symbol';
import { IMap } from '../../../utils/immutable';

export type SymbolListReducerAction =
  | {
      type: 'update-point';
      iconId: AnswerSymbolIconId;
      point: AnswerSymbolPointEnumType;
    }
  | {
      type: 'update-description';
      iconId: AnswerSymbolIconId;
      description: string;
    };

export type SymbolListReducerState = IMap<AnswerSymbolIconId, IAnswerSymbol>;

export const symbolListReducer: ReducerType<
  SymbolListReducerState,
  SymbolListReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'update-description':
      return state.update(action.iconId, (e) =>
        e.set('description', action.description)
      );
    case 'update-point':
      return state.update(action.iconId, (e) => e.set('point', action.point));
  }
};
