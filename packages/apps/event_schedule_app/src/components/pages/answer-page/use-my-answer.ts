import {
  useStateAsStream,
  useStream,
  useStreamValue,
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
import { isNotUndefined } from '@noshiro/ts-utils';
import type { IAnswer } from '../../../types/record/answer';
import { createIAnswer } from '../../../types/record/answer';
import { createIAnswerSelection } from '../../../types/record/answer-selection';
import type { IEventSchedule } from '../../../types/record/event-schedule';

export const useMyAnswer = (
  eventSchedule$: Observable<IEventSchedule | undefined>
): {
  myAnswer: IAnswer;
  resetMyAnswer: () => void;
  setMyAnswer: (a: IAnswer) => void;
} => {
  const emptyAnswerSelection$ = useStream<IAnswer>(() =>
    eventSchedule$
      .chain(filter(isNotUndefined))
      .chain(
        map((e) =>
          createIAnswer().set(
            'selection',
            e.datetimeRangeList.map((d) =>
              createIAnswerSelection({ datetimeRange: d, iconId: undefined })
            )
          )
        )
      )
      .chain(withInitialValue(createIAnswer()))
  );

  const [resetMyAnswer$, resetMyAnswer] = useVoidEventAsStream();

  const [myAnswerUserInput$, setMyAnswer] = useStateAsStream<IAnswer>(
    createIAnswer()
  );

  const myAnswer$ = useStream<IAnswer>(() =>
    merge(
      emptyAnswerSelection$,
      myAnswerUserInput$,
      resetMyAnswer$
        .chain(withLatestFrom(emptyAnswerSelection$))
        .chain(map(([_, x]) => x))
    ).chain(withInitialValue(createIAnswer()))
  );

  const myAnswer = useStreamValue(myAnswer$);

  return {
    myAnswer,
    resetMyAnswer,
    setMyAnswer,
  };
};
