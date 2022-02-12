import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { noop } from '@noshiro/ts-utils';
import type { User } from 'firebase/auth';
import type { CSSProperties } from 'react';
import styled from 'styled-components';
import { dict } from '../../../constants';
import { useUpdatePasswordDialogState } from '../../../hooks';
import { UpdatePasswordPage, UpdateUserInfoDialogState } from '../../../store';
import { Label } from '../../atoms';
import { BpInput } from '../../bp';
import { LockButton } from '../../molecules';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = DeepReadonly<{
  dialogIsOpen: boolean;
  user: User;
}>;

// https://yuzu441.hateblo.jp/entry/2020/11/16/190229
const hideStyle: CSSProperties = { display: 'none' };

export const UpdatePasswordDialog = memoNamed<Props>(
  'UpdatePasswordDialog',
  ({ dialogIsOpen, user }) => {
    const {
      state,
      enterClickHandler,
      oldPasswordFormIntent,
      newPasswordFormIntent,
      oldPasswordIsOpen,
      newPasswordIsOpen,
      enterButtonDisabled,
    } = useUpdatePasswordDialogState(user);

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
              helperText={state.oldPassword.error}
              intent={oldPasswordFormIntent}
              label={<Label>{dc.updatePassword.oldPassword}</Label>}
            >
              <BpInput
                autoComplete={'current-password'}
                autoFocus={true}
                disabled={state.isWaitingResponse}
                intent={oldPasswordFormIntent}
                rightElement={
                  <LockButton
                    disabled={state.isWaitingResponse}
                    passwordIsOpen={oldPasswordIsOpen}
                    onLockClick={UpdatePasswordPage.toggleOldPasswordLock}
                  />
                }
                type={oldPasswordIsOpen ? 'text' : 'password'}
                value={state.oldPassword.inputValue}
                onValueChange={UpdatePasswordPage.inputOldPasswordHandler}
              />
            </FormGroup>

            <FormGroup
              helperText={state.newPassword.password.error}
              intent={newPasswordFormIntent}
              label={<Label>{dc.updatePassword.newPassword}</Label>}
            >
              <BpInput
                autoComplete={'new-password'}
                disabled={state.isWaitingResponse}
                intent={newPasswordFormIntent}
                type={'password'}
                value={state.newPassword.password.inputValue}
                onValueChange={UpdatePasswordPage.inputNewPasswordHandler}
              />
            </FormGroup>

            <FormGroup
              helperText={state.newPassword.passwordConfirmation.error}
              intent={newPasswordFormIntent}
              label={<Label>{dc.updatePassword.verifyNewPassword}</Label>}
            >
              <BpInput
                autoComplete={'new-password'}
                disabled={state.isWaitingResponse}
                intent={newPasswordFormIntent}
                rightElement={
                  <LockButton
                    disabled={state.isWaitingResponse}
                    passwordIsOpen={newPasswordIsOpen}
                    onLockClick={UpdatePasswordPage.toggleNewPasswordLock}
                  />
                }
                type={newPasswordIsOpen ? 'text' : 'password'}
                value={state.newPassword.passwordConfirmation.inputValue}
                onValueChange={
                  UpdatePasswordPage.inputNewPasswordConfirmationHandler
                }
              />
            </FormGroup>
          </Content>
        }
        closeDialog={UpdateUserInfoDialogState.closeDialog}
        dialogIsOpen={dialogIsOpen}
        isWaitingResponse={state.isWaitingResponse}
        submitButton={
          <Button
            disabled={enterButtonDisabled}
            intent={'primary'}
            loading={state.isWaitingResponse}
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
