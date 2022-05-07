import { descriptionFontColor, errorFontColor } from '../../../constants';
import { EditEventScheduleStore } from '../../../store';
import { Description } from '../../atoms';
import {
  BackToAnswerPageButton,
  EventScheduleDiff,
  ResetEditButton,
  SubmitEditingEventButton,
} from '../../organisms';
import { ButtonsWrapperForEventSettingsPage } from '../../styled';
import { EventScheduleSettingCommon } from './event-schedule-setting-common';

const dc = dict.eventSettingsPage;

type Props = Readonly<{
  eventScheduleSaved: EventSchedule;
}>;

export const EditEventScheduleOk = memoNamed<Props>(
  'EditEventScheduleOk',
  ({ eventScheduleSaved }) => {
    const commonState = useObservableValue(EditEventScheduleStore.commonState$);
    const hasNoChanges = useObservableValue(
      EditEventScheduleStore.hasNoChanges$
    );

    useEffect(() => {
      EditEventScheduleStore.setEventSchedule(eventScheduleSaved);
    }, [eventScheduleSaved]);

    const editButtonIsLoading = useObservableValue(
      EditEventScheduleStore.isLoading$
    );

    const diff = useObservableValue(EditEventScheduleStore.diff$);

    const hasDeletedDatetimeChanges = useObservableValue(
      EditEventScheduleStore.hasDeletedDatetimeChanges$
    );

    const {
      eventScheduleValidationOk,
      notificationSettings,
      eventScheduleValidation,
    } = commonState;

    return (
      <>
        <SubTitle>{dc.editSubTitle(eventScheduleSaved.title)}</SubTitle>

        <EventScheduleSettingCommon
          handlers={EditEventScheduleStore.commonStateHandlers}
          state={commonState}
        />

        {notificationSettings !== undefined &&
        !eventScheduleValidation.notificationEmail ? (
          <ErrorMessagesWrapper>
            <Description
              color={errorFontColor}
              text={dc.noteOnEmailInEditPage}
            />
          </ErrorMessagesWrapper>
        ) : undefined}

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
          <div data-cy={'submit-button'}>
            <SubmitEditingEventButton
              disabled={
                !eventScheduleValidationOk ||
                editButtonIsLoading ||
                hasNoChanges
              }
              loading={editButtonIsLoading}
              showConfirmationDialog={hasDeletedDatetimeChanges}
              onConfirmClick={EditEventScheduleStore.onEditEventClick}
            />
          </div>
        </ButtonsWrapperForEventSettingsPage>
        <EventScheduleDiff diff={diff} />
      </>
    );
  }
);

const SubTitle = styled('div')`
  margin: 10px 20px;
  color: ${descriptionFontColor.normal};
`;

const ErrorMessagesWrapper = styled.div`
  margin: 10px;
`;
