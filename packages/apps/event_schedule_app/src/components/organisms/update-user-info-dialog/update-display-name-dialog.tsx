import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { User } from 'firebase/auth';
import styled from 'styled-components';
import { dict } from '../../../constants';
import { useUpdateDisplayNameDialogState } from '../../../hooks';
import {
  UpdateDisplayNamePage,
  UpdateUserInfoDialogState,
} from '../../../store';
import { Label } from '../../atoms';
import { BpInput } from '../../bp';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = DeepReadonly<{
  dialogIsOpen: boolean;
  user: User;
}>;

export const UpdateDisplayNameDialog = memoNamed<Props>(
  'UpdateDisplayNameDialog',
  ({ dialogIsOpen, user }) => {
    const {
      state,
      enterClickHandler,
      displayNameFormIntent,
      enterButtonDisabled,
    } = useUpdateDisplayNameDialogState(user);

    return (
      <UpdateUserInfoDialogTemplate
        body={
          <Content>
            <FormGroup
              helperText={state.displayName.error}
              intent={displayNameFormIntent}
              label={<Label>{dc.updateDisplayName.newDisplayName}</Label>}
            >
              <BpInput
                autoFocus={true}
                disabled={state.isWaitingResponse}
                intent={displayNameFormIntent}
                type={'text'}
                value={state.displayName.inputValue}
                onValueChange={UpdateDisplayNamePage.inputDisplayNameHandler}
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
        title={dc.updateDisplayName.title}
      />
    );
  }
);

const Content = styled.div`
  width: 300px;
  height: 80px;
`;
