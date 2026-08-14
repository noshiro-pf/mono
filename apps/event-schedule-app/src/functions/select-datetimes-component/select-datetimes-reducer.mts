import { Arr, ISetMapped, pipe, type SizeType } from 'ts-data-forge';
import { compareDatetimeRange, TimeRange } from 'ts-fortress-types';
import { type DayOfWeekName, type ReadonlyRecord } from 'ts-type-forge';
import { datetimeRangeInitialValue } from '../../constants/index.mjs';
import { Obj, type Reducer } from '../../utils-ported/index.mjs';
import { ymdFromKey, ymdToKey } from '../map-key/index.mjs';
import { ymdToDayInWeek } from '../ymd-to-day-in-week.mjs';
import { timeRangeReducer } from './time-range-reducer.mjs';

export type DatetimeListReducerAction = Readonly<
  | {
      type: 'fromCalendar';
      list: readonly YearMonthDate[];
      mostFrequentTimeRange: TimeRange;
    }
  | {
      type: 'setTimeAtOneTime';
      timeRange: TimeRange;
      checkboxState: ReadonlyRecord<DayOfWeekName, boolean>;
    }
  | { type: 'addClick'; datetimeRange: DatetimeRange }
  | { type: 'delete'; index: SizeType.Arr }
  | { type: 'deleteAll' | 'sort' }
  | { type: 'duplicate'; index: SizeType.Arr }
  | { type: 'end' | 'start'; index: SizeType.Arr; hm: HoursMinutes }
  | { type: 'ymd'; index: SizeType.Arr; ymd: YearMonthDate }
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
      const datetimeSet: ISetMapped<YearMonthDate, YmdKey> = ISetMapped.create(
        state.map((e) => e.ymd),
        ymdToKey,
        ymdFromKey,
      );

      const dateSetFromCalendar: ISetMapped<YearMonthDate, YmdKey> =
        ISetMapped.create(action.list, ymdToKey, ymdFromKey);

      const removed = datetimeSet.subtract(dateSetFromCalendar);

      const addedList = dateSetFromCalendar.subtract(datetimeSet).toArray();

      return pipe(state)
        .map(Arr.filterNot((e) => removed.has(e.ymd)))
        .map((list) =>
          Arr.concat(
            list,
            addedList.map((ymd) => ({
              ymd,
              timeRange: TimeRange.defaultValue,
            })),
          ),
        )
        .map((list) => list.toSorted(compareDatetimeRange)).value;
    }

    case 'ymd':
      return Arr.toUpdated(state, action.index, (val) =>
        Obj.set(val, action.type, action.ymd),
      );

    case 'start':
    case 'end':
      return Arr.toUpdated(state, action.index, (val) =>
        Obj.update(val, 'timeRange', (v) => timeRangeReducer(v, action)),
      );

    case 'duplicate':
      return Arr.toInserted(
        state,
        action.index,
        state[action.index] ?? datetimeRangeInitialValue,
      );

    case 'delete':
      return Arr.toRemoved(state, action.index);

    case 'addClick':
      return Arr.toPushed(state, action.datetimeRange);

    case 'deleteAll':
      return [];

    case 'setTimeAtOneTime':
      return state.map((el) =>
        action.checkboxState[ymdToDayInWeek(el.ymd)]
          ? { ...el, timeRange: action.timeRange }
          : el,
      );

    case 'sort':
      return state.toSorted(compareDatetimeRange);
  }
};
