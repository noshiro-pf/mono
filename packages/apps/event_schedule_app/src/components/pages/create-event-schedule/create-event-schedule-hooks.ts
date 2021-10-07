import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { useAlive, useBooleanState } from '@noshiro/react-utils';
import { toAbsolutePath } from '@noshiro/ts-utils';
import { useCallback, useState } from 'react';
import { api } from '../../../api';
import { routes } from '../../../constants';

type CreateEventScheduleHooks = Readonly<{
  createButtonIsEnabled: boolean;
  createButtonIsLoading: boolean;
  onCreateEventClick: () => void;
  createResultDialogIsOpen: boolean;
  closeCreateResultDialog: () => void;
  onClipboardButtonClick: () => void;
  url: string;
  isLoading: boolean;
}>;

export const useCreateEventScheduleHooks = ({
  newEventSchedule,
  eventScheduleValidationOk,
}: Readonly<{
  newEventSchedule: EventSchedule;
  eventScheduleValidationOk: boolean;
}>): CreateEventScheduleHooks => {
  const [isLoading, setIsLoadingTrue, setIsLoadingFalse] =
    useBooleanState(false);

  const [
    createResultDialogIsOpen,
    openCreateResultDialog,
    closeCreateResultDialog,
  ] = useBooleanState(false);

  const [url, setUrl] = useState<string>('');

  const alive = useAlive();
  const onCreateEventClick = useCallback(() => {
    if (!eventScheduleValidationOk) return;
    if (!alive.current) return;
    setIsLoadingTrue();
    openCreateResultDialog();
    api.event
      .add(newEventSchedule)
      .then((id) => {
        if (!alive.current) return;
        setIsLoadingFalse();
        setUrl(toAbsolutePath(`..${routes.answerPage(id)}`));
      })
      .catch((error) => {
        console.error('Error creating event schedule: ', error);
      });
  }, [
    eventScheduleValidationOk,
    newEventSchedule,
    setIsLoadingTrue,
    setIsLoadingFalse,
    openCreateResultDialog,
    alive,
  ]);

  const onClipboardButtonClick = useCallback(() => {
    navigator.clipboard.writeText(url).catch(console.error);
  }, [url]);

  return {
    createButtonIsEnabled: eventScheduleValidationOk,
    createButtonIsLoading: isLoading,
    onCreateEventClick,
    createResultDialogIsOpen,
    closeCreateResultDialog,
    onClipboardButtonClick,
    url,
    isLoading,
  };
};
