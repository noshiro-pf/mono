import { Button, FormGroup } from '@blueprintjs/core';
import {
  UpdatePasswordPageStore,
  UpdateUserInfoDialogStore,
} from '../../../store';
import { Label } from '../../atoms';
import { BpInput } from '../../bp';
import { LockButton } from '../../molecules';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = Readonly<{
  dialogIsOpen: boolean;
  currentEmail: string | null;
}>;

// https://yuzu441.hateblo.jp/entry/2020/11/16/190229
const hideStyle: React.CSSProperties = { display: 'none' };

export const UpdatePasswordDialog = memoNamed<Props>(
  'UpdatePasswordDialog',
  ({ dialogIsOpen, currentEmail }) => {
    const {
      formState,
      enterButtonDisabled,
      oldPasswordFormIntent,
      newPasswordFormIntent,
      oldPasswordIsOpen,
      newPasswordIsOpen,
    } = useObservableValue(UpdatePasswordPageStore.state$);

    return (
      <UpdateUserInfoDialogTemplate
        body={
          <div
            css={css`
              width: 300px;
              height: 200px;
            `}
          >
            <FormGroup
              intent={'none'}
              label={<Label>{dc.updatePassword.currentEmail}</Label>}
              style={hideStyle}
            >
              <BpInput
                autoComplete={'username'}
                disabled={false}
                intent={'none'}
                type={'email'}
                value={currentEmail ?? ''}
                onValueChange={noop}
              />
            </FormGroup>

            <FormGroup
              helperText={formState.oldPassword.error}
              intent={oldPasswordFormIntent}
              label={<Label>{dc.updatePassword.oldPassword}</Label>}
            >
              <BpInput
                autoComplete={'current-password'}
                autoFocus={true}
                disabled={formState.isWaitingResponse}
                intent={oldPasswordFormIntent}
                rightElement={
                  <LockButton
                    disabled={formState.isWaitingResponse}
                    passwordIsOpen={oldPasswordIsOpen}
                    onLockClick={UpdatePasswordPageStore.toggleOldPasswordLock}
                  />
                }
                type={oldPasswordIsOpen ? 'text' : 'password'}
                value={formState.oldPassword.inputValue}
                onValueChange={UpdatePasswordPageStore.inputOldPasswordHandler}
              />
            </FormGroup>

            <FormGroup
              helperText={formState.newPassword.password.error}
              intent={newPasswordFormIntent}
              label={<Label>{dc.updatePassword.newPassword}</Label>}
            >
              <BpInput
                autoComplete={'new-password'}
                disabled={formState.isWaitingResponse}
                intent={newPasswordFormIntent}
                type={'password'}
                value={formState.newPassword.password.inputValue}
                onValueChange={UpdatePasswordPageStore.inputNewPasswordHandler}
              />
            </FormGroup>

            <FormGroup
              helperText={formState.newPassword.passwordConfirmation.error}
              intent={newPasswordFormIntent}
              label={<Label>{dc.updatePassword.verifyNewPassword}</Label>}
            >
              <BpInput
                autoComplete={'new-password'}
                disabled={formState.isWaitingResponse}
                intent={newPasswordFormIntent}
                rightElement={
                  <LockButton
                    disabled={formState.isWaitingResponse}
                    passwordIsOpen={newPasswordIsOpen}
                    onLockClick={UpdatePasswordPageStore.toggleNewPasswordLock}
                  />
                }
                type={newPasswordIsOpen ? 'text' : 'password'}
                value={formState.newPassword.passwordConfirmation.inputValue}
                onValueChange={
                  UpdatePasswordPageStore.inputNewPasswordConfirmationHandler
                }
              />
            </FormGroup>
          </div>
        }
        closeDialog={UpdateUserInfoDialogStore.closeDialog}
        dialogIsOpen={dialogIsOpen}
        isWaitingResponse={formState.isWaitingResponse}
        submitButton={
          <Button
            disabled={enterButtonDisabled}
            intent={'primary'}
            loading={formState.isWaitingResponse}
            onClick={UpdatePasswordPageStore.enterClickHandler}
          >
            {dc.button.update}
          </Button>
        }
        title={dc.updatePassword.title}
      />
    );
  },
);
