import {
  useStream,
  useStreamEffect,
  useVoidEventAsStream,
} from '@noshiro/react-syncflow-hooks';
import { Observable, throttleTime } from '@noshiro/syncflow';
import { useEffect } from 'react';
import { fetchThrottleTime } from '../../../constants/fetch-throttle-time';
import { clog } from '../../../utils/log';

export const useFetchEventStreams = (): {
  fetchEventScheduleThrottled$: Observable<void>;
  fetchAnswersThrottled$: Observable<void>;
  fetchAnswers: () => void;
} => {
  const [fetchEventSchedule$, fetchEventSchedule] = useVoidEventAsStream();
  const [fetchAnswers$, fetchAnswers] = useVoidEventAsStream();
  const fetchEventScheduleThrottled$ = useStream(() =>
    fetchEventSchedule$.chain(throttleTime(fetchThrottleTime))
  );
  const fetchAnswersThrottled$ = useStream(() =>
    fetchAnswers$.chain(throttleTime(fetchThrottleTime))
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
