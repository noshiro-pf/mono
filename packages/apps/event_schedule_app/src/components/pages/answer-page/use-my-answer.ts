import type { Answer, EventSchedule } from '@noshiro/event-schedule-app-api';
import { defaultAnswer } from '@noshiro/event-schedule-app-api';
import {
  useStream,
  useStreamValue,
  useUpdaterAsStream,
  useVoidEventAsStream,
} from '@noshiro/react-syncflow-hooks';
import type { Observable } from '@noshiro/syncflow';
import {
  filter,
  map,
  merge,
  withInitialValue,
  withLatestFrom,
} from '@noshiro/syncflow';
import { IRecord, isNotUndefined } from '@noshiro/ts-utils';

export const useMyAnswer = (
  eventSchedule$: Observable<EventSchedule | undefined>
): {
  myAnswer: Answer;
  resetMyAnswer: () => void;
  updateMyAnswer: (updater: (a: Answer) => Answer) => void;
} => {
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
      .chain(withInitialValue(defaultAnswer))
  );

  const [resetMyAnswer$, resetMyAnswer] = useVoidEventAsStream();

  const [myAnswerUserInput$, updateMyAnswer] =
    useUpdaterAsStream<Answer>(defaultAnswer);

  const myAnswer$ = useStream<Answer>(() =>
    merge(
      emptyAnswerSelection$,
      myAnswerUserInput$,
      resetMyAnswer$
        .chain(withLatestFrom(emptyAnswerSelection$))
        .chain(map(([_, x]) => x))
    ).chain(withInitialValue(defaultAnswer))
  );

  const myAnswer = useStreamValue(myAnswer$);

  return {
    myAnswer,
    resetMyAnswer,
    updateMyAnswer,
  };
};
