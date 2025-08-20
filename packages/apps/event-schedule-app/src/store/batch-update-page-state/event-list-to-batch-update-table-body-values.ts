import {
  compareDatetimeRange,
  type EventListItem,
} from '@noshiro/event-schedule-app-shared';
import { datetimeRange2str } from '../../constants';
import {
  type BatchUpdateTableBodyRow,
  type BatchUpdateTableCellDisplayValue,
  type BatchUpdateTableCellMap,
  type BatchUpdateTableCellPos,
} from '../../types';

/**
 * | date       | event-1 | event-2 | event-3 |
 * | :--------- | :-----: | :-----: | :-----: |
 * | 2024/01/01 |         |         |         |
 * | 2024/01/08 |    o    |    o    |         |
 * | 2024/01/15 |         |    x    |    x    |
 * | 2024/01/22 |    o    |         |    o    |
 */
export const eventListToBatchUpdateTableBodyValues = (
  eventList: readonly EventListItem[] | undefined,
  answerCellMap: BatchUpdateTableCellMap,
): readonly BatchUpdateTableBodyRow[] => {
  if (eventList === undefined) return [];

  const datetimeRangeListMergedUniq: DeepReadonly<
    {
      datetimeRange: DatetimeRange;
      datetimeSpecification: DatetimeSpecificationEnumType;
    }[]
  > = pipe(
    eventList
      .flatMap((eventItem: EventListItem) =>
        eventItem.eventSchedule.datetimeRangeList.map((datetimeRange) => ({
          datetimeRange,
          datetimeSpecification: eventItem.eventSchedule.datetimeSpecification,
        })),
      )
      .toSorted((a, b) =>
        compareDatetimeRange(a.datetimeRange, b.datetimeRange),
      ),
  ).chain((list) =>
    Arr.uniqBy(list, (a) => datetimeRange2str(a.datetimeRange)),
  ).value;

  return datetimeRangeListMergedUniq.map(
    ({ datetimeRange, datetimeSpecification }) =>
      ({
        rowKey: datetimeRange2str(datetimeRange),
        datetimeRange,
        datetimeSpecification,
        cells: eventList.map(
          (
            eventItem: EventListItem,
          ): BatchUpdateTableCellDisplayValue | undefined =>
            answerCellMap.get({
              datetimeRange,
              eventId: eventItem.eventScheduleMetadata.id,
            } satisfies BatchUpdateTableCellPos) satisfies
              | BatchUpdateTableCellDisplayValue
              | undefined,
        ),
      }) satisfies BatchUpdateTableBodyRow,
  );
};
