import { IToaster } from '@blueprintjs/core';
import {
  useDataStream,
  useStateAsStream,
  useStream,
  useStreamEffect,
  useStreamValue,
  useValueAsStream,
  useVoidEventAsStream,
} from '@mono/react-rxjs-utils';
import { useAlive } from '@mono/react-utils';
import { asValueFrom, filterNotUndefined } from '@mono/rxjs-utils';
import { pending, PromiseResult, unfold } from '@mono/ts-utils';
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { combineLatest, from, merge, of, timer } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  mapTo,
  startWith,
  switchMap,
  throttleTime,
} from 'rxjs/operators';
import { api } from '../../../api/api';
import { fetchThrottleTime } from '../../../constants/fetch-throttle-time';
import { texts } from '../../../constants/texts';
import { useEventId } from '../../../routing/use-event-id';
import { createIAnswer, IAnswer } from '../../../types/record/answer';
import { createIAnswerSelection } from '../../../types/record/answer-selection';
import { IEventSchedule } from '../../../types/record/event-schedule';
import { compareYmdHm } from '../../../types/record/ymd-hm';
import { IList } from '../../../utils/immutable';
import { clog } from '../../../utils/log';
import { now } from '../../../utils/today';

interface AnswerPageState {
  eventSchedule: IEventSchedule | undefined;
  onEditButtonClick: () => void;
  answers: IList<IAnswer> | undefined;
  isError: boolean;
  onAnswerClick: (answer: IAnswer) => void;
  showMyAnswerSection: () => void;
  myAnswerSectionState: 'hidden' | 'creating' | 'editing';
  answerSectionRef: RefObject<HTMLDivElement>;
  myAnswer: IAnswer;
  setMyAnswer: (answer: IAnswer) => void;
  onCancel: () => void;
  onDeleteAnswer: () => void;
  onSubmitAnswer: () => void;
  submitButtonIsLoading: boolean;
  submitButtonIsDisabled: boolean;
  fetchAnswers: () => void;
  refreshButtonIsLoading: boolean;
  refreshButtonIsDisabled: boolean;
  isExpired: boolean;
}

