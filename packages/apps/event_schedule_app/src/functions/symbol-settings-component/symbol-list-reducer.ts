import type {
  AnswerSymbol,
  AnswerSymbolIconId,
  AnswerSymbolPointEnumType,
} from '@noshiro/event-schedule-app-shared';
import type { IMap } from '@noshiro/ts-utils';
import { IRecord } from '@noshiro/ts-utils';

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

export type SymbolListReducerState = IMap<AnswerSymbolIconId, AnswerSymbol>;

export const symbolListReducer: ReducerType<
  SymbolListReducerState,
  SymbolListReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'update-description':
      return state.update(action.iconId, (e) =>
        IRecord.set(e, 'description', action.description)
      );
    case 'update-point':
      return state.update(action.iconId, (e) =>
        IRecord.set(e, 'point', action.point)
      );
  }
};
