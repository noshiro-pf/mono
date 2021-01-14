import { Icon } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import { createIEventSchedule } from '../../../types/record/event-schedule';
import {
  defaultAnswerDeadline,
  defaultAnswerSymbolList,
  defaultDatetimeRangeList,
  defaultDatetimeSpecification,
  defaultNotificationSettings,
} from './default-values';
import { EventScheduleSettingCommon } from './event-schedule-setting-common';

const vt = texts.eventSettingsPage;

const initialValues = createIEventSchedule({
  title: '',
  notes: '',
  datetimeSpecification: defaultDatetimeSpecification,
  datetimeRangeList: defaultDatetimeRangeList,
  useAnswerDeadline: false,
  answerDeadline: defaultAnswerDeadline,
  customizeSymbolSettings: false,
  answerSymbolList: defaultAnswerSymbolList,
  useNotification: false,
  notificationSettings: defaultNotificationSettings,
  timezoneOffsetMinutes: new Date().getTimezoneOffset(),
});

export const CreateEventSchedule = memoNamed('CreateEventSchedule', () => (
  <div>
    <TitleWrapper>
      <Title href={'../'} target='_blank' rel='noopener noreferrer'>
        <Icon icon={'timeline-events'} iconSize={28} />
        <div>{vt.title}</div>
      </Title>
    </TitleWrapper>
    <EventScheduleSettingCommon mode={'create'} initialValues={initialValues} />
  </div>
));

const TitleWrapper = styled.div`
  display: flex;
`;

const Title = styled.a`
  display: flex;
  align-items: center;
  & > * {
    margin-right: 10px;
  }

  margin: 20px;

  /* h1 style */
  font-size: 2em;
  font-weight: bold;
  color: black !important;
  text-decoration: none !important;
`;
