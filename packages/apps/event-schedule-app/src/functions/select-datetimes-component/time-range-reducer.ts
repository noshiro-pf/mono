import { compareHm } from '@noshiro/event-schedule-app-shared';

type TimeRangeReducerAction =
  | Readonly<{
      type: 'end' | 'start';
      hm: HoursMinutes;
    }>
  | Readonly<{
      type: 'init';
      timeRange: TimeRange;
    }>;

type TimeRangeReducerState = TimeRange;

export const timeRangeReducer: Reducer<
  TimeRangeReducerState,
  TimeRangeReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'init':
      return action.timeRange;

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
