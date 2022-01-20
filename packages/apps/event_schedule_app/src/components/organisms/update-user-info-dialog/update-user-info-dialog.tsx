import { memoNamed } from '@noshiro/react-utils';
import { match } from '@noshiro/ts-utils';
import type { User } from 'firebase/auth';
import { useMemo } from 'react';
import { DeleteAccountDialog } from './delete-account-dialog';
import { UpdateDisplayNameDialog } from './update-display-name-dialog';
import { UpdateEmailDialog } from './update-email-dialog';
import { UpdatePasswordDialog } from './update-password-dialog';

type Props = Readonly<{
  isOpen: boolean;
  closeDialog: () => void;
  mode:
    | 'deleteAccount'
    | 'updateDisplayName'
    | 'updateEmail'
    | 'updatePassword'
    | undefined;
  user: DeepReadonly<User>;
}>;

export const UpdateUserInfoDialog = memoNamed<Props>(
  'UpdateUserInfoDialog',
  ({ isOpen, closeDialog, mode, user }) => {
    if (mode === undefined) return <div />;

    const current = useMemo<
      DeepReadonly<{
        displayName: string;
        email: string;
      }>
    >(
      () => ({
        displayName: user.displayName ?? '',
        email: user.email ?? '',
      }),
      [user]
    );

    return match(mode, {
      updateDisplayName: (
        <UpdateDisplayNameDialog
          closeDialog={closeDialog}
          currentDisplayName={current.displayName}
          dialogIsOpen={isOpen}
          user={user}
        />
      ),
      updateEmail: (
        <UpdateEmailDialog
          closeDialog={closeDialog}
          currentEmail={current.email}
          dialogIsOpen={isOpen}
          user={user}
        />
      ),
      updatePassword: (
        <UpdatePasswordDialog
          closeDialog={closeDialog}
          currentEmail={current.email}
          dialogIsOpen={isOpen}
          user={user}
        />
      ),
      deleteAccount: (
        <DeleteAccountDialog
          closeDialog={closeDialog}
          currentEmail={current.email}
          dialogIsOpen={isOpen}
          user={user}
        />
      ),
    });
  }
);
