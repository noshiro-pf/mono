import styled from '@emotion/styled';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { useObservableValue } from 'synstate-react-hooks';
import { descriptionFontColor } from '../../../constants/index.mjs';
import { EditEventScheduleStore } from '../../../store/index.mjs';
import {
  BackToAnswerPageButton,
  EventScheduleDiff,
  ResetEditButton,
  SubmitEditingEventButton,
} from '../../organisms/index.mjs';
import { ButtonsWrapperForEventSettingsPage } from '../../styled/index.mjs';
import { EventScheduleSettingCommon } from './event-schedule-setting-common.js';

const dc = dict.eventSettingsPage;

type Props = Readonly<{
  eventScheduleFromDb: EventSchedule;
  emailVerified: string | undefined;
}>;

export const EditEventScheduleEmailVerified = memoNamed<Props>(
  'EditEventScheduleEmailVerified',
  ({ eventScheduleFromDb, emailVerified }) => {
    const commonState = useObservableValue(EditEventScheduleStore.commonState$);

    const hasNoChanges = useObservableValue(
      EditEventScheduleStore.hasNoChanges$,
    );

    React.useEffect(() => {
      EditEventScheduleStore.setEventSchedule(
        eventScheduleFromDb,
        emailVerified,
      );
    }, [eventScheduleFromDb, emailVerified]);

    const editButtonIsLoading = EditEventScheduleStore.useIsLoading();

    const diff = useObservableValue(EditEventScheduleStore.diff$);

    const hasDeletedDatetimeChanges = useObservableValue(
      EditEventScheduleStore.hasDeletedDatetimeChanges$,
    );

    const { eventScheduleValidationOk } = commonState;

    const resetState = React.useCallback(() => {
      EditEventScheduleStore.setEventSchedule(
        eventScheduleFromDb,
        emailVerified,
      );
    }, [eventScheduleFromDb, emailVerified]);

    return (
      <>
        <SubTitle>{dc.editSubTitle(eventScheduleFromDb.title)}</SubTitle>

        <EventScheduleSettingCommon
          handlers={EditEventScheduleStore.commonStateHandlers}
          state={commonState}
        />

        <ButtonsWrapperForEventSettingsPage>
          <BackToAnswerPageButton
            disabled={editButtonIsLoading}
            hasNoChanges={hasNoChanges}
            onConfirmClick={EditEventScheduleStore.onBackToAnswerPage}
          />
          <ResetEditButton
            disabled={editButtonIsLoading || hasNoChanges}
            onConfirmClick={resetState}
          />
          <div data-e2e={'submit-button'}>
            <SubmitEditingEventButton
              disabled={
                !eventScheduleValidationOk ||
                editButtonIsLoading ||
                hasNoChanges
              }
              loading={editButtonIsLoading}
              showConfirmationDialog={hasDeletedDatetimeChanges}
            />
          </div>
        </ButtonsWrapperForEventSettingsPage>
        <EventScheduleDiff diff={diff} />
      </>
    );
  },
);

const SubTitle = styled('div')`
  margin: 10px 20px;
  color: ${descriptionFontColor.normal};
`;
