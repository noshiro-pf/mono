import { descriptionFontColor } from '../../../constants';
import { EditEventScheduleStore } from '../../../store';
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

    useEffect(() => {
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

    const resetState = useCallback(() => {
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
          <div data-cy={'submit-button'}>
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
