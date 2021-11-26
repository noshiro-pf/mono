import { Button } from '@blueprintjs/core';
import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { texts } from '../../../constants';
import { useEventScheduleSettingCommonHooks } from '../../../hooks';
import { Section } from '../../molecules';
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
import { ButtonsWrapperAlignEnd } from '../../styled';

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
      answerSymbols,
      onAnswerSymbolsValueChange,
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
            answerSymbols={answerSymbols}
            notificationSettings={notificationSettings}
            useAnswerDeadline={useAnswerDeadline}
            useNotification={useNotification}
            onAnswerDeadlineChange={onAnswerDeadlineChange}
            onAnswerSymbolsChange={onAnswerSymbolsValueChange}
            onNotificationSettingsChange={onNotificationSettingsChange}
            onToggleAnswerDeadline={onToggleAnswerDeadline}
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
              <Button
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
              <Button
                disabled={
                  !editButtonIsEnabled || editButtonIsLoading || hasNoChanges
                }
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
