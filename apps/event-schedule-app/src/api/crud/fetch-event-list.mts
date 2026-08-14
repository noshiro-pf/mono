import { EventListItem } from 'event-schedule-app-shared';
import { httpsCallable } from 'firebase/functions';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { fbFunctions } from '../../initialize-firebase.mjs';

const fbFetchEventListOfUser = httpsCallable(
  fbFunctions,
  'fetchEventListOfUser',
);

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
    }),
  ).then((result) => {
    if (Result.isErr(result)) {
      return Result.err({
        type: 'others' as const,
        message: unknownToString(result.value),
      });
    }

    const response = result.value.data;

    if (!Arr.isArray(response) || !response.every(EventListItem.is)) {
      return Result.err({
        type: 'wrong-type-response' as const,
        message: `response should be an array of EventListItem.`,
      });
    }

    return Result.ok(response);
  });
