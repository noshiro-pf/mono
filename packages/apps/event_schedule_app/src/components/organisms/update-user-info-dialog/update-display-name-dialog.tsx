import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { User } from 'firebase/auth';
import styled from 'styled-components';
import { dict } from '../../../constants';
import { useUpdateDisplayNameDialogState } from '../../../hooks';
import { Label } from '../../atoms';
import { BpInput } from '../../bp';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = DeepReadonly<{
  dialogIsOpen: boolean;
  closeDialog: () => void;
  currentDisplayName: string;
  user: User;
}>;

export const UpdateDisplayNameDialog = memoNamed<Props>(
  'UpdateDisplayNameDialog',
  ({ dialogIsOpen, closeDialog, currentDisplayName, user }) => {
    const {
      state,
      enterClickHandler,
      inputDisplayNameHandler,
      displayNameFormIntent,
      enterButtonDisabled,
    } = useUpdateDisplayNameDialogState(
      currentDisplayName,
      dialogIsOpen,
      closeDialog,
      user
    );

    return (
      <UpdateUserInfoDialogTemplate
        body={
          <Content>
            <FormGroup
              helperText={state.displayName.error}
              intent={displayNameFormIntent}
              label={<Label>{dc.updateDisplayName.label}</Label>}
            >
              <BpInput
                autoFocus={true}
                disabled={state.isWaitingResponse}
                intent={displayNameFormIntent}
                type={'text'}
                value={state.displayName.inputValue}
                onValueChange={inputDisplayNameHandler}
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
        title={dc.updateDisplayName.title}
      />
    );
  }
);

const Content = styled.div`
  width: 300px;
  height: 80px;
`;
