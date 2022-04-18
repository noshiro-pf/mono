import { api } from '../api';
import { fetchThrottleTime } from '../constants';
import { clog } from '../utils';
import { router } from './router';

const [fetchEventSchedule$, fetchEventSchedule] = createVoidEventEmitter();

const [fetchAnswers$, fetchAnswers] = createVoidEventEmitter();

const fetchEventScheduleThrottled$ = fetchEventSchedule$.chain(
  throttleTime(fetchThrottleTime)
);

const fetchAnswersThrottled$ = fetchAnswers$.chain(
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

const { state$: answersResult$, setState: setAnswersResult } = createState<
  | Result<readonly Answer[], Readonly<{ type: 'others'; message: string }>>
  | undefined
>(undefined);

combineLatest([
  fetchEventScheduleThrottled$,
  router.eventId$,
] as const).subscribe(([_, eventId]) => {
  if (eventId === undefined) return;

  api.event
    .get(eventId)
    .then((result) => {
      setEventScheduleResult(result);
    })
    .catch(console.error);
});

combineLatest([fetchAnswersThrottled$, router.eventId$] as const).subscribe(
  ([_, eventId]) => {
    if (eventId === undefined) return;

    api.answers
      .getList(eventId)
      .then((result) => {
        setAnswersResult(result);
        setRefreshButtonIsLoading(false);
      })
      .catch(console.error);
  }
);

const eventSchedule$: InitializedObservable<EventSchedule | undefined> =
  eventScheduleResult$
    .chain(filter(isNotUndefined))
    .chain(unwrapResultOk())
    .chain(withInitialValue(undefined));

const answers$: InitializedObservable<readonly Answer[] | undefined> =
  answersResult$
    .chain(filter(isNotUndefined))
    .chain(unwrapResultOk())
    .chain(withInitialValue(undefined));

const errorType$: InitializedObservable<
  DeepReadonly<
    | {
        data: 'answersResult';
        type: { type: 'others'; message: string };
      }
    | {
        data: 'eventScheduleResult';
        type: { type: 'not-found' | 'others'; message: string };
      }
    | undefined
  >
> = combineLatest([eventScheduleResult$, answersResult$] as const)
  .chain(
    map(([esr, ar]) =>
      Result.isErr(esr)
        ? ({
            data: 'eventScheduleResult' as const,
            type: esr.value,
          } as const)
        : Result.isErr(ar)
        ? ({
            data: 'answersResult' as const,
            type: ar.value,
          } as const)
        : undefined
    )
  )
  .chain(withInitialValue(undefined));

const { state$: refreshButtonIsLoading$, setState: setRefreshButtonIsLoading } =
  createState<boolean>(false);

const refreshAnswers = (): void => {
  fetchAnswers();
  setRefreshButtonIsLoading(true);
};

const {
  state$: refreshButtonIsDisabled$,
  setState: setRefreshButtonIsDisabled,
} = createState<boolean>(false);

{
  let mut_timer: TimerId | undefined = undefined;
  fetchAnswersThrottled$.subscribe(() => {
    if (mut_timer !== undefined) {
      clearTimeout(mut_timer);
    }
    setRefreshButtonIsDisabled(true);
    mut_timer = setTimeout(() => {
      setRefreshButtonIsDisabled(false);
    }, fetchThrottleTime);
  });
}

export {
  eventScheduleResult$,
  eventSchedule$,
  answers$,
  errorType$,
  fetchAnswers,
  refreshAnswers,
  fetchEventSchedule,
  refreshButtonIsLoading$,
  refreshButtonIsDisabled$,
};

router.eventId$.chain(distinctUntilChangedI()).subscribe(() => {
  fetchEventSchedule();
  fetchAnswers();
});

eventScheduleResult$.subscribe((e) => {
  if (e !== undefined && Result.isErr(e)) {
    clog('eventScheduleResult', e);
  }
});

answersResult$.subscribe((e) => {
  if (Result.isErr(e)) {
    clog('answersResult', e.value);
  }
});

eventScheduleResult$.subscribe((e) => {
  if (Result.isErr(e)) {
    clog('eventScheduleResult', e);
  }
});
