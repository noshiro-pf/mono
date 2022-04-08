import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { useAlive, useBoolState, useState } from '@noshiro/react-utils';
import { toAbsolutePath } from '@noshiro/ts-utils-additional';
import { useCallback } from 'react';
import { api } from '../../api';
import { routes } from '../../constants';
import { useUser } from '../../store';

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
  const {
    state: isLoading,
    setTrue: setIsLoadingTrue,
    setFalse: setIsLoadingFalse,
  } = useBoolState(false);

  const {
    state: createResultDialogIsOpen,
    setTrue: openCreateResultDialog,
    setFalse: closeCreateResultDialog,
  } = useBoolState(false);

  const { state: url, setState: setUrl } = useState<string>('');

  const alive = useAlive();

  const user = useUser();

  const onCreateEventClick = useCallback(() => {
    if (!eventScheduleValidationOk) return;
    if (!alive.current) return;
    setIsLoadingTrue();
    openCreateResultDialog();
    api.event
      .add(
        IRecord.set(newEventSchedule, 'author', {
          id: user?.uid ?? null,
          name: user?.displayName ?? '',
        })
      )
      .then((res) => {
        if (!alive.current) return;
        if (Result.isErr(res)) {
          console.error(res.value);
        }
        setIsLoadingFalse();
        setUrl(toAbsolutePath(`..${routes.answerPage(res.value)}`));
      })
      .catch((error) => {
        console.error('Error creating event schedule: ', error);
      });
  }, [
    user,
    eventScheduleValidationOk,
    newEventSchedule,
    setIsLoadingTrue,
    setIsLoadingFalse,
    openCreateResultDialog,
    alive,
    setUrl,
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
