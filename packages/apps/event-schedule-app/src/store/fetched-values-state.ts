import { fireAuthUser$ } from './auth';
import {
  AnswersFetchState,
  EventListFetchState,
  EventScheduleFetchState,
} from './fetch-state';
import { router } from './router';

export const errorType$: InitializedObservable<
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
> = combineLatest([
  EventScheduleFetchState.result$,
  AnswersFetchState.result$,
] as const)
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

router.eventId$.chain(distinctUntilChangedI()).subscribe(() => {
  EventScheduleFetchState.fetchEventSchedule();
  AnswersFetchState.fetchAnswers();
});

fireAuthUser$
  .chain(mapI((u) => mapNullable(u, (a) => a.uid)))
  .chain(distinctUntilChangedI())
  .subscribe(() => {
    EventListFetchState.fetchEventList();
  });
