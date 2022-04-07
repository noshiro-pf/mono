import type {
  DatetimeRange,
  HoursMinutes,
  TimeRange,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import {
  compareDatetimeRange,
  datetimeRangeDefaultValue,
  timeRangeDefaultValue,
} from '@noshiro/event-schedule-app-shared';
import type { YmdKey } from '../map-key';
import { ymdFromKey, ymdToKey } from '../map-key';
import { timeRangeReducer } from './time-range-reducer';

export type DatetimeListReducerAction = Readonly<
  | {
      type: 'fromCalendar';
      list: readonly YearMonthDate[];
      mostFrequentTimeRange: TimeRange;
    }
  | { type: 'addClick'; datetimeRange: DatetimeRange }
  | { type: 'delete'; index: number }
  | { type: 'deleteAll' | 'sort' }
  | { type: 'duplicate'; index: number }
  | { type: 'end' | 'start'; index: number; hm: HoursMinutes }
  | { type: 'setTimeAtOneTime'; timeRange: TimeRange }
  | { type: 'ymd'; index: number; ymd: YearMonthDate }
>;

export type DatetimeListReducerState = readonly DatetimeRange[];

export const datetimeListReducer: ReducerType<
  DatetimeListReducerState,
  DatetimeListReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'fromCalendar': {
      /* [note]
      カレンダーから追加された要素は時刻 00:00 でリストに追加する。
      カレンダーから削除された要素はリストからも削除する。 */
      const datetimeSet: ISetMapped<YearMonthDate, YmdKey> = ISetMapped.new(
        state.map((e) => e.ymd),
        ymdToKey,
        ymdFromKey
      );
      const dateSetFromCalendar: ISetMapped<YearMonthDate, YmdKey> =
        ISetMapped.new(action.list, ymdToKey, ymdFromKey);
      const removed = datetimeSet.subtract(dateSetFromCalendar);
      const added = dateSetFromCalendar.subtract(datetimeSet);
      return pipe(state)
        .chain((list) => IList.filterNot(list, (e) => removed.has(e.ymd)))
        .chain((list) =>
          IList.concat(
            list,
            added
              .toArray()
              .map((ymd) => ({ ymd, timeRange: timeRangeDefaultValue }))
          )
        )
        .chain((list) => IList.sort(list, compareDatetimeRange)).value;
    }

    case 'ymd':
      return IList.update(state, action.index, (val) =>
        IRecord.set(val, action.type, action.ymd)
      );

    case 'start':
    case 'end':
      return IList.update(state, action.index, (val) =>
        IRecord.update(val, 'timeRange', (v) => timeRangeReducer(v, action))
      );

    case 'duplicate':
      return IList.insert(
        state,
        action.index,
        state[action.index] ?? datetimeRangeDefaultValue
      );

    case 'delete':
      return IList.remove(state, action.index);

    case 'addClick':
      return IList.push(state, action.datetimeRange);

    case 'deleteAll':
      return [];

    case 'setTimeAtOneTime':
      return state.map((el) => IRecord.set(el, 'timeRange', action.timeRange));

    case 'sort':
      return IList.sort(state, compareDatetimeRange);
  }
};
