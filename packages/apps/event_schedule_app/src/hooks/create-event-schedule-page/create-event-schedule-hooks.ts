import { toAbsolutePath } from '@noshiro/ts-utils-additional';
import { api } from '../../api';
import { initialEventSchedule, routes } from '../../constants';
import { EventScheduleAppLocalStorage } from '../../functions';
import { useUser } from '../../store';
import type {
  EventScheduleSettingCommonState,
  EventScheduleSettingCommonStateHandler,
} from '../../types';
import { useEventScheduleSettingCommonHooks } from './event-schedule-setting-common-hooks';

type CreateEventScheduleHooks = Readonly<{
  commonState: EventScheduleSettingCommonState;
  commonStateHandlers: EventScheduleSettingCommonStateHandler;
  resetAllState: () => void;
  createButtonIsEnabled: boolean;
  createButtonIsLoading: boolean;
  onCreateEventClick: () => void;
  createResultDialogIsOpen: boolean;
  closeCreateResultDialog: () => void;
  onClipboardButtonClick: () => void;
  url: string;
  isLoading: boolean;
}>;

export const useCreateEventScheduleHooks = (): CreateEventScheduleHooks => {
  const { state: commonState, handlers: commonStateHandlers } =
    useEventScheduleSettingCommonHooks(initialEventSchedule);

  useEffect(() => {
    const fromStorage =
      EventScheduleAppLocalStorage.restoreCreateEventPageTemp();

    if (Result.isOk(fromStorage)) {
      const ev = fromStorage.value;
      if (ev === undefined) return;

      commonStateHandlers.setTitle(ev.title);
      commonStateHandlers.setNotes(ev.notes);
      commonStateHandlers.setDatetimeSpecification(ev.datetimeSpecification);
      commonStateHandlers.setDatetimeRangeList(ev.datetimeRangeList);
      commonStateHandlers.setAnswerIcons(ev.answerIcons);

      if (ev.answerDeadline === 'none') {
        commonStateHandlers.turnOffAnswerDeadlineSection();
      } else {
        commonStateHandlers.turnOnAnswerDeadlineSection();
        commonStateHandlers.setAnswerDeadline(ev.answerDeadline);
      }

      if (ev.notificationSettings === 'none') {
        commonStateHandlers.turnOffNotificationSection();
      } else {
        commonStateHandlers.turnOnNotificationSection();
        commonStateHandlers.setNotificationSettings(ev.notificationSettings);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const saveResult = EventScheduleAppLocalStorage.saveCreateEventPageTemp({
      answerDeadline: commonState.answerDeadline ?? 'none',
      answerIcons: commonState.answerIcons,
      datetimeRangeList: commonState.datetimeRangeList,
      datetimeSpecification: commonState.datetimeSpecification,
      notes: commonState.notes,
      notificationSettings: commonState.notificationSettings ?? 'none',
      title: commonState.title,
    });
    if (Result.isErr(saveResult)) {
      console.warn(saveResult.value);
    }
  }, [commonState]);

  const resetAllState = useCallback(() => {
    commonStateHandlers.resetTitle();
    commonStateHandlers.resetNotes();
    commonStateHandlers.resetDatetimeSpecification();
    commonStateHandlers.resetDatetimeRangeList();
    commonStateHandlers.resetAnswerDeadlineSection();
    commonStateHandlers.resetNotificationSettingsSection();
    commonStateHandlers.resetAnswerIcons();
  }, [commonStateHandlers]);

  const { newEventSchedule, eventScheduleValidationOk } = commonState;

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

  const createEvent = useCallback(async () => {
    if (!eventScheduleValidationOk || !alive.current) return;

    setIsLoadingTrue();

    openCreateResultDialog();

    const res = await api.event.add(
      IRecord.set(newEventSchedule, 'author', {
        id: user?.uid ?? null,
        name: user?.displayName ?? '',
      })
    );

    if (Result.isErr(res)) {
      console.error(res.value);
    }
    setIsLoadingFalse();
    setUrl(toAbsolutePath(`..${routes.answerPage(res.value)}`));
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

  const onCreateEventClick = useCallback(() => {
    createEvent().catch(console.error);
  }, [createEvent]);

  const onClipboardButtonClick = useCallback(() => {
    // https://stackoverflow.com/questions/51805395/navigator-clipboard-is-undefined
    if (isNotUndefined(navigator.clipboard) && window.isSecureContext) {
      navigator.clipboard.writeText(url).catch(console.error);
    }
  }, [url]);

  return {
    commonState,
    commonStateHandlers,
    resetAllState,
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
