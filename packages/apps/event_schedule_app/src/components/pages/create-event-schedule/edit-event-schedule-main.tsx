import { descriptionFontColor } from '../../../constants';
import { EditEventScheduleStore, router } from '../../../store';
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
    const commonState = useObservableValue(EditEventScheduleStore.commonState$);

    const editButtonIsLoading = useObservableValue(
      EditEventScheduleStore.isLoading$
    );

    const diff = useObservableValue(EditEventScheduleStore.diff$);

    const hasDeletedDatetimeChanges = useObservableValue(
      EditEventScheduleStore.hasDeletedDatetimeChanges$
    );

    const { hasNoChanges, eventScheduleValidationOk: editButtonIsEnabled } =
      commonState;

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
                onConfirmClick={EditEventScheduleStore.resetAllState}
              />
              <SubmitEditingEventButton
                disabled={
                  !editButtonIsEnabled || editButtonIsLoading || hasNoChanges
                }
                loading={editButtonIsLoading}
                showConfirmationDialog={hasDeletedDatetimeChanges}
                onConfirmClick={EditEventScheduleStore.onEditEventClick}
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