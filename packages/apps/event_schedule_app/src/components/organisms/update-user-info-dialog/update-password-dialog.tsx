import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { noop } from '@noshiro/ts-utils';
import type { User } from 'firebase/auth';
import styled from 'styled-components';
import { dict } from '../../../constants';
import { useUpdatePasswordDialogState } from '../../../hooks';
import { Label } from '../../atoms';
import { BpInput } from '../../bp';
import { LockButton } from '../../molecules';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = DeepReadonly<{
  dialogIsOpen: boolean;
  closeDialog: () => void;
  currentEmail: string;
  user: User;
}>;

export const UpdatePasswordDialog = memoNamed<Props>(
  'UpdatePasswordDialog',
  ({ dialogIsOpen, closeDialog, currentEmail, user }) => {
    const {
      state,
      enterClickHandler,
      inputOldPasswordHandler,
      inputNewPasswordHandler,
      oldPasswordFormIntent,
      newPasswordFormIntent,
      oldPasswordIsOpen,
      newPasswordIsOpen,
      toggleOldPasswordLock,
      toggleNewPasswordLock,
      enterButtonDisabled,
    } = useUpdatePasswordDialogState(currentEmail, closeDialog, user);

    return (
      <UpdateUserInfoDialogTemplate
        body={
          <Content>
            <FormGroup
              intent={'none'}
              label={<Label>{dc.updatePassword.currentEmail}</Label>}
            >
              <BpInput
                autoComplete={'email'}
                disabled={false}
                intent={'none'}
                type={'email'}
                value={currentEmail}
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
                disabled={state.isWaitingResponse}
                intent={oldPasswordFormIntent}
                rightElement={
                  <LockButton
                    disabled={state.isWaitingResponse}
                    passwordIsOpen={oldPasswordIsOpen}
                    onLockClick={toggleOldPasswordLock}
                  />
                }
                type={oldPasswordIsOpen ? 'text' : 'password'}
                value={state.oldPassword.inputValue}
                onValueChange={inputOldPasswordHandler}
              />
            </FormGroup>
            <FormGroup
              helperText={state.newPassword.error}
              intent={newPasswordFormIntent}
              label={<Label>{dc.updatePassword.newPassword}</Label>}
            >
              <BpInput
                autoComplete={'current-password'}
                disabled={state.isWaitingResponse}
                intent={newPasswordFormIntent}
                rightElement={
                  <LockButton
                    disabled={state.isWaitingResponse}
                    passwordIsOpen={newPasswordIsOpen}
                    onLockClick={toggleNewPasswordLock}
                  />
                }
                type={newPasswordIsOpen ? 'text' : 'password'}
                value={state.newPassword.inputValue}
                onValueChange={inputNewPasswordHandler}
              />
            </FormGroup>
          </Content>
        }
        closeDialog={closeDialog}
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
