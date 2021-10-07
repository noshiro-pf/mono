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

export const useAnswerForEditingState = (
  eventSchedule$: Observable<EventSchedule | undefined>
): Readonly<{
  answerForEditing: Answer;
  resetAnswerForEditing: () => void;
  updateAnswerForEditing: (updater: (a: Answer) => Answer) => void;
}> => {
  const [answerForEditing$, setAnswerForEditing, updateAnswerForEditing] =
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

  const [resetAnswerForEditingAction$, resetAnswerForEditing] =
    useVoidEventAsStream();
  const resetAnswerForEditing$ = useStream(() =>
    combineLatest([
      emptyAnswerSelection$,
      resetAnswerForEditingAction$,
    ] as const).chain(map(([x, _]) => x))
  );

  useStreamEffect(resetAnswerForEditing$, setAnswerForEditing);

  const answerForEditing = useStreamValue(answerForEditing$);

  return {
    answerForEditing,
    resetAnswerForEditing,
    updateAnswerForEditing,
  };
};
