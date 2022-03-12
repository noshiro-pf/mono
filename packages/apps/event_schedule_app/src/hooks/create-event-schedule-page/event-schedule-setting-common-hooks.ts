import type {
  AnswerIconSettings,
  DatetimeRange,
  DatetimeSpecificationEnumType,
  EventSchedule,
  EventScheduleValidation,
  NotificationSettings,
  YearMonthDate,
  Ymdhm,
} from '@noshiro/event-schedule-app-shared';
import { eventScheduleDefaultValue } from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { useState } from '@noshiro/react-utils';
import { useObservableValue } from '@noshiro/syncflow-react-hooks';
import type { IMapMapped } from '@noshiro/ts-utils';
import { IList } from '@noshiro/ts-utils';
import { useCallback, useMemo, useRef } from 'react';
import {
  initialAnswerDeadline,
  initialNotificationSettings,
} from '../../constants';
import type { EventSettingsPageDiffResult, YmdKey } from '../../functions';
import {
  collectEventSettingsPageDiff,
  normalizeEventSchedule,
  validateEventSchedule,
  validateEventScheduleAll,
} from '../../functions';
import { holidaysJpDefinition$, useUser } from '../../store';
import { mapNoneToUndefined } from '../../utils';
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
  answerIcons: AnswerIconSettings;
  onAnswerIconsValueChange: (value: AnswerIconSettings) => void;
  useNotification: boolean;
  onToggleUseNotification: () => void;
  notificationSettings: NotificationSettings | undefined;
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
  diff: EventSettingsPageDiffResult;
  hasDeletedDatetimeChanges: boolean;
  hasNoChanges: boolean;
  holidaysJpDefinition: IMapMapped<YearMonthDate, string, YmdKey>;
}>;

export const useEventScheduleSettingCommonHooks = (
  initialValuesInput: EventSchedule
): EventScheduleSettingCommonHooks => {
  const initialValues = useRef(initialValuesInput);

  const { state: title, setState: onTitleChange } = useState<string>(
    initialValues.current.title
  );
  const { state: notes, setState: onNotesChange } = useState<string>(
    initialValues.current.notes
  );

  const {
    state: datetimeSpecification,
    setState: onDatetimeSpecificationChange,
  } = useState<DatetimeSpecificationEnumType>(
    initialValues.current.datetimeSpecification
  );

  const { state: datetimeRangeList, setState: onDatetimeListChange } = useState<
    readonly DatetimeRange[]
  >(initialValues.current.datetimeRangeList);

  const {
    toggleState: useAnswerDeadline,
    toggle: onToggleAnswerDeadline,
    value: answerDeadline,
    setValue: setAnswerDeadline,
    resetState: resetAnswerDeadline,
  } = useToggleSectionState<Ymdhm | undefined>({
    initialToggleState: initialValues.current.answerDeadline !== 'none',
    initialState: mapNoneToUndefined(initialValues.current.answerDeadline),
    valueToBeSetWhenTurnedOff: undefined,
    valueToBeSetWhenTurnedOn: initialAnswerDeadline,
  });

  const {
    state: answerIcons,
    setState: setAnswerIcons,
    resetState: resetAnswerIcons,
  } = useState<AnswerIconSettings>(initialValues.current.answerIcons);

  const user = useUser();

  const initialNotificationSettingsWithEmailFilled = useMemo(
    () => ({
      ...initialNotificationSettings,
      email: user?.email ?? '',
    }),
    [user]
  );

  const {
    toggleState: useNotification,
    toggle: onToggleUseNotification,
    value: notificationSettings,
    setValue: setNotificationSettings,
    resetState: resetNotificationSettings,
  } = useToggleSectionState<NotificationSettings | undefined>({
    initialToggleState: initialValues.current.notificationSettings !== 'none',
    initialState: mapNoneToUndefined(
      initialValues.current.notificationSettings
    ),
    valueToBeSetWhenTurnedOff: undefined,
    valueToBeSetWhenTurnedOn: initialNotificationSettingsWithEmailFilled,
  });

  const newEventSchedule: EventSchedule = useMemo(
    () =>
      normalizeEventSchedule({
        title,
        notes,
        datetimeSpecification,
        datetimeRangeList,
        answerDeadline: answerDeadline ?? 'none',
        answerIcons,
        notificationSettings: notificationSettings ?? 'none',
        timezoneOffsetMinutes: eventScheduleDefaultValue.timezoneOffsetMinutes,
        author: {
          id: user?.uid ?? null,
          name: user?.displayName ?? '',
        },
      }),
    [
      title,
      notes,
      datetimeSpecification,
      datetimeRangeList,
      answerDeadline,
      answerIcons,
      notificationSettings,
      user,
    ]
  );

  const diff = useMemo<EventSettingsPageDiffResult>(
    () => collectEventSettingsPageDiff(initialValues.current, newEventSchedule),
    [newEventSchedule]
  );

  const hasDeletedDatetimeChanges = useMemo<boolean>(
    () =>
      diff.datetimeRangeList?.deleted !== undefined &&
      IList.isNonEmpty(diff.datetimeRangeList.deleted),
    [diff.datetimeRangeList]
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
        answerIcons,
        notificationSettings: notificationSettings ?? 'none',
      }),
    [title, datetimeRangeList, answerIcons, notificationSettings]
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
    resetAnswerDeadline();
    resetNotificationSettings();
    resetAnswerIcons();
  }, [
    onTitleChange,
    onNotesChange,
    onDatetimeSpecificationChange,
    onDatetimeListChange,
    resetAnswerDeadline,
    resetNotificationSettings,
    resetAnswerIcons,
  ]);

  const holidaysJpDefinition = useObservableValue<
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
    answerIcons,
    onAnswerIconsValueChange: setAnswerIcons,
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
    diff,
    hasDeletedDatetimeChanges,
    hasNoChanges,
    holidaysJpDefinition,
  };
};
