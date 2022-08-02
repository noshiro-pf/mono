import { api } from '../../api';
import { fetchThrottleTime } from '../../constants';
import { router } from '../router';

export namespace EventScheduleStore {
  const [fetchEventSchedule$, _fetchEventSchedule] = createVoidEventEmitter();

  export const fetchEventSchedule = _fetchEventSchedule;

  const fetchEventScheduleThrottled$ = fetchEventSchedule$.chain(
    throttleTime(fetchThrottleTime)
  );

  const { state$: eventScheduleResult$, setState: setEventScheduleResult } =
    createState<
      | Result<
          EventSchedule,
          Readonly<{ type: 'not-found' | 'others'; message: string }>
        >
      | undefined
    >(undefined);

  export const result$ = eventScheduleResult$;

  combineLatest([
    fetchEventScheduleThrottled$,
    router.eventId$,
  ] as const).subscribe(([_, eventId]) => {
    if (eventId === undefined) return;

    api.event
      .fetch(eventId)
      .then((result) => {
        setEventScheduleResult(result);
      })
      .catch(noop);
  });

  result$.subscribe((e) => {
    if (e !== undefined && Result.isErr(e)) {
      // TODO: use toast
      console.error('eventScheduleResult', e);
    }
  });
}

export const eventSchedule$: InitializedObservable<EventSchedule | undefined> =
  EventScheduleStore.result$
    .chain(filter(isNotUndefined))
    .chain(unwrapResultOk())
    .chain(withInitialValue(undefined));
