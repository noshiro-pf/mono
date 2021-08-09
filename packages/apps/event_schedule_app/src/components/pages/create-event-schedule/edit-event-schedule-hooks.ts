import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { useNavigator } from '@noshiro/react-router-utils';
import { useAlive, useBooleanState } from '@noshiro/react-utils';
import { useCallback } from 'react';
import { api } from '../../../api';
import { texts } from '../../../constants';
import { createToaster, showToast } from '../../../functions';
import { routePaths, useEventId } from '../../../routing';

type EditEventScheduleHooks = Readonly<{
  editButtonIsEnabled: boolean;
  editButtonIsLoading: boolean;
  onEditEventClick: () => void;
  onBackToAnswerPageClick: () => void;
  isLoading: boolean;
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

  const eventId = useEventId();

  const routerNavigator = useNavigator();

  const answerPagePath = `${routePaths.answerPage}/${eventId ?? ''}`;

  const onBackToAnswerPage = useCallback(() => {
    routerNavigator(answerPagePath);
  }, [routerNavigator, answerPagePath]);

  const alive = useAlive();
  const onEditEventClick = useCallback(() => {
    if (!eventScheduleValidationOk) return;
    if (eventId === undefined) return;
    if (!alive.current) return;

    setIsLoadingTrue();
    api.event
      .update(eventId, newEventSchedule)
      .then(() => {
        if (!alive.current) return;
        setIsLoadingFalse();
        onBackToAnswerPage();
        showToast({
          toast,
          message: texts.eventSettingsPage.editEventResultMessage,
          intent: 'success',
        });
      })
      .catch((error) => {
        console.error('Error creating event schedule: ', error);
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
    isLoading,
  };
};
