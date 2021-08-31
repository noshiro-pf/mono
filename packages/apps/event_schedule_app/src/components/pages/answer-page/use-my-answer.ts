import type { Answer, EventSchedule } from '@noshiro/event-schedule-app-shared';
import { defaultAnswer } from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import {
  useReducerAsStream,
  useStream,
  useStreamEffect,
  useStreamValue,
  useVoidEventAsStream,
} from '@noshiro/react-syncflow-hooks';
import type { Observable } from '@noshiro/syncflow';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  withInitialValue,
} from '@noshiro/syncflow';
import type { DeepReadonly } from '@noshiro/ts-utils';
import { IRecord, isNotUndefined } from '@noshiro/ts-utils';
import { useCallback } from 'react';

type Action = DeepReadonly<
  | { type: 'set'; answer: Answer }
  | { type: 'update'; updateFn: (a: Answer) => Answer }
>;

const reducer = (state: Answer, action: Action): Answer => {
  switch (action.type) {
    case 'set':
      return action.answer;
    case 'update':
      return action.updateFn(state);
  }
};

export const useAnswerForEditingState = (
  eventSchedule$: Observable<EventSchedule | undefined>
): Readonly<{
  answerForEditing: Answer;
  resetAnswerForEditing: () => void;
  updateAnswerForEditing: (updater: (a: Answer) => Answer) => void;
}> => {
  const [answerForEditing$, dispatch] = useReducerAsStream(
    reducer,
    defaultAnswer
  );

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

  useStreamEffect(resetAnswerForEditing$, (emptyAnswerSelection) => {
    dispatch({ type: 'set', answer: emptyAnswerSelection });
  });

  const updateAnswerForEditing = useCallback(
    (updateFn: (a: Answer) => Answer) => {
      dispatch({ type: 'update', updateFn });
    },
    [dispatch]
  );

  const answerForEditing = useStreamValue(answerForEditing$);

  return {
    answerForEditing,
    resetAnswerForEditing,
    updateAnswerForEditing,
  };
};
