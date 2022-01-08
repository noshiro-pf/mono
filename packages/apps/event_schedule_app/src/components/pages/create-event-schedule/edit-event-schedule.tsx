import { Icon, Spinner } from '@blueprintjs/core';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { Result } from '@noshiro/ts-utils';
import styled from 'styled-components';
import { descriptionFontColor, dict, routes } from '../../../constants';
import { eventScheduleResult$, router } from '../../../store';
import { ConfirmEmailDialog } from '../../organisms';
import { NotFoundPage } from '../not-found-page';
import { FetchEventScheduleError } from './error';
import { EventScheduleSettingCommon } from './event-schedule-setting-common';

const vt = dict.eventSettingsPage;

export const EditEventSchedule = memoNamed('EditEventSchedule', () => {
  const eventId = useStreamValue(router.eventId$);
  const eventScheduleResult = useStreamValue(eventScheduleResult$);

  const [editPageIsVisible, showEditPage] = useBooleanState(false);

  const editPageIsHidden: boolean =
    Result.isErr(eventScheduleResult) ||
    (eventScheduleResult?.value.notificationSettings.email !== '' &&
      !editPageIsVisible);

  return Result.isErr(eventScheduleResult) &&
    eventScheduleResult.value === 'not-found' ? (
    <NotFoundPage />
  ) : (
    <div>
      <TitleWrapper>
        <Title
          href={routes.createPage}
          rel='noopener noreferrer'
          target='_blank'
        >
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
          {editPageIsHidden ? undefined : (
            <>
              <SubTitle>
                {`${vt.editSubTitle.prefix}${eventScheduleResult.value.title}${vt.editSubTitle.suffix}`}
              </SubTitle>
              <EventScheduleSettingCommon
                initialValues={eventScheduleResult.value}
                mode={'edit'}
              />
            </>
          )}

          <ConfirmEmailDialog
            back={router.back}
            emailAnswer={eventScheduleResult.value.notificationSettings.email}
            isOpen={editPageIsHidden}
            onSuccess={showEditPage}
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
