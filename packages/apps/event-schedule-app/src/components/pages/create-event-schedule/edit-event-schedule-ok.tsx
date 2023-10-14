import {
  ConfirmEmailDialogStore,
  EditEventScheduleStore,
} from '../../../store';
import { ConfirmEmailDialog } from '../../organisms';
import { EditEventScheduleEmailVerified } from './edit-event-schedule-email-verified';

type Props = Readonly<{
  eventScheduleFromDb: EventSchedule;
}>;

export const EditEventScheduleOk = memoNamed<Props>(
  'EditEventScheduleOk',
  ({ eventScheduleFromDb }) => {
    const editPageIsHidden = useObservableValue(
      ConfirmEmailDialogStore.isOpen$,
    );

    const emailVerified = useObservableValue(
      EditEventScheduleStore.emailVerified$,
    );

    return (
      <>
        {editPageIsHidden ? undefined : (
          <EditEventScheduleEmailVerified
            emailVerified={emailVerified}
            eventScheduleFromDb={eventScheduleFromDb}
          />
        )}
        <ConfirmEmailDialog isOpen={editPageIsHidden} />
      </>
    );
  },
);
