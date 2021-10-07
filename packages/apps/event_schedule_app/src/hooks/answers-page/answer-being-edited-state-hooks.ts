import type { Answer, EventSchedule } from '@noshiro/event-schedule-app-shared';
import { defaultAnswer } from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import type { Observable } from '@noshiro/syncflow';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  withInitialValue,
} from '@noshiro/syncflow';
import {
  useStateAsStream,
  useStream,
  useStreamEffect,
  useStreamValue,
  useVoidEventAsStream,
} from '@noshiro/syncflow-react-hooks';
import { IRecord, isNotUndefined } from '@noshiro/ts-utils';

export const useAnswerBeingEditedState = (
  eventSchedule$: Observable<EventSchedule | undefined>
): Readonly<{
  answerBeingEdited: Answer;
  resetAnswerBeingEdited: () => void;
  updateAnswerBeingEdited: (updater: (a: Answer) => Answer) => void;
}> => {
  const [answerBeingEdited$, setAnswerBeingEdited, updateAnswerBeingEdited] =
    useStateAsStream(defaultAnswer);

  const emptyAnswerSelection$ = useStream<Answer>(() =>
    eventSchedule$
      .chain(filter(isNotUndefined))
      .chain(
        map((e) =>
          IRecord.set(
            defaultAnswer,
            'selection',
            e.datetimeRangeList.map((d) => ({
              datetimeRange: d,
              iconId: undefined,
            }))
          )
        )
      )
      .chain(distinctUntilChanged(deepEqual))
      .chain(withInitialValue(defaultAnswer))
  );

  const [resetAnswerBeingEditedAction$, resetAnswerBeingEdited] =
    useVoidEventAsStream();
  const resetAnswerBeingEdited$ = useStream(() =>
    combineLatest([
      emptyAnswerSelection$,
      resetAnswerBeingEditedAction$,
    ] as const).chain(map(([x, _]) => x))
  );

  useStreamEffect(resetAnswerBeingEdited$, setAnswerBeingEdited);

  const answerBeingEdited = useStreamValue(answerBeingEdited$);

  return {
    answerBeingEdited,
    resetAnswerBeingEdited,
    updateAnswerBeingEdited,
  };
};
