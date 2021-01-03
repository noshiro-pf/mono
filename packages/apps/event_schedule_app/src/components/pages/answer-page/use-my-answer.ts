import {
  useDataStream,
  useStateAsStream,
  useStreamValue,
  useVoidEventAsStream,
} from '@mono/react-rxjs-utils';
import { asValueFrom, filterNotUndefined } from '@mono/rxjs-utils';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createIAnswer, IAnswer } from '../../../types/record/answer';
import { createIAnswerSelection } from '../../../types/record/answer-selection';
import { IEventSchedule } from '../../../types/record/event-schedule';

export const useMyAnswer = (
  eventSchedule$: Observable<IEventSchedule | undefined>
): {
  myAnswer: IAnswer;
  resetMyAnswer: () => void;
  setMyAnswer: (a: IAnswer) => void;
} => {
  const emptyAnswerSelection$ = useDataStream<IAnswer>(
    createIAnswer(),
    eventSchedule$.pipe(
      filterNotUndefined(),
      map((e) =>
        createIAnswer().set(
          'selection',
          e.datetimeRangeList.map((d) =>
            createIAnswerSelection({ datetimeRange: d, iconId: undefined })
          )
        )
      )
    )
  );

  const [resetMyAnswer$, resetMyAnswer] = useVoidEventAsStream();

  const [myAnswerUserInput$, setMyAnswer] = useStateAsStream<IAnswer>(
    createIAnswer()
  );

  const myAnswer$ = useDataStream<IAnswer>(
    createIAnswer(),
    merge(
      emptyAnswerSelection$,
      myAnswerUserInput$,
      resetMyAnswer$.pipe(asValueFrom(emptyAnswerSelection$))
    )
  );

  const myAnswer = useStreamValue(myAnswer$, createIAnswer());

  return {
    myAnswer,
    resetMyAnswer,
    setMyAnswer,
  };
};
