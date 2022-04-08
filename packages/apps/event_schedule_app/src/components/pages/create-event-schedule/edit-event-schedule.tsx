import { Spinner } from '@blueprintjs/core';
import { memoNamed, useBoolState } from '@noshiro/react-utils';
import { useObservableValue } from '@noshiro/syncflow-react-hooks';
import styled from 'styled-components';
import { descriptionFontColor, dict } from '../../../constants';
import { eventScheduleResult$, router, useUser } from '../../../store';
import { ConfirmEmailDialog, Header } from '../../organisms';
import { NotFoundPage } from '../not-found-page';
import { FetchEventScheduleError } from './error';
import { EventScheduleSettingCommon } from './event-schedule-setting-common';

const dc = dict.eventSettingsPage;

export const EditEventSchedule = memoNamed('EditEventSchedule', () => {
  const eventId = useObservableValue(router.eventId$);
  const eventScheduleResult = useObservableValue(eventScheduleResult$);

  const {
    state: emailConfirmationHasPassed,
    setTrue: makeItPassTheEmailConfirmation,
  } = useBoolState(false);

  const user = useUser();

  const editPageIsHidden: boolean =
    Result.isOk(eventScheduleResult) &&
    eventScheduleResult.value.notificationSettings !== 'none' &&
    !emailConfirmationHasPassed &&
    eventScheduleResult.value.notificationSettings.email !== user?.email;

  return Result.isErr(eventScheduleResult) &&
    eventScheduleResult.value.type === 'not-found' ? (
    <NotFoundPage />
  ) : (
    <div>
      <Header title={dc.title} />
      {Result.isErr(eventScheduleResult) ? (
        <FetchEventScheduleError errorType={eventScheduleResult.value.type} />
      ) : eventId === undefined || eventScheduleResult === undefined ? (
        <Spinner />
      ) : (
        <>
          <SubTitle>
            {dc.editSubTitle(eventScheduleResult.value.title)}
          </SubTitle>

          {eventScheduleResult.value.notificationSettings ===
          'none' ? undefined : (
            <ConfirmEmailDialog
              back={router.back}
              emailAnswer={eventScheduleResult.value.notificationSettings.email}
              isOpen={editPageIsHidden}
              onSuccess={makeItPassTheEmailConfirmation}
            />
          )}

          {editPageIsHidden ? undefined : (
            <EventScheduleSettingCommon
              initialValues={eventScheduleResult.value}
              mode={'edit'}
            />
          )}
        </>
      )}
    </div>
  );
});

const SubTitle = styled.div`
  margin: 10px 20px;
  color: ${descriptionFontColor.normal};
`;
