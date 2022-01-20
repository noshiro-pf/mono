import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { useAlive, useBooleanState } from '@noshiro/react-utils';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { Result } from '@noshiro/ts-utils';
import { useCallback } from 'react';
import { api } from '../../api';
import { dict, routes } from '../../constants';
import { createToaster, showToast } from '../../functions';
import { fetchAnswers, fetchEventSchedule, router } from '../../store';

type EditEventScheduleHooks = Readonly<{
  editButtonIsEnabled: boolean;
  editButtonIsLoading: boolean;
  onEditEventClick: () => void;
  onBackToAnswerPageClick: () => void;
}>;

const toast = createToaster();

export const useEditEventScheduleHooks = ({
  newEventSchedule,
  eventScheduleValidationOk,
}: Readonly<{
  newEventSchedule: EventSchedule;
  eventScheduleValidationOk: boolean;
}>): EditEventScheduleHooks => {
  const [isLoading, setIsLoadingTrue, setIsLoadingFalse] =
    useBooleanState(false);

  const eventId = useStreamValue(router.eventId$);

  const answerPagePath = routes.answerPage(eventId ?? '');

  const onBackToAnswerPage = useCallback(() => {
    router.push(answerPagePath);
  }, [answerPagePath]);

  const alive = useAlive();
  const onEditEventClick = useCallback(() => {
    if (!eventScheduleValidationOk) return;
    if (eventId === undefined) return;
    if (!alive.current) return;

    setIsLoadingTrue();
    api.event
      .update(eventId, newEventSchedule)
      .then((res) => {
        if (!alive.current) return;

        if (Result.isErr(res)) {
          console.error(res.value);
        }

        setIsLoadingFalse();
        fetchAnswers();
        fetchEventSchedule();
        onBackToAnswerPage();
        showToast({
          toast,
          message: dict.eventSettingsPage.editEventResultMessage.success,
          intent: 'success',
        });
      })
      .catch((error) => {
        console.error('Error creating event schedule: ', error);
        showToast({
          toast,
          message: dict.eventSettingsPage.editEventResultMessage.error,
          intent: 'danger',
        });
      });
  }, [
    eventScheduleValidationOk,
    newEventSchedule,
    setIsLoadingTrue,
    setIsLoadingFalse,
    eventId,
    onBackToAnswerPage,
    alive,
  ]);

  return {
    editButtonIsEnabled: eventScheduleValidationOk,
    editButtonIsLoading: isLoading,
    onBackToAnswerPageClick: onBackToAnswerPage,
    onEditEventClick,
  };
};
