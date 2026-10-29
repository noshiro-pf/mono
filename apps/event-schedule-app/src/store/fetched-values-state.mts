import {
  type InitializedObservable,
  combine,
  map,
  withInitialValue,
} from 'synstate';
import { Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type {
  AnswersResult,
  EventScheduleResult,
} from './fetching-state/index.mjs';

export type FetchErrorType = DeepReadonly<
  | (
      | { data: 'answersResult'; type: { type: 'others'; message: string } }
      | {
          data: 'eventScheduleResult';
          type: { type: 'not-found' | 'others'; message: string };
        }
    )
  | undefined
>;

/**
 * Which read failed, the event's before the answers': what the answer page
 * shows in place of itself.
 */
export const createErrorType = (
  eventScheduleResult$: InitializedObservable<EventScheduleResult>,
  answersResult$: InitializedObservable<AnswersResult>,
): InitializedObservable<FetchErrorType> =>
  combine([eventScheduleResult$, answersResult$])
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
