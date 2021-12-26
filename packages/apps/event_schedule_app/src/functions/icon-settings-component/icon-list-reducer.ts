import type {
  AnswerIconId,
  AnswerIconPoint,
  AnswerIconSettings,
} from '@noshiro/event-schedule-app-shared';
import { IRecord } from '@noshiro/ts-utils';

export type IconListReducerAction =
  | {
      type: 'update-description';
      iconId: AnswerIconId;
      description: string;
    }
  | {
      type: 'update-point';
      iconId: AnswerIconId;
      point: AnswerIconPoint;
    };

export type IconListReducerState = AnswerIconSettings;

export const iconListReducer: ReducerType<
  IconListReducerState,
  IconListReducerAction
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
