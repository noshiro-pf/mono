import { Auth } from './auth';
import {
  AnswersStore,
  EventListStore,
  EventScheduleStore,
} from './fetching-state';
import { Router } from './router';

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
> = combineLatest([EventScheduleStore.result$, AnswersStore.result$] as const)
  .chain(
    map(([esr, ar]) =>
      esr !== undefined && Result.isErr(esr)
        ? ({
            data: 'eventScheduleResult' as const,
            type: esr.value,
          } as const)
        : ar !== undefined && Result.isErr(ar)
        ? ({
            data: 'answersResult' as const,
            type: ar.value,
          } as const)
        : undefined,
    ),
  )
  .chain(withInitialValue(undefined));

Router.eventId$.subscribe(() => {
  EventScheduleStore.fetchEventSchedule();
  AnswersStore.fetchAnswers();
});

Auth.fireAuthUser$
  .chain(mapI((u) => mapOptional(u, (a) => a.uid)))
  .chain(distinctUntilChangedI())
  .subscribe(() => {
    EventListStore.fetchEventList();
  });
