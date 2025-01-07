import { compareDatetimeRange, TimeRange } from '@noshiro/io-ts-types';
import { datetimeRangeInitialValue } from '../../constants';
import { ymdFromKey, ymdToKey } from '../map-key';
import { ymdToDayInWeek } from '../ymd-to-day-in-week';
import { timeRangeReducer } from './time-range-reducer';

export type DatetimeListReducerAction = Readonly<
  | {
      type: 'fromCalendar';
      list: readonly YearMonthDate[];
      mostFrequentTimeRange: TimeRange;
    }
  | {
      type: 'setTimeAtOneTime';
      timeRange: TimeRange;
      checkboxState: Record<DayOfWeekName, boolean>;
    }
  | { type: 'addClick'; datetimeRange: DatetimeRange }
  | { type: 'delete'; index: NumberType.ArraySize }
  | { type: 'deleteAll' | 'sort' }
  | { type: 'duplicate'; index: NumberType.ArraySize }
  | { type: 'end' | 'start'; index: NumberType.ArraySize; hm: HoursMinutes }
  | { type: 'ymd'; index: NumberType.ArraySize; ymd: YearMonthDate }
>;

export type DatetimeListReducerState = readonly DatetimeRange[];

export const datetimeListReducer: Reducer<
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
        ymdFromKey,
      );
      const dateSetFromCalendar: ISetMapped<YearMonthDate, YmdKey> =
        ISetMapped.new(action.list, ymdToKey, ymdFromKey);
      const removed = datetimeSet.subtract(dateSetFromCalendar);
      const added = dateSetFromCalendar.subtract(datetimeSet);
      return pipe(state)
        .chain((list) => Arr.filterNot(list, (e) => removed.has(e.ymd)))
        .chain((list) =>
          Arr.concat(
            list,
            added
              .toArray()
              .map((ymd) => ({ ymd, timeRange: TimeRange.defaultValue })),
          ),
        )
        .chain((list) => list.toSorted(compareDatetimeRange)).value;
    }

    case 'ymd':
      return Arr.update(state, action.index, (val) =>
        Obj.set(val, action.type, action.ymd),
      );

    case 'start':
    case 'end':
      return Arr.update(state, action.index, (val) =>
        Obj.update(val, 'timeRange', (v) => timeRangeReducer(v, action)),
      );

    case 'duplicate':
      return Arr.inserted(
        state,
        action.index,
        state[action.index] ?? datetimeRangeInitialValue,
      );

    case 'delete':
      return Arr.removed(state, action.index);

    case 'addClick':
      return Arr.pushed(state, action.datetimeRange);

    case 'deleteAll':
      return [];

    case 'setTimeAtOneTime':
      return state.map((el) =>
        action.checkboxState[ymdToDayInWeek(el.ymd)]
          ? Obj.set(el, 'timeRange', action.timeRange)
          : el,
      );

    case 'sort':
      return state.toSorted(compareDatetimeRange);
  }
};
