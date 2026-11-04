import type { EventListItem } from 'event-schedule-app-shared';
import { Arr, Optional } from 'ts-data-forge';
import { compareDatetimeRange } from 'ts-fortress-types';
import { datetimeRange2str } from '../../constants/index.mjs';
import type {
  BatchUpdateTableBodyRow,
  BatchUpdateTableCellDisplayValue,
  BatchUpdateTableCellMap,
} from '../../types/index.mjs';

/**
 * The rows of the batch update table: every candidate datetime of the listed
 * events, sorted and without duplicates, with the signed-in user's answer to
 * each event in that row's cells.
 *
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
  if (eventList === undefined) {
    return [];
  }

  const datetimeRangeListMergedUniq = Arr.uniqBy(
    eventList
      .flatMap((eventItem) =>
        eventItem.eventSchedule.datetimeRangeList.map((datetimeRange) => ({
          datetimeRange,
          datetimeSpecification: eventItem.eventSchedule.datetimeSpecification,
        })),
      )
      .toSorted((a, b) =>
        compareDatetimeRange(a.datetimeRange, b.datetimeRange),
      ),
    (a) => datetimeRange2str(a.datetimeRange),
  );

  return datetimeRangeListMergedUniq.map(
    ({ datetimeRange, datetimeSpecification }) =>
      ({
        rowKey: datetimeRange2str(datetimeRange),
        datetimeRange,
        datetimeSpecification,
        cells: eventList.map(
          (eventItem): BatchUpdateTableCellDisplayValue | undefined =>
            Optional.toNullable(
              answerCellMap.get({
                datetimeRange,
                eventId: eventItem.eventScheduleMetadata.id,
              }),
            ),
        ),
      }) satisfies BatchUpdateTableBodyRow,
  );
};
