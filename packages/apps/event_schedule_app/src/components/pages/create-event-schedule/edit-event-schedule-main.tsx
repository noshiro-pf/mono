import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { descriptionFontColor, dict } from '../../../constants';
import { useEditEventScheduleHooks } from '../../../hooks';
import { router } from '../../../store';
import {
  BackToAnswerPageButton,
  ConfirmEmailDialog,
  EventScheduleDiff,
  ResetEditButton,
  SubmitEditingEventButton,
} from '../../organisms';
import { ButtonsWrapperForEventSettingsPage } from '../../styled';
import { EventScheduleSettingCommon } from './event-schedule-setting-common';

const dc = dict.eventSettingsPage;

type Props = Readonly<{
  eventSchedule: EventSchedule;
  editPageIsHidden: boolean;
  makeItPassTheEmailConfirmation: () => void;
}>;

export const EditEventScheduleOk = memoNamed<Props>(
  'EditEventScheduleOk',
  ({ eventSchedule, editPageIsHidden, makeItPassTheEmailConfirmation }) => {
    const {
      commonState,
      commonStateHandlers,
      resetAllState,
      editButtonIsEnabled,
      editButtonIsLoading,
      diff,
      hasDeletedDatetimeChanges,
      onEditEventClick,
      onBackToAnswerPageClick,
    } = useEditEventScheduleHooks(eventSchedule);

    const { hasNoChanges } = commonState;

    return (
      <>
        <SubTitle>{dc.editSubTitle(eventSchedule.title)}</SubTitle>

        {eventSchedule.notificationSettings === 'none' ? undefined : (
          <ConfirmEmailDialog
            back={router.back}
            emailAnswer={eventSchedule.notificationSettings.email}
            isOpen={editPageIsHidden}
            onSuccess={makeItPassTheEmailConfirmation}
          />
        )}

        {editPageIsHidden ? undefined : (
          <>
            <EventScheduleSettingCommon
              handlers={commonStateHandlers}
              state={commonState}
            />
            <ButtonsWrapperForEventSettingsPage>
              <BackToAnswerPageButton
                disabled={editButtonIsLoading}
                hasNoChanges={hasNoChanges}
                onConfirmClick={onBackToAnswerPageClick}
              />
              <ResetEditButton
                disabled={editButtonIsLoading || hasNoChanges}
                onConfirmClick={resetAllState}
              />
              <SubmitEditingEventButton
                disabled={
                  !editButtonIsEnabled || editButtonIsLoading || hasNoChanges
                }
                loading={editButtonIsLoading}
                showConfirmationDialog={hasDeletedDatetimeChanges}
                onConfirmClick={onEditEventClick}
              />
            </ButtonsWrapperForEventSettingsPage>
            <EventScheduleDiff diff={diff} />
          </>
        )}
      </>
    );
  }
);

const SubTitle = styled('div')`
  margin: 10px 20px;
  color: ${descriptionFontColor.normal};
`;