export const useAnswerPageState = (toast: IToaster): AnswerPageState => {
  const eventId = useEventId();

  const eventId$ = useValueAsStream(eventId);

  const [fetchEventSchedule$, fetchEventSchedule] = useVoidEventAsStream();
  const [fetchAnswers$, fetchAnswers] = useVoidEventAsStream();
  const fetchEventScheduleThrottled$ = useStream(
    fetchEventSchedule$.pipe(throttleTime(fetchThrottleTime))
  );
  const fetchAnswersThrottled$ = useStream(
    fetchAnswers$.pipe(throttleTime(fetchThrottleTime))
  );

  useStreamEffect(fetchEventScheduleThrottled$, () => {
    clog('fetchEventScheduleThrottled$');
  });
  useStreamEffect(fetchAnswersThrottled$, () => {
    clog('fetchAnswers$');
  });

  useEffect(() => {
    fetchEventSchedule();
    fetchAnswers();
  }, [fetchEventSchedule, fetchAnswers]);

  const eventScheduleResult$ = useDataStream<
    PromiseResult<undefined, any, IEventSchedule>
  >(
    pending(undefined),
    fetchEventScheduleThrottled$.pipe(
      asValueFrom(eventId$),
      switchMap((eId) => from(api.event.get(eId ?? ''))),
      map((r) => ({ status: 'success' as const, value: r })),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      catchError((err) => of({ status: 'error' as const, value: err }))
    )
  );

  const answersResult$ = useDataStream<{
    timestamp: number;
    value: PromiseResult<undefined, any, IList<IAnswer>>;
  }>(
    { timestamp: Date.now(), value: pending(undefined) },
    fetchAnswersThrottled$.pipe(
      asValueFrom(eventId$),
      switchMap((eId) => from(api.answers.getList(eId ?? ''))),
      map((r) => ({
        timestamp: Date.now(),
        value: { status: 'success' as const, value: r },
      })),
      catchError((err) =>
        of({
          timestamp: Date.now(),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value: { status: 'error' as const, value: err },
        })
      )
    )
  );

  const eventSchedule$ = useDataStream<undefined | IEventSchedule>(
    undefined,
    eventScheduleResult$.pipe(map(unfold))
  );

  const answers$ = useDataStream<undefined | IList<IAnswer>>(
    undefined,
    answersResult$.pipe(
      map((a) => a.value),
      map(unfold)
    )
  );

  const isError$ = useDataStream<boolean>(
    false,
    combineLatest([eventId$, eventScheduleResult$, answersResult$]).pipe(
      map(
        ([eventId, eventScheduleResult, answersResult]) =>
          eventId === undefined ||
          eventScheduleResult.status === 'error' ||
          answersResult.value.status === 'error'
      )
    )
  );

  const [
    //
    myAnswerSectionState,
    setMyAnswerSectionState,
  ] = useState<'hidden' | 'creating' | 'editing'>('hidden');

  const [
    //
    submitButtonIsLoading,
    setSubmitButtonIsLoading,
  ] = useState<boolean>(false);

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

  const answerSectionRef = useRef<HTMLDivElement>(null);

  const showMyAnswerSection = useCallback(() => {
    setMyAnswerSectionState('creating');
  }, []);

  useEffect(() => {
    switch (myAnswerSectionState) {
      case 'creating':
      case 'editing':
        answerSectionRef.current?.scrollIntoView();
        break;
      case 'hidden':
        break;
    }
  }, [myAnswerSectionState]);

  const eventSchedule = useStreamValue(eventSchedule$);
  const answers = useStreamValue(answers$);
  const myAnswer = useStreamValue(myAnswer$, createIAnswer());
  const isError: boolean = useStreamValue(isError$, false);

  const submitButtonIsDisabled = useMemo<boolean>(
    () =>
      myAnswer.userName === '' ||
      myAnswer.selection.some((s) => s.iconId === undefined),
    [myAnswer]
  );

  const onCancel = useCallback(() => {
    if (myAnswerSectionState === 'editing') {
      resetMyAnswer();
    }
    setMyAnswerSectionState('hidden');
  }, [myAnswerSectionState, resetMyAnswer]);

  const alive = useAlive();
  const onSubmitAnswer = useCallback(() => {
    if (eventId === undefined) return;
    if (!alive) return;
    setSubmitButtonIsLoading(true);
    switch (myAnswerSectionState) {
      case 'creating':
        api.answers
          .add(eventId, myAnswer.set('createdAt', Date.now()))
          .then(() => {
            if (!alive) return;
            setSubmitButtonIsLoading(false);
            setMyAnswerSectionState('hidden');
            fetchAnswers();
            resetMyAnswer();
            toast.show({
              timeout: 2000,
              intent: 'success',
              message:
                texts.answerPage.myAnswer.submitButton
                  .createAnswerResultMessage,
              icon: 'tick',
            });
          })
          .catch(console.error);
        break;
      case 'editing':
        api.answers
          .update(eventId, myAnswer.id, myAnswer)
          .then(() => {
            if (!alive) return;
            setSubmitButtonIsLoading(false);
            setMyAnswerSectionState('hidden');
            fetchAnswers();
            resetMyAnswer();
            toast.show({
              timeout: 2000,
              intent: 'success',
              message:
                texts.answerPage.myAnswer.submitButton
                  .updateAnswerResultMessage,
              icon: 'tick',
            });
          })
          .catch(console.error);
    }
  }, [
    myAnswer,
    myAnswerSectionState,
    eventId,
    alive,
    fetchAnswers,
    resetMyAnswer,
    toast,
  ]);

  const onDeleteAnswer = useCallback(() => {
    if (eventId === undefined) return;
    if (!alive) return;
    setSubmitButtonIsLoading(true);
    api.answers
      .delete(eventId, myAnswer.id)
      .then(() => {
        if (!alive) return;
        setSubmitButtonIsLoading(false);
        setMyAnswerSectionState('hidden');
        fetchAnswers();
        resetMyAnswer();
        toast.show({
          timeout: 2000,
          intent: 'success',
          message:
            texts.answerPage.myAnswer.deleteButton.deleteAnswerResultMessage,
          icon: 'tick',
        });
      })
      .catch(console.error);
  }, [myAnswer.id, eventId, alive, fetchAnswers, resetMyAnswer, toast]);

  const onAnswerClick = useCallback(
    (answer: IAnswer) => {
      setMyAnswerSectionState('editing');
      setMyAnswer(answer);
    },
    [setMyAnswer]
  );

  const refreshButtonIsLoading$ = useDataStream<boolean>(
    false,
    merge(
      fetchAnswersThrottled$.pipe(mapTo(true)),
      answersResult$.pipe(
        map((a) => a.timestamp),
        distinctUntilChanged(),
        mapTo(false)
      )
    )
  );

  const refreshButtonIsDisabled$ = useDataStream<boolean>(
    false,
    fetchAnswersThrottled$.pipe(
      switchMap(() =>
        timer(fetchThrottleTime).pipe(mapTo(false), startWith(true))
      )
    )
  );

  const refreshButtonIsLoading = useStreamValue(refreshButtonIsLoading$, false);
  const refreshButtonIsDisabled = useStreamValue(
    refreshButtonIsDisabled$,
    false
  );

  const isExpired = useMemo<boolean>(
    () =>
      eventSchedule === undefined
        ? false
        : eventSchedule.useAnswerDeadline &&
          compareYmdHm(now(), eventSchedule.answerDeadline) >= 0,
    [eventSchedule]
  );

  const onEditButtonClick = useCallback(() => {
    clog('onEditButtonClick');
  }, []);

  return {
    eventSchedule,
    onEditButtonClick,
    answers,
    isError,
    onAnswerClick,
    showMyAnswerSection,
    myAnswerSectionState,
    answerSectionRef,
    myAnswer,
    setMyAnswer,
    onCancel,
    onDeleteAnswer,
    onSubmitAnswer,
    submitButtonIsLoading,
    submitButtonIsDisabled,
    fetchAnswers,
    refreshButtonIsLoading,
    refreshButtonIsDisabled,
    isExpired,
  };
};
