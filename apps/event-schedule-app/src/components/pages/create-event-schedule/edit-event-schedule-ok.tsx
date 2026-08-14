import { memoNamed } from 'react-utils';
import { useObservableValue } from 'synstate-react-hooks';
import {
  ConfirmEmailDialogStore,
  EditEventScheduleStore,
} from '../../../store/index.mjs';
import { ConfirmEmailDialog } from '../../organisms/index.mjs';
import { EditEventScheduleEmailVerified } from './edit-event-schedule-email-verified.js';

type Props = Readonly<{ eventScheduleFromDb: EventSchedule }>;

export const EditEventScheduleOk = memoNamed<Props>(
  'EditEventScheduleOk',
  ({ eventScheduleFromDb }) => {
    const editPageIsHidden = useObservableValue(
      ConfirmEmailDialogStore.isOpen$,
    );

    const emailVerified = EditEventScheduleStore.useEmailVerified();

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
