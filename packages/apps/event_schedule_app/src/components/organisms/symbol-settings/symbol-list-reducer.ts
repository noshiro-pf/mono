import { ReducerType } from '@mono/ts-utils';
import { AnswerSymbolIconId } from '../../../types/enum/answer-symbol-icon';
import { AnswerSymbolPointEnumType } from '../../../types/enum/answer-symbol-point';
import { IAnswerSymbolType } from '../../../types/record/answer-symbol';
import { IList, IMap } from '../../../utils/immutable';

type SymbolListReducerAction =
  | {
      type: 'fromProps';
      list: IList<IAnswerSymbolType>;
    }
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

type SymbolListReducerState = {
  lastAction: SymbolListReducerAction['type'];
  value: IMap<AnswerSymbolIconId, IAnswerSymbolType>;
};

export const symbolListReducerInitialState: SymbolListReducerState = {
  lastAction: 'fromProps',
  value: IMap<AnswerSymbolIconId, IAnswerSymbolType>(),
};

export const symbolListReducer: ReducerType<
  SymbolListReducerState,
  SymbolListReducerAction
> = (state, action) => {
  const nextState = ((prevState: SymbolListReducerState['value']) => {
    switch (action.type) {
      case 'fromProps':
        return IMap(action.list.map((e) => [e.iconId, e]));
      case 'update-description':
        return prevState.update(action.iconId, (e) =>
          e.set('description', action.description)
        );
      case 'update-point':
        return prevState.update(action.iconId, (e) =>
          e.set('point', action.point)
        );
    }
  })(state.value);

  return { lastAction: action.type, value: nextState };
};
