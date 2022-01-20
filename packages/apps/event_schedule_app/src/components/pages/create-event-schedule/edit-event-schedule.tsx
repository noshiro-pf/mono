import { Spinner } from '@blueprintjs/core';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { Result } from '@noshiro/ts-utils';
import styled from 'styled-components';
import { descriptionFontColor, dict } from '../../../constants';
import { eventScheduleResult$, router } from '../../../store';
import { ConfirmEmailDialog, Header } from '../../organisms';
import { NotFoundPage } from '../not-found-page';
import { FetchEventScheduleError } from './error';
import { EventScheduleSettingCommon } from './event-schedule-setting-common';

const dc = dict.eventSettingsPage;

export const EditEventSchedule = memoNamed('EditEventSchedule', () => {
  const eventId = useStreamValue(router.eventId$);
  const eventScheduleResult = useStreamValue(eventScheduleResult$);

  const [editPageIsVisible, showEditPage] = useBooleanState(false);

  const editPageIsHidden: boolean =
    Result.isErr(eventScheduleResult) ||
    (eventScheduleResult?.value.notificationSettings.email !== '' &&
      !editPageIsVisible);

  return Result.isErr(eventScheduleResult) &&
    eventScheduleResult.value.type === 'not-found' ? (
    <NotFoundPage />
  ) : (
    <div>
      <Header showCreateNewButton={false} title={dc.title} />
      {Result.isErr(eventScheduleResult) ? (
        <FetchEventScheduleError errorType={eventScheduleResult.value.type} />
      ) : eventId === undefined || eventScheduleResult === undefined ? (
        <Spinner />
      ) : (
        <>
          {editPageIsHidden ? undefined : (
            <>
              <SubTitle>
                {`${dc.editSubTitle(eventScheduleResult.value.title)}`}
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

const SubTitle = styled.div`
  margin: 10px 20px;
  color: ${descriptionFontColor.normal};
`;
