import { compareHm } from '@noshiro/event-schedule-app-shared';

export type TimeRangeReducerAction = Readonly<{
  type: 'end' | 'start';
  hm: HoursMinutes;
}>;

export type TimeRangeReducerState = TimeRange;

export const timeRangeReducer: ReducerType<
  TimeRangeReducerState,
  TimeRangeReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'start': {
      const newStart = action.hm;
      return pipe(state)
        .chain((r) => Obj.set(r, 'start', newStart))
        .chain((r) =>
          Obj.update(r, 'end', (e) =>
            compareHm(newStart, e) <= 0 ? e : newStart
          )
        ).value;
    }

    case 'end': {
      const newEnd = action.hm;
      return pipe(state)
        .chain((r) => Obj.set(r, 'end', newEnd))
        .chain((r) =>
          Obj.update(r, 'start', (s) =>
            compareHm(s, newEnd) <= 0 ? s : newEnd
          )
        ).value;
    }
  }
};
