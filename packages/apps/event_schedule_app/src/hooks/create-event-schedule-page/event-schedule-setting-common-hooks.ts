import type {
  AnswerSymbol,
  DatetimeRange,
  DatetimeSpecificationEnumType,
  EventSchedule,
  EventScheduleValidation,
  NotificationSettings,
  YearMonthDate,
  Ymdhm,
} from '@noshiro/event-schedule-app-shared';
import {
  defaultEventSchedule,
  defaultYmdhm,
} from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import type { IMapMapped } from '@noshiro/ts-utils';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  initialAnswerDeadline,
  initialNotificationSettings,
} from '../../constants';
import type { YmdKey } from '../../functions';
import {
  normalizeEventSchedule,
  validateEventSchedule,
  validateEventScheduleAll,
} from '../../functions';
import { holidaysJpDefinition$ } from '../../store';
import { useToggleSectionState } from '../use-toggle-section-state';
import { useCreateEventScheduleHooks } from './create-event-schedule-hooks';
import { useEditEventScheduleHooks } from './edit-event-schedule-hooks';

type EventScheduleSettingCommonHooks = Readonly<{
  title: string;
  onTitleChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  datetimeSpecification: DatetimeSpecificationEnumType;
  onDatetimeSpecificationChange: (value: DatetimeSpecificationEnumType) => void;
  datetimeRangeList: readonly DatetimeRange[];
  onDatetimeListChange: (list: readonly DatetimeRange[]) => void;
  useAnswerDeadline: boolean;
  onToggleAnswerDeadline: () => void;
  answerDeadline: Ymdhm | undefined;
  onAnswerDeadlineChange: (value: Ymdhm | undefined) => void;
  customizeSymbolSettings: boolean;
  onToggleCustomizeSymbolSettings: () => void;
  answerSymbolList: readonly AnswerSymbol[];
  onAnswerSymbolListValueChange: (value: readonly AnswerSymbol[]) => void;
  useNotification: boolean;
  onToggleUseNotification: () => void;
  notificationSettings: NotificationSettings;
  onNotificationSettingsChange: (value: NotificationSettings) => void;
  eventScheduleValidation: EventScheduleValidation;
  onResetClick: () => void;
  createButtonIsEnabled: boolean;
  createButtonIsLoading: boolean;
  onCreateEventClick: () => void;
  createResultDialogIsOpen: boolean;
  closeCreateResultDialog: () => void;
  onClipboardButtonClick: () => void;
  url: string;
  isLoading: boolean;
  editButtonIsEnabled: boolean;
  editButtonIsLoading: boolean;
  onEditEventClick: () => void;
  onBackToAnswerPageClick: () => void;
  hasNoChanges: boolean;
  holidaysJpDefinition: IMapMapped<YearMonthDate, string, YmdKey>;
}>;

