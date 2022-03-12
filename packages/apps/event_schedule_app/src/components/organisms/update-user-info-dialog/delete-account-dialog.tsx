import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useObservableValue } from '@noshiro/syncflow-react-hooks';
import type { User } from 'firebase/auth';
import { useCallback } from 'react';
import styled from 'styled-components';
import { dict } from '../../../constants';
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
      formState,
      enterButtonDisabled,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    } = useObservableValue(DeleteAccountPage.state$);

    const enterClickHandler = useCallback(async () => {
      if (enterButtonDisabled) return;

      await DeleteAccountPage.submit(user);
    }, [enterButtonDisabled, user]);

    return (
      <UpdateUserInfoDialogTemplate
        body={
          <Content>
            <FormGroup
              helperText={formState.email.error}
              intent={emailFormIntent}
              label={<Label>{dc.deleteAccount.verifyEmail}</Label>}
            >
              <BpInput
                // suppress auto complete
                autoComplete={'new-password'}
                autoFocus={true}
                disabled={formState.isWaitingResponse}
                intent={emailFormIntent}
                type={'email'}
                value={formState.email.inputValue}
                onValueChange={DeleteAccountPage.inputEmailHandler}
              />
            </FormGroup>
            <FormGroup
              helperText={formState.password.error}
              intent={passwordFormIntent}
              label={<Label>{dc.reauthenticate.password}</Label>}
            >
              <BpInput
                // suppress auto complete
                autoComplete={'new-password'}
                disabled={formState.isWaitingResponse}
                intent={passwordFormIntent}
                rightElement={
                  <LockButton
                    disabled={formState.isWaitingResponse}
                    passwordIsOpen={passwordIsOpen}
                    onLockClick={DeleteAccountPage.togglePasswordLock}
                  />
                }
                type={passwordIsOpen ? 'text' : 'password'}
                value={formState.password.inputValue}
                onValueChange={DeleteAccountPage.inputPasswordHandler}
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
            intent={'danger'}
            loading={formState.isWaitingResponse}
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
