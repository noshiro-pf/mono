import { compareHm } from '@noshiro/io-ts-types';

type Action = Readonly<
  | {
      type: 'end' | 'start';
      hm: HoursMinutes;
    }
  | {
      type: 'init';
      timeRange: TimeRange;
    }
>;

type State = TimeRange;

export const timeRangeReducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'init':
      return action.timeRange;

    case 'start': {
      const newStart = action.hm;
      return pipe(state)
        .chain((r) => Obj.set(r, 'start', newStart))
        .chain((r) =>
          Obj.update(r, 'end', (e) =>
            compareHm(newStart, e) <= 0 ? e : newStart,
          ),
        ).value;
    }

    case 'end': {
      const newEnd = action.hm;
      return pipe(state)
        .chain((r) => Obj.set(r, 'end', newEnd))
        .chain((r) =>
          Obj.update(r, 'start', (s) =>
            compareHm(s, newEnd) <= 0 ? s : newEnd,
          ),
        ).value;
    }
  }
};
