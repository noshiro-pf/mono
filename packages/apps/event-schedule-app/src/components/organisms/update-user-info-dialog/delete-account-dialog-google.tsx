import { Button, FormGroup } from '@blueprintjs/core';
import {
  DeleteAccountCreatedWithGoogle,
  UpdateUserInfoDialogState,
} from '../../../store';
import { Label } from '../../atoms';
import { BpInput } from '../../bp';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = Readonly<{
  dialogIsOpen: boolean;
}>;

export const DeleteAccountCreatedWithGoogleDialog = memoNamed<Props>(
  'DeleteAccountCreatedWithGoogleDialog',
  ({ dialogIsOpen }) => {
    const {
      formState,
      enterButtonDisabled,
      isWaitingResponse,
      emailFormIntent,
    } = useObservableValue(DeleteAccountCreatedWithGoogle.state$);

    return (
      <UpdateUserInfoDialogTemplate
        body={
          <Content>
            <FormGroup
              helperText={formState.error}
              intent={emailFormIntent}
              label={<Label>{dc.deleteAccount.verifyEmail}</Label>}
            >
              <BpInput
                // suppress auto complete
                autoComplete={'new-password'}
                autoFocus={true}
                disabled={isWaitingResponse}
                intent={emailFormIntent}
                type={'email'}
                value={formState.inputValue}
                onValueChange={DeleteAccountCreatedWithGoogle.inputEmailHandler}
              />
            </FormGroup>
          </Content>
        }
        closeDialog={UpdateUserInfoDialogState.closeDialog}
        dialogIsOpen={dialogIsOpen}
        isWaitingResponse={isWaitingResponse}
        submitButton={
          <Button
            disabled={enterButtonDisabled}
            intent={'danger'}
            loading={isWaitingResponse}
            onClick={DeleteAccountCreatedWithGoogle.enterClickHandler}
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
  height: 100px;
`;