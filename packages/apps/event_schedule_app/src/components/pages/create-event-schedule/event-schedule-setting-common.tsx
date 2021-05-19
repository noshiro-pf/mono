import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { texts } from '../../../constants';
import type { IEventSchedule } from '../../../types';
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
  initialValues: IEventSchedule;
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
