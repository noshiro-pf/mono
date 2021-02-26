import { Icon, Spinner } from '@blueprintjs/core';
import {
  useStream,
  useStreamEffect,
  useStreamValue,
  useValueAsStream,
} from '@noshiro/react-syncflow-hooks';
import { memoNamed } from '@noshiro/react-utils';
import {
  fromPromise,
  switchMap,
  unwrapResultOk,
  withInitialValue,
} from '@noshiro/syncflow';
import { Result } from '@noshiro/ts-utils';
import styled from 'styled-components';
import { api } from '../../../api/api';
import { descriptionFontColor } from '../../../constants/color';
import { texts } from '../../../constants/texts';
import { useEventId } from '../../../routing/use-event-id';
import { IEventSchedule } from '../../../types/record/event-schedule';
import { clog } from '../../../utils/log';
import { NotFoundPage } from '../not-found-page';
import { FetchEventScheduleError } from './error';
import { EventScheduleSettingCommon } from './event-schedule-setting-common';

const vt = texts.eventSettingsPage;

export const EditEventSchedule = memoNamed('EditEventSchedule', () => {
  const eventId = useEventId();
  const eventId$ = useValueAsStream(eventId);

  const eventScheduleResult$ = useStream<
    undefined | Result<IEventSchedule, 'not-found' | 'others'>
  >(() =>
    eventId$
      .chain(
        switchMap((eId) =>
          fromPromise(api.event.get(eId ?? '')).chain(unwrapResultOk())
        )
      )
      .chain(withInitialValue(undefined))
  );

  useStreamEffect(eventScheduleResult$, (e) => {
    if (Result.isErr(e)) {
      clog('eventScheduleResult', e);
    }
  });

  const eventScheduleResult = useStreamValue(eventScheduleResult$);

  return Result.isErr(eventScheduleResult) &&
    eventScheduleResult.value === 'not-found' ? (
    <NotFoundPage />
  ) : (
    <div>
      <TitleWrapper>
        <Title href={'../'} target='_blank' rel='noopener noreferrer'>
          <Icon icon={'timeline-events'} iconSize={28} />
          <div>{vt.title}</div>
        </Title>
      </TitleWrapper>
      {Result.isErr(eventScheduleResult) ? (
        <FetchEventScheduleError errorType={eventScheduleResult.value} />
      ) : eventId === undefined || eventScheduleResult === undefined ? (
        <Spinner />
      ) : (
        <>
          <SubTitle>
            {`${vt.editSubTitle.prefix}${eventScheduleResult.value.title}${vt.editSubTitle.suffix}`}
          </SubTitle>
          <EventScheduleSettingCommon
            mode={'edit'}
            initialValues={eventScheduleResult.value}
          />
        </>
      )}
    </div>
  );
});

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

const SubTitle = styled.div`
  margin: 10px 20px;
  color: ${descriptionFontColor.normal};
`;
