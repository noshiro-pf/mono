import type { ReducerType } from '@noshiro/ts-utils';
import type { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import type { AnswerSymbolPointEnumType } from '../../../types/enum/answer-symbol-point';
import type { IAnswerSymbol } from '../../../types/record/base/answer-symbol';
import type { IMap } from '../../../utils/immutable';

export type SymbolListReducerAction =
  | {
      type: 'update-description';
      iconId: AnswerSymbolIconId;
      description: string;
    }
  | {
      type: 'update-point';
      iconId: AnswerSymbolIconId;
      point: AnswerSymbolPointEnumType;
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
