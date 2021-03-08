import { useDataStream, useStreamValue } from '@noshiro/react-rxjs-utils';
import { useCallback, useMemo, useRef, useState } from 'react';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatetimeSpecificationEnumType } from '../../../types/enum/datetime-specification-type';
import { IAnswerSymbol } from '../../../types/record/base/answer-symbol';
import {
  createINotificationSettings,
  INotificationSettings,
} from '../../../types/record/base/notification-settings';
import { IYearMonthDate } from '../../../types/record/base/year-month-date';
import { IDatetimeRange } from '../../../types/record/datetime-range';
import { IEventSchedule } from '../../../types/record/event-schedule';
import { EventScheduleValidation } from '../../../types/record/event-schedule-validation';
import { createIYmdHm, IYmdHm } from '../../../types/record/ymd-hm';
import { fetchHolidaysJson } from '../../../utils/fetch-holidays';
import { IList, IMap } from '../../../utils/immutable';
import { ymdFromDate } from '../../../utils/ymdhm-from-date';
import { useCreateEventScheduleHooks } from './create-event-schedule-hooks';
import { useEditEventScheduleHooks } from './edit-event-schedule-hooks';
import { normalizeEventSchedule } from './normalize-event-schedule';
import { useToggleSectionState } from './use-toggle-section-state';
import { validateEventSchedule, validateEventScheduleAll } from './validator';

interface EventScheduleSettingCommonHooks {
  title: string;
  onTitleChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  datetimeSpecification: DatetimeSpecificationEnumType;
  onDatetimeSpecificationChange: (value: DatetimeSpecificationEnumType) => void;
  datetimeRangeList: IList<IDatetimeRange>;
  onDatetimeListChange: (list: IList<IDatetimeRange>) => void;
  useAnswerDeadline: boolean;
  onToggleAnswerDeadline: () => void;
  answerDeadline: IYmdHm | undefined;
  onAnswerDeadlineChange: (value: IYmdHm | undefined) => void;
  customizeSymbolSettings: boolean;
  onToggleCustomizeSymbolSettings: () => void;
  answerSymbolList: IList<IAnswerSymbol>;
  onAnswerSymbolListValueChange: (value: IList<IAnswerSymbol>) => void;
  useNotification: boolean;
  onToggleUseNotification: () => void;
  notificationSettings: INotificationSettings;
  onNotificationSettingsChange: (value: INotificationSettings) => void;
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
  holidaysJpDefinition: IMap<IYearMonthDate, string>;
}

export const useEventScheduleSettingCommonHooks = (
  initialValuesInput: IEventSchedule
): EventScheduleSettingCommonHooks => {
  const initialValues = useRef(initialValuesInput);

  const [title, onTitleChange] = useState<string>(initialValues.current.title);
  const [notes, onNotesChange] = useState<string>(initialValues.current.notes);

  const [
    // dummy comment to control prettier
    datetimeSpecification,
    onDatetimeSpecificationChange,
  ] = useState<DatetimeSpecificationEnumType>(
    initialValues.current.datetimeSpecification
  );

  const [
    // dummy comment to control prettier
    datetimeRangeList,
    onDatetimeListChange,
  ] = useState<IList<IDatetimeRange>>(initialValues.current.datetimeRangeList);

  const [
    useAnswerDeadline,
    setUseAnswerDeadline,
    onToggleAnswerDeadline,
    answerDeadline,
    setAnswerDeadline,
    resetAnswerDeadline,
  ] = useToggleSectionState<IYmdHm | undefined>(
    initialValues.current.useAnswerDeadline,
    initialValues.current.answerDeadline,
    undefined
  );

  const [
    customizeSymbolSettings,
    setCustomizeSymbolSettings,
    onToggleCustomizeSymbolSettings,
    answerSymbolList,
    setAnswerSymbolList,
    resetAnswerSymbolList,
  ] = useToggleSectionState<IList<IAnswerSymbol>>(
    initialValues.current.customizeSymbolSettings,
    initialValues.current.answerSymbolList,
    initialValues.current.answerSymbolList
  );

  const [
    useNotification,
    setUseNotification,
    onToggleUseNotification,
    notificationSettings,
    setNotificationSettings,
    resetNotificationSettings,
  ] = useToggleSectionState<INotificationSettings>(
    initialValues.current.useNotification,
    initialValues.current.notificationSettings,
    createINotificationSettings()
  );

  const newEventSchedule: IEventSchedule = useMemo(
    () =>
      normalizeEventSchedule(
        initialValues.current.withMutations((draft) => {
          draft.set('title', title);
          draft.set('notes', notes);
          draft.set('datetimeSpecification', datetimeSpecification);
          draft.set('datetimeRangeList', datetimeRangeList);
          draft.set('useAnswerDeadline', useAnswerDeadline);
          draft.set('answerDeadline', answerDeadline ?? createIYmdHm());
          draft.set('customizeSymbolSettings', customizeSymbolSettings);
          draft.set('answerSymbolList', answerSymbolList);
          draft.set('useNotification', useNotification);
          draft.set('notificationSettings', notificationSettings);
        })
      ),
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
    () => initialValues.current.equals(newEventSchedule),
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

  const holidaysJpDefinition$ = useDataStream<IMap<IYearMonthDate, string>>(
    IMap<IYearMonthDate, string>(),
    from(fetchHolidaysJson()).pipe(
      map((record) =>
        IMap(
          Object.entries(record).map(([key, value]) => [
            ymdFromDate(new Date(key)),
            value,
          ])
        )
      )
    )
  );

  const holidaysJpDefinition = useStreamValue<IMap<IYearMonthDate, string>>(
    holidaysJpDefinition$,
    IMap<IYearMonthDate, string>()
  );

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
