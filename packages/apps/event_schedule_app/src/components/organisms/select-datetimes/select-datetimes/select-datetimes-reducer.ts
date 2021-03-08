import { ReducerType } from '@noshiro/ts-utils';
import { IHoursMinutes } from '../../../../types/record/base/hours-minutes';
import { IYearMonthDate } from '../../../../types/record/base/year-month-date';
import {
  compareDatetimeRange,
  createIDatetimeRange,
  IDatetimeRange,
} from '../../../../types/record/datetime-range';
import {
  createITimeRange,
  ITimeRange,
} from '../../../../types/record/time-range';
import { IList, ISet } from '../../../../utils/immutable';
import { timeRangeReducer } from '../set-times-popover/time-range-reducer';

export type DatetimeListReducerAction =
  | {
      type: 'fromCalendar';
      list: IList<IYearMonthDate>;
      mostFrequentTimeRange: ITimeRange;
    }
  | {
      type: 'ymd';
      index: number;
      ymd: IYearMonthDate;
    }
  | {
      type: 'start' | 'end';
      index: number;
      hm: IHoursMinutes;
    }
  | { type: 'duplicate'; index: number }
  | {
      type: 'setTimeAtOneTime';
      timeRange: ITimeRange;
    }
  | {
      type: 'addClick';
      datetimeRange: IDatetimeRange;
    }
  | { type: 'delete'; index: number }
  | { type: 'deleteAll' | 'sort' };

export type DatetimeListReducerState = IList<IDatetimeRange>;

export const datetimeListReducer: ReducerType<
  DatetimeListReducerState,
  DatetimeListReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'fromCalendar': {
      /* [note]
      カレンダーから追加された要素は時刻 00:00 でリストに追加する。
      カレンダーから削除された要素はリストからも削除する。 */
      const datetimeSet: ISet<IYearMonthDate> = state.map((e) => e.ymd).toSet();
      const dateSetFromCalendar: ISet<IYearMonthDate> = action.list.toSet();
      const removed = datetimeSet.subtract(dateSetFromCalendar);
      const added = dateSetFromCalendar.subtract(datetimeSet);
      return state
        .filterNot((e) => removed.has(e.ymd))
        .concat(
          added.map((ymd) =>
            createIDatetimeRange({ ymd, timeRange: createITimeRange() })
          )
        )
        .sort(compareDatetimeRange);
    }

    case 'ymd':
      return state.update(action.index, (val) =>
        val.set(action.type, action.ymd)
      );

    case 'start':
    case 'end':
      return state.update(action.index, (val) =>
        val.update('timeRange', (v) => timeRangeReducer(v, action))
      );

    case 'duplicate':
      return state.insert(
        action.index,
        state.get(action.index) ?? createIDatetimeRange()
      );

    case 'delete':
      return state.remove(action.index);

    case 'addClick':
      return state.push(action.datetimeRange);

    case 'deleteAll':
      return state.clear();

    case 'setTimeAtOneTime':
      return state.map((el) => el.set('timeRange', action.timeRange));

    case 'sort':
      return state.sort(compareDatetimeRange);
  }
};
