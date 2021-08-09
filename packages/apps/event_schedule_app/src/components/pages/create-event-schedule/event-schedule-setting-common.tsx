import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { texts } from '../../../constants';
import { ButtonsWrapperAlignEnd, Section } from '../../molecules';
import {
  BackToAnswerPageButton,
  CreateEventResultDialog,
  EventSchedulePropertiesErrors,
  EventSettings,
  NameAndNotes,
  ResetButton,
  ResetEditButton,
  SelectDatetimes,
} from '../../organisms';
import { useEventScheduleSettingCommonHooks } from './event-schedule-setting-common-hooks';

const vt = texts.eventSettingsPage;

type Props = Readonly<{
  mode: 'create' | 'edit';
  initialValues: EventSchedule;
}>;

export const EventScheduleSettingCommon = memoNamed<Props>(
  'EventScheduleSettingCommon',
  (props) => {
    const {
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
      onAnswerDeadlineChange,
      customizeSymbolSettings,
      onToggleCustomizeSymbolSettings,
      answerSymbolList,
      onAnswerSymbolListValueChange,
      useNotification,
      onToggleUseNotification,
      notificationSettings,
      onNotificationSettingsChange,
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
    } = useEventScheduleSettingCommonHooks(props.initialValues);

    return (
      <>
        <Section sectionTitle={vt.section1.titleAndNotesSectionTitle}>
          <NameAndNotes
            notes={notes}
            title={title}
            onNotesChange={onNotesChange}
            onTitleChange={onTitleChange}
          />
        </Section>
        <Section sectionTitle={vt.section2.selectDatesSectionTitle}>
          <SelectDatetimes
            datetimeList={datetimeRangeList}
            datetimeSpecification={datetimeSpecification}
            holidaysJpDefinition={holidaysJpDefinition}
            onDatetimeListChange={onDatetimeListChange}
            onDatetimeSpecificationChange={onDatetimeSpecificationChange}
          />
        </Section>
        <Section sectionTitle={vt.section3.otherSettingsTitle}>
          <EventSettings
            answerDeadline={answerDeadline}
            answerSymbolList={answerSymbolList}
            customizeSymbolSettings={customizeSymbolSettings}
            notificationSettings={notificationSettings}
            useAnswerDeadline={useAnswerDeadline}
            useNotification={useNotification}
            onAnswerDeadlineChange={onAnswerDeadlineChange}
            onAnswerSymbolListChange={onAnswerSymbolListValueChange}
            onNotificationSettingsChange={onNotificationSettingsChange}
            onToggleAnswerDeadline={onToggleAnswerDeadline}
            onToggleCustomizeSymbolSettings={onToggleCustomizeSymbolSettings}
            onToggleUseNotification={onToggleUseNotification}
          />
        </Section>
        <EventSchedulePropertiesErrors
          eventScheduleValidation={eventScheduleValidation}
        />
        <ButtonsWrapperModified>
          {props.mode === 'create' ? (
            <>
              <ResetButton
                disabled={createButtonIsLoading || hasNoChanges}
                onConfirmClick={onResetClick}
              />
              <BpButton
                disabled={!createButtonIsEnabled}
                intent={'primary'}
                loading={createButtonIsLoading}
                text={vt.createEventButton}
                onClick={onCreateEventClick}
              />
              <CreateEventResultDialog
                close={closeCreateResultDialog}
                isLoading={isLoading}
                isOpen={createResultDialogIsOpen}
                url={url}
                onClipboardButtonClick={onClipboardButtonClick}
              />
            </>
          ) : (
            <>
              <BackToAnswerPageButton
                disabled={editButtonIsLoading}
                hasNoChanges={hasNoChanges}
                onConfirmClick={onBackToAnswerPageClick}
              />
              <ResetEditButton
                disabled={editButtonIsLoading || hasNoChanges}
                onConfirmClick={onResetClick}
              />
              <BpButton
                disabled={!editButtonIsEnabled}
                intent={'primary'}
                loading={editButtonIsLoading}
                text={vt.editEventButton}
                onClick={onEditEventClick}
              />
            </>
          )}
        </ButtonsWrapperModified>
      </>
    );
  }
);

const ButtonsWrapperModified = styled(ButtonsWrapperAlignEnd)`
  justify-content: flex-start;
  margin: 20px;
`;
