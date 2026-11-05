import { map, type InitializedObservable } from 'synstate';
import type { JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import type {
  EventScheduleSettingCommonState,
  EventScheduleSettingCommonStateHandler,
} from '../../../types/index.mjs';
import { Section } from '../../molecules/index.mjs';
import {
  EventSchedulePropertiesErrors,
  EventSettings,
  NameAndNotes,
  SelectDatetimes,
} from '../../organisms/index.mjs';

const dc = dict.eventSettingsPage;

type Props = Readonly<{
  state$: InitializedObservable<EventScheduleSettingCommonState>;
  handlers: EventScheduleSettingCommonStateHandler;
}>;

export const EventScheduleSettingCommon = ({
  state$,
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
}: Props): JSX.Element => {
  const field = <K extends keyof EventScheduleSettingCommonState>(
    key: K,
  ): InitializedObservable<EventScheduleSettingCommonState[K]> =>
    state$.pipe(map((s) => s[key]));

  return (
    <>
      <Section sectionTitle={dc.section1.titleAndNotesSectionTitle}>
        <NameAndNotes
          notes={field('notes')}
          title={field('title')}
          onNotesChange={setNotes}
          onTitleChange={setTitle}
        />
      </Section>
      <Section sectionTitle={dc.section2.selectDatesSectionTitle}>
        <SelectDatetimes
          datetimeList={field('datetimeRangeList')}
          datetimeSpecification={field('datetimeSpecification')}
          onDatetimeListChange={setDatetimeRangeList}
          onDatetimeSpecificationChange={setDatetimeSpecification}
        />
      </Section>
      <Section sectionTitle={dc.section3.otherSettingsTitle}>
        <EventSettings
          answerDeadline={field('answerDeadline')}
          answerIcons={field('answerIcons')}
          notificationSettingsWithEmail={field('notificationSettingsWithEmail')}
          useAnswerDeadline={field('useAnswerDeadline')}
          useNotification={field('useNotification')}
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
        eventScheduleValidation={field('eventScheduleValidation')}
      />
    </>
  );
};
