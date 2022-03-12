import type { Answer, EventSchedule } from '@noshiro/event-schedule-app-shared';
import { answerDefaultValue } from '@noshiro/event-schedule-app-shared';
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
  useObservable,
  useObservableEffect,
  useObservableState,
  useObservableValue,
  useVoidEventObservable,
} from '@noshiro/syncflow-react-hooks';
import { IRecord, isNotUndefined } from '@noshiro/ts-utils';

export const useAnswerBeingEditedState = (
  eventSchedule$: Observable<EventSchedule | undefined>
): Readonly<{
  answerBeingEdited: Answer;
  setAnswerBeingEdited: (a: Answer) => void;
  resetAnswerBeingEdited: () => void;
  updateAnswerBeingEdited: (updater: (a: Answer) => Answer) => void;
}> => {
  const [answerBeingEdited$, setAnswerBeingEdited, updateAnswerBeingEdited] =
    useObservableState(answerDefaultValue);

  const emptyAnswerSelection$ = useObservable<Answer>(() =>
    eventSchedule$
      .chain(filter(isNotUndefined))
      .chain(
        map((e) =>
          IRecord.set(
            answerDefaultValue,
            'selection',
            e.datetimeRangeList.map(
              (d) =>
                ({
                  datetimeRange: d,
                  iconId: 'none',
                  point: 0,
                } as const)
            )
          )
        )
      )
      .chain(distinctUntilChanged(deepEqual))
      .chain(withInitialValue(answerDefaultValue))
  );

  const [resetAnswerBeingEditedAction$, resetAnswerBeingEdited] =
    useVoidEventObservable();

  const resetAnswerBeingEdited$ = useObservable(() =>
    combineLatest([
      emptyAnswerSelection$,
      resetAnswerBeingEditedAction$,
    ] as const).chain(map(([x, _]) => x))
  );

  useObservableEffect(resetAnswerBeingEdited$, setAnswerBeingEdited);

  const answerBeingEdited = useObservableValue(answerBeingEdited$);

  return {
    answerBeingEdited,
    setAnswerBeingEdited,
    resetAnswerBeingEdited,
    updateAnswerBeingEdited,
  };
};
