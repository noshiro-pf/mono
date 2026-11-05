import { If, mapBindable, type JSX } from 'synstate-dom';
import { ConfirmEmailDialogStore } from '../../../store/index.mjs';
import { ConfirmEmailDialog } from '../../organisms/index.mjs';
import { EditEventScheduleEmailVerified } from './edit-event-schedule-email-verified.js';

/** The edit form, hidden while the author's email is being asked for. */
export const EditEventScheduleOk = (): JSX.Element => (
  <>
    <If
      cond={mapBindable(ConfirmEmailDialogStore.isOpen$, (open) => !open)}
      then={<EditEventScheduleEmailVerified />}
    />
    <ConfirmEmailDialog isOpen={ConfirmEmailDialogStore.isOpen$} />
  </>
);
