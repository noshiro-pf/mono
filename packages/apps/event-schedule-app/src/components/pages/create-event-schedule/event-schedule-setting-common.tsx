import {
  type EventScheduleSettingCommonState,
  type EventScheduleSettingCommonStateHandler,
} from '../../../types';
import { Section } from '../../molecules';
import {
  EventSchedulePropertiesErrors,
  EventSettings,
  NameAndNotes,
  SelectDatetimes,
} from '../../organisms';

const dc = dict.eventSettingsPage;

type Props = Readonly<{
  state: EventScheduleSettingCommonState;
  handlers: EventScheduleSettingCommonStateHandler;
}>;

export const EventScheduleSettingCommon = memoNamed<Props>(
  'EventScheduleSettingCommon',
  ({
    state: {
      title,
      notes,
      datetimeSpecification,
      datetimeRangeList,
      useAnswerDeadline,
      answerDeadline,
      answerIcons,
      useNotification,
      notificationSettingsWithEmail,
      eventScheduleValidation,
    },
    handlers: {
      setTitle,
      setNotes,
      setDatetimeSpecification,
      setDatetimeRangeList,
      toggleAnswerDeadlineSection,
      setAnswerDeadline,
      setAnswerIcons,
      toggleNotificationSection,
      setNotificationSettingsWithEmail,
    },
  }) => (
    <>
      <Section sectionTitle={dc.section1.titleAndNotesSectionTitle}>
        <NameAndNotes
          notes={notes}
          title={title}
          onNotesChange={setNotes}
          onTitleChange={setTitle}
        />
      </Section>
      <Section sectionTitle={dc.section2.selectDatesSectionTitle}>
        <SelectDatetimes
          datetimeList={datetimeRangeList}
          datetimeSpecification={datetimeSpecification}
          onDatetimeListChange={setDatetimeRangeList}
          onDatetimeSpecificationChange={setDatetimeSpecification}
        />
      </Section>
      <Section sectionTitle={dc.section3.otherSettingsTitle}>
        <EventSettings
          answerDeadline={answerDeadline}
          answerIcons={answerIcons}
          notificationSettingsWithEmail={notificationSettingsWithEmail}
          useAnswerDeadline={useAnswerDeadline}
          useNotification={useNotification}
          onAnswerDeadlineChange={setAnswerDeadline}
          onAnswerIconsChange={setAnswerIcons}
          onNotificationSettingsWithEmailChange={
            setNotificationSettingsWithEmail
          }
          onToggleAnswerDeadline={toggleAnswerDeadlineSection}
          onToggleUseNotification={toggleNotificationSection}
        />
      </Section>

      <EventSchedulePropertiesErrors
        eventScheduleValidation={eventScheduleValidation}
      />
    </>
  )
);
