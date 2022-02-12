import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { User } from 'firebase/auth';
import styled from 'styled-components';
import { dict } from '../../../constants';
import { useDeleteAccountPageState } from '../../../hooks';
import { DeleteAccountPage, UpdateUserInfoDialogState } from '../../../store';
import { Label } from '../../atoms';
import { BpInput } from '../../bp';
import { LockButton } from '../../molecules';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = DeepReadonly<{
  dialogIsOpen: boolean;
  user: User;
}>;

export const DeleteAccountDialog = memoNamed<Props>(
  'DeleteAccountDialog',
  ({ dialogIsOpen, user }) => {
    const {
      state,
      enterClickHandler,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
      enterButtonDisabled,
    } = useDeleteAccountPageState(user);

    return (
      <UpdateUserInfoDialogTemplate
        body={
          <Content>
            <FormGroup
              helperText={state.email.error}
              intent={emailFormIntent}
              label={<Label>{dc.deleteAccount.verifyEmail}</Label>}
            >
              <BpInput
                // suppress auto complete
                autoComplete={'new-password'}
                autoFocus={true}
                disabled={state.isWaitingResponse}
                intent={emailFormIntent}
                type={'email'}
                value={state.email.inputValue}
                onValueChange={DeleteAccountPage.inputEmailHandler}
              />
            </FormGroup>
            <FormGroup
              helperText={state.password.error}
              intent={passwordFormIntent}
              label={<Label>{dc.reauthenticate.password}</Label>}
            >
              <BpInput
                // suppress auto complete
                autoComplete={'new-password'}
                disabled={state.isWaitingResponse}
                intent={passwordFormIntent}
                rightElement={
                  <LockButton
                    disabled={state.isWaitingResponse}
                    passwordIsOpen={passwordIsOpen}
                    onLockClick={DeleteAccountPage.togglePasswordLock}
                  />
                }
                type={passwordIsOpen ? 'text' : 'password'}
                value={state.password.inputValue}
                onValueChange={DeleteAccountPage.inputPasswordHandler}
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
            intent={'danger'}
            loading={state.isWaitingResponse}
            onClick={enterClickHandler}
          >
            {dc.button.deleteAccount}
          </Button>
        }
        title={dc.deleteAccount.title}
      />
    );
  }
);

const Content = styled.div`
  width: 300px;
  height: 160px;
`;
