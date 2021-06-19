import type {
  Answer,
  EventSchedule,
  UserName,
} from '@noshiro/event-schedule-app-api';
import { compareYmdhm } from '@noshiro/event-schedule-app-api';
import { useNavigator } from '@noshiro/react-router-utils';
import { useStreamValue } from '@noshiro/react-syncflow-hooks';
import { useAlive } from '@noshiro/react-utils';
import type { DeepReadonly } from '@noshiro/ts-utils';
import { IMapMapped, IRecord } from '@noshiro/ts-utils';
import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../../api';
import { texts } from '../../../constants';
import {
  createToaster,
  datetimeRangeFromMapKey,
  datetimeRangeToMapKey,
  now,
  showToast,
} from '../../../functions';
import { routePaths, useEventId } from '../../../routing';
import { useFetchEventStreams } from './use-fetch-event-stream';
import { useFetchResults } from './use-fetch-results';
import { useMyAnswer } from './use-my-answer';
import { useRefreshButtonState } from './use-refresh-button-state';

type AnswerPageState = DeepReadonly<{
  eventId: string | undefined;
  eventSchedule: EventSchedule | undefined;
  onEditButtonClick: () => void;
  answers: readonly Answer[] | undefined;
  errorType:
    | { data: 'answersResult'; type: 'not-found' | 'others' }
    | { data: 'eventScheduleResult'; type: 'not-found' | 'others' }
    | undefined;
  onAnswerClick: (answer: Answer) => void;
  showMyAnswerSection: () => void;
  myAnswerSectionState: 'creating' | 'editing' | 'hidden';
  answerSectionRef: RefObject<HTMLDivElement>;
  myAnswer: Answer;
  updateMyAnswer: (updater: (answer: Answer) => Answer) => void;
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

  const { fetchEventScheduleThrottled$, fetchAnswersThrottled$, fetchAnswers } =
    useFetchEventStreams();

  const { eventSchedule$, answers$, answersResultTimestamp$, errorType } =
    useFetchResults(
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

  const { myAnswer, updateMyAnswer, resetMyAnswer } =
    useMyAnswer(eventSchedule$);

  const [usernameDuplicateCheckException, setUsernameDuplicateCheckException] =
    useState<UserName | undefined>(undefined);

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
    const myAnswerAsMap = IMapMapped.new(
      myAnswer.selection.map(({ datetimeRange, iconId }) => [
        datetimeRange,
        iconId,
      ]),
      datetimeRangeToMapKey,
      datetimeRangeFromMapKey
    );

    return (
      myAnswer.userName === '' ||
      eventSchedule.datetimeRangeList.some(
        (d) => myAnswerAsMap.get(d) === undefined
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
          .add(eventId, IRecord.set(myAnswer, 'createdAt', Date.now()))
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
    (answer: Answer) => {
      setMyAnswerSectionState('editing');
      updateMyAnswer(() => answer);
      setUsernameDuplicateCheckException(answer.userName);
    },
    [updateMyAnswer]
  );

  const { refreshButtonIsLoading, refreshButtonIsDisabled } =
    useRefreshButtonState(fetchAnswersThrottled$, answersResultTimestamp$);

  const isExpired = useMemo<boolean>(
    () =>
      eventSchedule === undefined
        ? false
        : eventSchedule.useAnswerDeadline &&
          eventSchedule.answerDeadline !== undefined &&
          compareYmdhm(now(), eventSchedule.answerDeadline) >= 0,
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
    updateMyAnswer,
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
