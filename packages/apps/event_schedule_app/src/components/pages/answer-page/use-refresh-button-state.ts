import { useDataStream, useStreamValue } from '@mono/react-rxjs-utils';
import { merge, Observable, timer } from 'rxjs';
import { mapTo, startWith, switchMap } from 'rxjs/operators';
import { fetchThrottleTime } from '../../../constants/fetch-throttle-time';

export const useRefreshButtonState = (
  fetchAnswersThrottled$: Observable<void>,
  answersResultTimestamp$: Observable<number>
): {
  refreshButtonIsLoading: boolean;
  refreshButtonIsDisabled: boolean;
} => {
  const refreshButtonIsLoading$ = useDataStream<boolean>(
    false,
    merge(
      fetchAnswersThrottled$.pipe(mapTo(true)),
      answersResultTimestamp$.pipe(mapTo(false))
    )
  );

  const refreshButtonIsDisabled$ = useDataStream<boolean>(
    false,
    fetchAnswersThrottled$.pipe(
      switchMap(() =>
        timer(fetchThrottleTime).pipe(mapTo(false), startWith(true))
      )
    )
  );

  const refreshButtonIsLoading = useStreamValue(refreshButtonIsLoading$, false);
  const refreshButtonIsDisabled = useStreamValue(
    refreshButtonIsDisabled$,
    false
  );

  return {
    refreshButtonIsLoading,
    refreshButtonIsDisabled,
  };
};
