import { pipe } from 'ts-data-forge';
import { compareHm } from 'ts-fortress-types';
import { Obj, type Reducer } from '../../utils-ported/index.mjs';

type Action = Readonly<
  | { type: 'end' | 'start'; hm: HoursMinutes }
  | { type: 'init'; timeRange: TimeRange }
>;

type State = TimeRange;

export const timeRangeReducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'init':
      return action.timeRange;

    case 'start': {
      const newStart = action.hm;

      return pipe(state)
        .map((r) => ({ ...r, start: newStart }))
        .map((r) =>
          Obj.update(r, 'end', (e) =>
            compareHm(newStart, e) <= 0 ? e : newStart,
          ),
        ).value;
    }

    case 'end': {
      const newEnd = action.hm;

      return pipe(state)
        .map((r) => ({ ...r, end: newEnd }))
        .map((r) =>
          Obj.update(r, 'start', (s) =>
            compareHm(s, newEnd) <= 0 ? s : newEnd,
          ),
        ).value;
    }
  }
};
