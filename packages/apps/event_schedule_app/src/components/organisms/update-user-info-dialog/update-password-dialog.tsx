import { Button, FormGroup } from '@blueprintjs/core';
import { UpdatePasswordPage, UpdateUserInfoDialogState } from '../../../store';
import { Label } from '../../atoms';
import { BpInput } from '../../bp';
import { LockButton } from '../../molecules';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = Readonly<{
  dialogIsOpen: boolean;
  user: FireAuthUser;
}>;

// https://yuzu441.hateblo.jp/entry/2020/11/16/190229
const hideStyle: CSSProperties = { display: 'none' };

export const UpdatePasswordDialog = memoNamed<Props>(
  'UpdatePasswordDialog',
  ({ dialogIsOpen, user }) => {
    const {
      formState,
      enterButtonDisabled,
      oldPasswordFormIntent,
      newPasswordFormIntent,
      oldPasswordIsOpen,
      newPasswordIsOpen,
    } = useObservableValue(UpdatePasswordPage.state$);

    const enterClickHandler = useCallback(() => {
      if (enterButtonDisabled) return;

      UpdatePasswordPage.submit(user).catch(console.error);
    }, [enterButtonDisabled, user]);

    return (
      <UpdateUserInfoDialogTemplate
        body={
          <Content>
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
                value={user.email ?? ''}
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
                    onLockClick={UpdatePasswordPage.toggleOldPasswordLock}
                  />
                }
                type={oldPasswordIsOpen ? 'text' : 'password'}
                value={formState.oldPassword.inputValue}
                onValueChange={UpdatePasswordPage.inputOldPasswordHandler}
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
                onValueChange={UpdatePasswordPage.inputNewPasswordHandler}
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
                    onLockClick={UpdatePasswordPage.toggleNewPasswordLock}
                  />
                }
                type={newPasswordIsOpen ? 'text' : 'password'}
                value={formState.newPassword.passwordConfirmation.inputValue}
                onValueChange={
                  UpdatePasswordPage.inputNewPasswordConfirmationHandler
                }
              />
            </FormGroup>
          </Content>
        }
        closeDialog={UpdateUserInfoDialogState.closeDialog}
        dialogIsOpen={dialogIsOpen}
        isWaitingResponse={formState.isWaitingResponse}
        submitButton={
          <Button
            disabled={enterButtonDisabled}
            intent={'primary'}
            loading={formState.isWaitingResponse}
            onClick={enterClickHandler}
          >
            {dc.button.update}
          </Button>
        }
        title={dc.updatePassword.title}
      />
    );
  }
);

const Content = styled.div`
  width: 300px;
  height: 200px;
`;
