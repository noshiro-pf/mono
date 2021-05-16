import { useNavigator } from '@noshiro/react-router-utils';
import { useStreamValue } from '@noshiro/react-syncflow-hooks';
import { useAlive } from '@noshiro/react-utils';
import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../../api/api';
import { texts } from '../../../constants/texts';
import { routePaths } from '../../../routing/routing';
import { useEventId } from '../../../routing/use-event-id';
import type { UserName } from '../../../types/phantom';
import type { IAnswer } from '../../../types/record/answer';
import type { IEventSchedule } from '../../../types/record/event-schedule';
import { compareYmdHm } from '../../../types/record/ymd-hm';
import type { IList } from '../../../utils/immutable';
import { IMap } from '../../../utils/immutable';
import { createToaster, showToast } from '../../../utils/toaster';
import { now } from '../../../utils/today';
import { useFetchEventStreams } from './use-fetch-event-stream';
import { useFetchResults } from './use-fetch-results';
import { useMyAnswer } from './use-my-answer';
import { useRefreshButtonState } from './use-refresh-button-state';

type AnswerPageState = Readonly<{
  eventId: string | undefined;
  eventSchedule: IEventSchedule | undefined;
  onEditButtonClick: () => void;
  answers: IList<IAnswer> | undefined;
  errorType:
    | Readonly<{ data: 'answersResult'; type: 'not-found' | 'others' }>
    | Readonly<{ data: 'eventScheduleResult'; type: 'not-found' | 'others' }>
    | undefined;
  onAnswerClick: (answer: IAnswer) => void;
  showMyAnswerSection: () => void;
  myAnswerSectionState: 'creating' | 'editing' | 'hidden';
  answerSectionRef: RefObject<HTMLDivElement>;
  myAnswer: IAnswer;
  setMyAnswer: (answer: IAnswer) => void;
  onCancel: () => void;
  onDeleteAnswer: () => Promise<void>;
  onSubmitAnswer: () => Promise<void>;
  submitButtonIsLoading: boolean;
  submitButtonIsDisabled: boolean;
  fetchAnswers: () => void;
  refreshButtonIsLoading: boolean;
  refreshButtonIsDisabled: boolean;
  isExpired: boolean;
  usernameDuplicateCheckException: UserName | undefined;
}>;

const toast = createToaster();

export const useAnswerPageState = (): AnswerPageState => {
  const eventId = useEventId();

  const {
    fetchEventScheduleThrottled$,
    fetchAnswersThrottled$,
    fetchAnswers,
  } = useFetchEventStreams();

  const {
    eventSchedule$,
    answers$,
    answersResultTimestamp$,
    errorType,
  } = useFetchResults(
    fetchEventScheduleThrottled$,
    fetchAnswersThrottled$,
    eventId
  );

  const [
    //
    myAnswerSectionState,
    setMyAnswerSectionState,
  ] = useState<'creating' | 'editing' | 'hidden'>('hidden');

  const [
    //
    submitButtonIsLoading,
    setSubmitButtonIsLoading,
  ] = useState<boolean>(false);

  const { myAnswer, setMyAnswer, resetMyAnswer } = useMyAnswer(eventSchedule$);

  const [
    usernameDuplicateCheckException,
    setUsernameDuplicateCheckException,
  ] = useState<UserName | undefined>(undefined);

  const answerSectionRef = useRef<HTMLDivElement>(null);

  const showMyAnswerSection = useCallback(() => {
    setUsernameDuplicateCheckException(undefined);
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

  const submitButtonIsDisabled = useMemo<boolean>(() => {
    if (eventSchedule === undefined) return true;
    const myanswerAsMap = IMap(
      myAnswer.selection.map(({ datetimeRange, iconId }) => [
        datetimeRange,
        iconId,
      ])
    );

    return (
      myAnswer.userName === '' ||
      eventSchedule.datetimeRangeList.some(
        (d) => myanswerAsMap.get(d) === undefined
      )
    );
  }, [myAnswer, eventSchedule]);

  const onCancel = useCallback(() => {
    if (myAnswerSectionState === 'editing') {
      resetMyAnswer();
    }
    setMyAnswerSectionState('hidden');
  }, [myAnswerSectionState, resetMyAnswer]);

  const alive = useAlive();
  const onSubmitAnswer = useCallback(async () => {
    if (eventId === undefined) return;
    if (!alive) return;
    setSubmitButtonIsLoading(true);
    switch (myAnswerSectionState) {
      case 'creating':
        await api.answers
          .add(eventId, myAnswer.set('createdAt', Date.now()))
          .then(() => {
            if (!alive) return;
            setSubmitButtonIsLoading(false);
            setMyAnswerSectionState('hidden');
            fetchAnswers();
            resetMyAnswer();
            showToast({
              toast,
              message:
                texts.answerPage.myAnswer.submitButton
                  .createAnswerResultMessage,
              intent: 'success',
            });
          })
          .catch(console.error);
        break;
      case 'editing':
        await api.answers
          .update(eventId, myAnswer.id, myAnswer)
          .then(() => {
            if (!alive) return;
            setSubmitButtonIsLoading(false);
            setMyAnswerSectionState('hidden');
            fetchAnswers();
            resetMyAnswer();
            showToast({
              toast,
              message:
                texts.answerPage.myAnswer.submitButton
                  .updateAnswerResultMessage,
              intent: 'success',
            });
          })
          .catch(console.error);
        break;
      case 'hidden':
        break;
    }
  }, [
    myAnswer,
    myAnswerSectionState,
    eventId,
    alive,
    fetchAnswers,
    resetMyAnswer,
  ]);

  const onDeleteAnswer = useCallback(async (): Promise<void> => {
    if (eventId === undefined) return;
    if (!alive) return;
    setSubmitButtonIsLoading(true);
    await api.answers
      .delete(eventId, myAnswer.id)
      .then(() => {
        if (!alive) return;
        setSubmitButtonIsLoading(false);
        setMyAnswerSectionState('hidden');
        fetchAnswers();
        resetMyAnswer();
      })
      .catch(console.error);
  }, [myAnswer.id, eventId, alive, fetchAnswers, resetMyAnswer]);

  const onAnswerClick = useCallback(
    (answer: IAnswer) => {
      setMyAnswerSectionState('editing');
      setMyAnswer(answer);
      setUsernameDuplicateCheckException(answer.userName);
    },
    [setMyAnswer]
  );

  const {
    refreshButtonIsLoading,
    refreshButtonIsDisabled,
  } = useRefreshButtonState(fetchAnswersThrottled$, answersResultTimestamp$);

  const isExpired = useMemo<boolean>(
    () =>
      eventSchedule === undefined
        ? false
        : eventSchedule.useAnswerDeadline &&
          eventSchedule.answerDeadline !== undefined &&
          compareYmdHm(now(), eventSchedule.answerDeadline) >= 0,
    [eventSchedule]
  );

  const routerNavigator = useNavigator();

  const onEditButtonClick = useCallback(() => {
    if (eventId !== undefined) {
      routerNavigator(routePaths.editPage(eventId));
    }
  }, [routerNavigator, eventId]);

  return {
    eventId,
    eventSchedule,
    onEditButtonClick,
    answers,
    errorType,
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
    usernameDuplicateCheckException,
  };
};
