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

export const iconListReducer: Reducer<
  IconListReducerState,
  IconListReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'update-description':
      return Obj.update(state, action.iconId, (s) =>
        Obj.set(s, 'description', action.description)
      );
    case 'update-point':
      return Obj.update(state, action.iconId, (s) =>
        Obj.set(s, 'point', action.point)
      );
  }
};
