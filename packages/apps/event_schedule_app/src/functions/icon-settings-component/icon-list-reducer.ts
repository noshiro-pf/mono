import type {
  AnswerIconId,
  AnswerIconPoint,
  AnswerIconSettings,
} from '@noshiro/event-schedule-app-shared';

export type IconListReducerAction = Readonly<
  | {
      type: 'update-description';
      iconId: AnswerIconId;
      description: string;
    }
  | {
      type: 'update-point';
      iconId: AnswerIconId;
      point: AnswerIconPoint;
    }
>;

export type IconListReducerState = AnswerIconSettings;

export const iconListReducer: ReducerType<
  IconListReducerState,
  IconListReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'update-description':
      return IRecord.update(state, action.iconId, (s) =>
        IRecord.set(s, 'description', action.description)
      );
    case 'update-point':
      return IRecord.update(state, action.iconId, (s) =>
        IRecord.set(s, 'point', action.point)
      );
  }
};
