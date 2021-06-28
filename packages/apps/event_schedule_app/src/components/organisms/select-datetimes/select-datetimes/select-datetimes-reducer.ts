import type {
  DatetimeRange,
  HoursMinutes,
  TimeRange,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import {
  compareDatetimeRange,
  defaultDatetimeRange,
  defaultTimeRange,
} from '@noshiro/event-schedule-app-shared';
import type { ReducerType, uint32 } from '@noshiro/ts-utils';
import { IList, IRecord, ISetMapped, pipe } from '@noshiro/ts-utils';
import type { YmdKey } from '../../../../functions';
import { ymdFromKey, ymdToKey } from '../../../../functions';
import { timeRangeReducer } from '../set-times-popover';

export type DatetimeListReducerAction =
  | {
      type: 'fromCalendar';
      list: readonly YearMonthDate[];
      mostFrequentTimeRange: TimeRange;
    }
  | { type: 'addClick'; datetimeRange: DatetimeRange }
  | { type: 'delete'; index: uint32 }
  | { type: 'deleteAll' | 'sort' }
  | { type: 'duplicate'; index: uint32 }
  | { type: 'end' | 'start'; index: uint32; hm: HoursMinutes }
  | { type: 'setTimeAtOneTime'; timeRange: TimeRange }
  | { type: 'ymd'; index: uint32; ymd: YearMonthDate };

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
            added.toArray().map((ymd) => ({ ymd, timeRange: defaultTimeRange }))
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
        state[action.index] ?? defaultDatetimeRange
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
