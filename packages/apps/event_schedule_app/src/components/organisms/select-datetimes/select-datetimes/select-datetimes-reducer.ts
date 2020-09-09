import { ReducerType } from '@mono/ts-utils';
import {
  compareDatetimeRange,
  IDatetimeRange,
  IDatetimeRangeType,
} from '../../../../types/record/datetime-range';
import { IHoursMinutesType as IHmType } from '../../../../types/record/hours-minutes';
import { ITimeRangeType } from '../../../../types/record/time-range';
import { IYearMonthDateType as IYmdType } from '../../../../types/record/year-month-date';
import { IList, ISet } from '../../../../utils/immutable';

type DatetimeListReducerAction =
  | {
      type: 'fromProps';
      list: IList<IDatetimeRangeType>;
    }
  | {
      type: 'fromCalendar';
      list: IList<IYmdType>;
      mostFrequentTimeRange: ITimeRangeType;
    }
  | {
      type: 'ymd';
      payload: {
        index: number;
        value: IYmdType;
      };
    }
  | {
      type: 'start' | 'end';
      payload: {
        index: number;
        value: IHmType;
      };
    }
  | { type: 'duplicate'; index: number }
  | {
      type: 'setTimeAtOneTime';
      timeRange: ITimeRangeType;
    }
  | {
      type: 'addClick';
      datetimeRange: IDatetimeRangeType;
    }
  | { type: 'delete'; index: number }
  | { type: 'deleteAll' | 'sort' };

type DatetimeListReducerState = {
  lastAction: DatetimeListReducerAction['type'];
  value: IList<IDatetimeRangeType>;
};

export const datetimeListReducerInitialState: DatetimeListReducerState = {
  lastAction: 'fromProps',
  value: IList<IDatetimeRangeType>(),
};

export const datetimeListreducer: ReducerType<
  DatetimeListReducerState,
  DatetimeListReducerAction
> = (state, action) => {
  const nextState = ((prevState: DatetimeListReducerState['value']) => {
    switch (action.type) {
      case 'fromProps':
        return action.list.sort(compareDatetimeRange);

      case 'fromCalendar': {
        /* [note]
        カレンダーから追加された要素は時刻 00:00 でリストに追加する。
        カレンダーから削除された要素はリストからも削除する。 */
        const datetimeSet: ISet<IYmdType> = prevState.map((e) => e.ymd).toSet();
        const dateSetFromCalendar: ISet<IYmdType> = action.list.toSet();
        const removed = datetimeSet.subtract(dateSetFromCalendar);
        const added = dateSetFromCalendar.subtract(datetimeSet);
        return prevState
          .filterNot((e) => removed.has(e.ymd))
          .concat(added.map((ymd) => IDatetimeRange({ ymd })))
          .sort(compareDatetimeRange);
      }

      case 'ymd':
        return prevState.update(action.payload.index, (val) =>
          val.set(action.type, action.payload.value)
        );

      case 'start':
      case 'end':
        return prevState.update(action.payload.index, (val) =>
          val.update('timeRange', (v) =>
            v.set(action.type, action.payload.value)
          )
        );

      case 'duplicate':
        return prevState.insert(
          action.index,
          prevState.get(action.index) ?? IDatetimeRange()
        );

      case 'delete':
        return prevState.remove(action.index);

      case 'addClick':
        return prevState.push(action.datetimeRange);

      case 'deleteAll':
        return prevState.clear();

      case 'setTimeAtOneTime':
        return prevState.map((el) => el.set('timeRange', action.timeRange));

      case 'sort':
        return prevState.sort(compareDatetimeRange);
    }
  })(state.value);

  return { lastAction: action.type, value: nextState };
};
