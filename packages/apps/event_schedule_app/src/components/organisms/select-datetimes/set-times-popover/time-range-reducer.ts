import type { ReducerType } from '@noshiro/ts-utils';
import type { IHoursMinutes } from '../../../../types/record/base/hours-minutes';
import { compareHm } from '../../../../types/record/base/hours-minutes';
import type { ITimeRange } from '../../../../types/record/time-range';

export type TimeRangeReducerAction = Readonly<{
  type: 'end' | 'start';
  hm: IHoursMinutes;
}>;

export type TimeRangeReducerState = ITimeRange;

export const timeRangeReducer: ReducerType<
  TimeRangeReducerState,
  TimeRangeReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'start':
      return state.withMutations((draft) => {
        const newStart = action.hm;
        draft.set('start', newStart);
        draft.update('end', (e) =>
          compareHm(newStart, e) <= 0 ? e : newStart
        );
      });

    case 'end':
      return state.withMutations((draft) => {
        const newEnd = action.hm;
        draft.set('end', newEnd);
        draft.update('start', (s) => (compareHm(s, newEnd) <= 0 ? s : newEnd));
      });
  }
};
