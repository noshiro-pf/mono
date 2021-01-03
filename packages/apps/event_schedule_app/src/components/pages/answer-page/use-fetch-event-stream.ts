import {
  useStream,
  useStreamEffect,
  useVoidEventAsStream,
} from '@mono/react-rxjs-utils';
import { useEffect } from 'react';
import { Observable } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { fetchThrottleTime } from '../../../constants/fetch-throttle-time';
import { clog } from '../../../utils/log';

export const useFetchEventStreams = (): {
  fetchEventScheduleThrottled$: Observable<void>;
  fetchAnswersThrottled$: Observable<void>;
  fetchAnswers: () => void;
} => {
  const [fetchEventSchedule$, fetchEventSchedule] = useVoidEventAsStream();
  const [fetchAnswers$, fetchAnswers] = useVoidEventAsStream();
  const fetchEventScheduleThrottled$ = useStream(
    fetchEventSchedule$.pipe(throttleTime(fetchThrottleTime))
  );
  const fetchAnswersThrottled$ = useStream(
    fetchAnswers$.pipe(throttleTime(fetchThrottleTime))
  );

  useStreamEffect(fetchEventScheduleThrottled$, () => {
    clog('fetchEventScheduleThrottled$');
  });
  useStreamEffect(fetchAnswersThrottled$, () => {
    clog('fetchAnswers$');
  });

  // fetch once on the first load
  useEffect(() => {
    fetchEventSchedule();
    fetchAnswers();
  }, [fetchEventSchedule, fetchAnswers]);

  return {
    fetchEventScheduleThrottled$,
    fetchAnswersThrottled$,
    fetchAnswers,
  };
};
