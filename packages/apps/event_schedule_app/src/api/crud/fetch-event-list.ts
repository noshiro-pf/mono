import type { EventListItem } from '@noshiro/event-schedule-app-shared';
import { isEventListItem } from '@noshiro/event-schedule-app-shared';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../initialize-firebase';

const fbFetchEventListOfUser = httpsCallable(functions, 'fetchEventListOfUser');

export const fetchEventListOfUser = ({
  filterText,
  filterOptionState,
  showAllPastDaysEvent,
  showOnlyEventSchedulesICreated,
}: Readonly<{
  filterText: string;
  filterOptionState: 'archive' | 'inProgress';
  showAllPastDaysEvent: boolean;
  showOnlyEventSchedulesICreated: boolean;
}>): Promise<
  Result<
    readonly EventListItem[],
    Readonly<{ type: 'others' | 'wrong-type-response'; message: string }>
  >
> =>
  Result.fromPromise(
    fbFetchEventListOfUser({
      filterText,
      filterOptionState,
      showAllPastDaysEvent,
      showOnlyEventSchedulesICreated,
    })
  ).then((result) => {
    if (Result.isErr(result)) {
      return Result.err({
        type: 'others' as const,
        message: Str.from(result.value),
      });
    }

    const response = result.value.data;

    if (!IList.isArray(response) || !response.every(isEventListItem)) {
      return Result.err({
        type: 'wrong-type-response' as const,
        message: `response should be an array of EventListItem.`,
      });
    }

    return Result.ok(response);
  });
