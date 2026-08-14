import {
  type InitializedObservable,
  combine,
  map,
  skipIfNoChange,
  withInitialValue,
} from 'synstate';
import { Result } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import { mapOptional } from '../utils-ported/index.mjs';
import { Auth } from './auth.mjs';
import {
  AnswersStore,
  EventListStore,
  EventScheduleStore,
} from './fetching-state/index.mjs';
import { Router } from './router.mjs';

export const errorType$: InitializedObservable<
  DeepReadonly<
    | (
        | { data: 'answersResult'; type: { type: 'others'; message: string } }
        | {
            data: 'eventScheduleResult';
            type: { type: 'not-found' | 'others'; message: string };
          }
      )
    | undefined
  >
> = combine([EventScheduleStore.result$, AnswersStore.result$])
  .pipe(
    map(([esr, ar]) =>
      esr !== undefined && Result.isErr(esr)
        ? ({ data: 'eventScheduleResult' as const, type: esr.value } as const)
        : ar !== undefined && Result.isErr(ar)
          ? ({ data: 'answersResult' as const, type: ar.value } as const)
          : undefined,
    ),
  )
  .pipe(withInitialValue(undefined));

Router.eventId$.subscribe(() => {
  EventScheduleStore.fetchEventSchedule();

  AnswersStore.fetchAnswers();
});

Auth.fireAuthUser$
  .pipe(map((u) => mapOptional(u, (a) => a.uid)))
  .pipe(skipIfNoChange())
  .subscribe(() => {
    EventListStore.fetchEventList();
  });
