import { Icon } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict, initialEventSchedule, routes } from '../../../constants';
import { EventScheduleSettingCommon } from './event-schedule-setting-common';

const dc = dict.eventSettingsPage;

export const CreateEventSchedule = memoNamed('CreateEventSchedule', () => (
  <div>
    <TitleWrapper>
      <Title href={routes.createPage} rel='noopener noreferrer' target='_blank'>
        <Icon icon={'timeline-events'} iconSize={28} />
        <div>{dc.title}</div>
      </Title>
    </TitleWrapper>
    <EventScheduleSettingCommon
      initialValues={initialEventSchedule}
      mode={'create'}
    />
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
