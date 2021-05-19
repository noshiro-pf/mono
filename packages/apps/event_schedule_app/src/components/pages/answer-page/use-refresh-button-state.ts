import { useStream, useStreamValue } from '@noshiro/react-syncflow-hooks';
import type { Observable } from '@noshiro/syncflow';
import {
  mapTo,
  merge,
  switchMap,
  timer,
  withInitialValue,
} from '@noshiro/syncflow';
import { fetchThrottleTime } from '../../../constants';

export const useRefreshButtonState = (
  fetchAnswersThrottled$: Observable<void>,
  answersResultTimestamp$: Observable<number>
): {
  refreshButtonIsLoading: boolean;
  refreshButtonIsDisabled: boolean;
} => {
  // clog(answersResultTimestamp$);
  const refreshButtonIsLoading$ = useStream<boolean>(() =>
    merge(
      fetchAnswersThrottled$.chain(mapTo(true)),
      answersResultTimestamp$.chain(mapTo(false))
    ).chain(withInitialValue(false))
  );

  const refreshButtonIsDisabled$ = useStream<boolean>(() =>
    fetchAnswersThrottled$
      .chain(
        switchMap(() =>
          timer(fetchThrottleTime)
            .chain(mapTo(false))
            .chain(withInitialValue<boolean>(true))
        )
      )
      .chain(withInitialValue(false))
  );

  const refreshButtonIsLoading = useStreamValue(refreshButtonIsLoading$);
  const refreshButtonIsDisabled = useStreamValue(refreshButtonIsDisabled$);

  return {
    refreshButtonIsLoading,
    refreshButtonIsDisabled,
  };
};