export const useEventScheduleSettingCommonHooks = (
  initialValuesInput: EventSchedule
): EventScheduleSettingCommonHooks => {
  const initialValues = useRef(initialValuesInput);

  const [title, onTitleChange] = useState<string>(initialValues.current.title);
  const [notes, onNotesChange] = useState<string>(initialValues.current.notes);

  const [datetimeSpecification, onDatetimeSpecificationChange] =
    useState<DatetimeSpecificationEnumType>(
      initialValues.current.datetimeSpecification
    );

  const [datetimeRangeList, onDatetimeListChange] = useState<
    readonly DatetimeRange[]
  >(initialValues.current.datetimeRangeList);

  const {
    useThisConfig: useAnswerDeadline,
    setUseThisConfig: setUseAnswerDeadline,
    toggle: onToggleAnswerDeadline,
    value: answerDeadline,
    setValue: setAnswerDeadline,
    resetValue: resetAnswerDeadline,
  } = useToggleSectionState<Ymdhm | undefined>({
    initialToggleState: initialValues.current.useAnswerDeadline,
    defaultValue: initialValues.current.answerDeadline,
    valueWhenTurnedOff: undefined,
    valueWhenTurnedOn: initialAnswerDeadline,
  });

  const {
    useThisConfig: customizeSymbolSettings,
    setUseThisConfig: setCustomizeSymbolSettings,
    toggle: onToggleCustomizeSymbolSettings,
    value: answerSymbolList,
    setValue: setAnswerSymbolList,
    resetValue: resetAnswerSymbolList,
  } = useToggleSectionState<readonly AnswerSymbol[]>({
    initialToggleState: initialValues.current.customizeSymbolSettings,
    defaultValue: initialValues.current.answerSymbolList,
    valueWhenTurnedOff: initialValues.current.answerSymbolList,
  });

  const {
    useThisConfig: useNotification,
    setUseThisConfig: setUseNotification,
    toggle: onToggleUseNotification,
    value: notificationSettings,
    setValue: setNotificationSettings,
    resetValue: resetNotificationSettings,
  } = useToggleSectionState<NotificationSettings>({
    initialToggleState: initialValues.current.useNotification,
    defaultValue: initialValues.current.notificationSettings,
    valueWhenTurnedOff: initialNotificationSettings,
    valueWhenTurnedOn: initialNotificationSettings,
  });

  const newEventSchedule: EventSchedule = useMemo(
    () =>
      normalizeEventSchedule({
        title,
        notes,
        datetimeSpecification,
        datetimeRangeList,
        useAnswerDeadline,
        answerDeadline: answerDeadline ?? defaultYmdhm,
        customizeSymbolSettings,
        answerSymbolList,
        useNotification,
        notificationSettings,
        timezoneOffsetMinutes: defaultEventSchedule.timezoneOffsetMinutes,
      }),
    [
      title,
      notes,
      datetimeSpecification,
      datetimeRangeList,
      useAnswerDeadline,
      answerDeadline,
      customizeSymbolSettings,
      answerSymbolList,
      useNotification,
      notificationSettings,
    ]
  );

  const hasNoChanges = useMemo<boolean>(
    () => deepEqual(initialValues.current, newEventSchedule),
    [newEventSchedule]
  );

  const eventScheduleValidation = useMemo<EventScheduleValidation>(
    () =>
      validateEventSchedule({
        title,
        datetimeRangeList,
        useAnswerDeadline,
        answerDeadline,
        answerSymbolList,
        useNotification,
        notificationSettings,
      }),
    [
      title,
      datetimeRangeList,
      useAnswerDeadline,
      answerDeadline,
      answerSymbolList,
      useNotification,
      notificationSettings,
    ]
  );

  const eventScheduleValidationOk = validateEventScheduleAll(
    eventScheduleValidation
  );

  const {
    createButtonIsEnabled,
    createButtonIsLoading,
    onCreateEventClick,
    createResultDialogIsOpen,
    closeCreateResultDialog,
    onClipboardButtonClick,
    url,
    isLoading,
  } = useCreateEventScheduleHooks({
    newEventSchedule,
    eventScheduleValidationOk,
  });

  const {
    editButtonIsEnabled,
    editButtonIsLoading,
    onEditEventClick,
    onBackToAnswerPageClick,
  } = useEditEventScheduleHooks({
    newEventSchedule,
    eventScheduleValidationOk,
  });

  const onResetClick = useCallback(() => {
    onTitleChange(initialValues.current.title);
    onNotesChange(initialValues.current.notes);
    onDatetimeSpecificationChange(initialValues.current.datetimeSpecification);
    onDatetimeListChange(initialValues.current.datetimeRangeList);
    setUseAnswerDeadline(initialValues.current.useAnswerDeadline);
    resetAnswerDeadline();
    setCustomizeSymbolSettings(initialValues.current.customizeSymbolSettings);
    resetAnswerSymbolList();
    setUseNotification(initialValues.current.useNotification);
    resetNotificationSettings();
  }, [
    setUseAnswerDeadline,
    resetAnswerDeadline,
    setCustomizeSymbolSettings,
    resetAnswerSymbolList,
    setUseNotification,
    resetNotificationSettings,
  ]);

  const holidaysJpDefinition = useStreamValue<
    IMapMapped<YearMonthDate, string, YmdKey>
  >(holidaysJpDefinition$);

  return {
    title,
    onTitleChange,
    notes,
    onNotesChange,
    datetimeSpecification,
    onDatetimeSpecificationChange,
    datetimeRangeList,
    onDatetimeListChange,
    useAnswerDeadline,
    onToggleAnswerDeadline,
    answerDeadline,
    onAnswerDeadlineChange: setAnswerDeadline,
    customizeSymbolSettings,
    onToggleCustomizeSymbolSettings,
    answerSymbolList,
    onAnswerSymbolListValueChange: setAnswerSymbolList,
    useNotification,
    onToggleUseNotification,
    notificationSettings,
    onNotificationSettingsChange: setNotificationSettings,
    eventScheduleValidation,
    createButtonIsEnabled,
    createButtonIsLoading,
    onCreateEventClick,
    createResultDialogIsOpen,
    onResetClick,
    closeCreateResultDialog,
    onClipboardButtonClick,
    url,
    isLoading,
    editButtonIsEnabled,
    editButtonIsLoading,
    onEditEventClick,
    onBackToAnswerPageClick,
    hasNoChanges,
    holidaysJpDefinition,
  };
};
