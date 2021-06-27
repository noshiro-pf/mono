import { Icon } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import {
  initialAnswerDeadline,
  initialAnswerSymbolList,
  initialDatetimeRangeList,
  initialDatetimeSpecification,
  initialNotificationSettings,
  texts,
} from '../../../constants';
import { EventScheduleSettingCommon } from './event-schedule-setting-common';

const vt = texts.eventSettingsPage;

const initialValues = {
  title: '',
  notes: '',
  datetimeSpecification: initialDatetimeSpecification,
  datetimeRangeList: initialDatetimeRangeList,
  useAnswerDeadline: false,
  answerDeadline: initialAnswerDeadline,
  customizeSymbolSettings: false,
  answerSymbolList: initialAnswerSymbolList,
  useNotification: false,
  notificationSettings: initialNotificationSettings,
  timezoneOffsetMinutes: new Date().getTimezoneOffset(),
};

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
