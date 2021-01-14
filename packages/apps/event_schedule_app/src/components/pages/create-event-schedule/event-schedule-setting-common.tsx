import { BpButton } from '@mono/react-blueprintjs-utils';
import { memoNamed } from '@mono/react-utils';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import { IEventSchedule } from '../../../types/record/event-schedule';
import { ButtonsWrapperAlignEnd } from '../../molecules/buttons-wrapper';
import { Section } from '../../molecules/section';
import { BackToAnswerPageButton } from '../../organisms/button-with-confirm/back-to-answer-page-button';
import { ResetButton } from '../../organisms/button-with-confirm/reset-button';
import { ResetEditButton } from '../../organisms/button-with-confirm/reset-edit-button';
import { CreateEventResultDialog } from '../../organisms/create-event-result-dialog';
import { EventSchedulePropertiesErrors } from '../../organisms/errors';
import { EventSettings } from '../../organisms/event-settings/event-settings';
import { NameAndNotes } from '../../organisms/name-and-note';
import { SelectDatetimes } from '../../organisms/select-datetimes/select-datetimes/select-datetimes';
import { useEventScheduleSettingCommonHooks } from './event-schedule-setting-common-hooks';

const vt = texts.eventSettingsPage;

interface Props {
  mode: 'create' | 'edit';
  initialValues: IEventSchedule;
}

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
            title={title}
            onTitleChange={onTitleChange}
            notes={notes}
            onNotesChange={onNotesChange}
          />
        </Section>
        <Section sectionTitle={vt.section2.selectDatesSectionTitle}>
          <SelectDatetimes
            datetimeSpecification={datetimeSpecification}
            onDatetimeSpecificationChange={onDatetimeSpecificationChange}
            datetimeList={datetimeRangeList}
            onDatetimeListChange={onDatetimeListChange}
            holidaysJpDefinition={holidaysJpDefinition}
          />
        </Section>
        <Section sectionTitle={vt.section3.otherSettingsTitle}>
          <EventSettings
            useAnswerDeadline={useAnswerDeadline}
            onToggleAnswerDeadline={onToggleAnswerDeadline}
            answerDeadline={answerDeadline}
            onAnswerDeadlineChange={onAnswerDeadlineChange}
            customizeSymbolSettings={customizeSymbolSettings}
            onToggleCustomizeSymbolSettings={onToggleCustomizeSymbolSettings}
            answerSymbolList={answerSymbolList}
            onAnswerSymbolListChange={onAnswerSymbolListValueChange}
            useNotification={useNotification}
            onToggleUseNotification={onToggleUseNotification}
            notificationSettings={notificationSettings}
            onNotificationSettingsChange={onNotificationSettingsChange}
          />
        </Section>
        <EventSchedulePropertiesErrors
          eventScheduleValidation={eventScheduleValidation}
        />
        <ButtonsWrapperModified>
          {props.mode === 'create' ? (
            <>
              <ResetButton
                onConfirmClick={onResetClick}
                disabled={createButtonIsLoading || hasNoChanges}
              />
              <BpButton
                intent='primary'
                text={vt.createEventButton}
                disabled={!createButtonIsEnabled}
                loading={createButtonIsLoading}
                onClick={onCreateEventClick}
              />
              <CreateEventResultDialog
                isOpen={createResultDialogIsOpen}
                close={closeCreateResultDialog}
                onClipboardButtonClick={onClipboardButtonClick}
                url={url}
                isLoading={isLoading}
              />
            </>
          ) : (
            <>
              <BackToAnswerPageButton
                hasNoChanges={hasNoChanges}
                onConfirmClick={onBackToAnswerPageClick}
                disabled={editButtonIsLoading}
              />
              <ResetEditButton
                onConfirmClick={onResetClick}
                disabled={editButtonIsLoading || hasNoChanges}
              />
              <BpButton
                intent='primary'
                text={vt.editEventButton}
                disabled={!editButtonIsEnabled}
                loading={editButtonIsLoading}
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
