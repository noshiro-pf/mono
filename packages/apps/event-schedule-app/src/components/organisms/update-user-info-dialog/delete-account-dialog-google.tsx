import { Button, FormGroup } from '@blueprintjs/core';
import { BpInput } from '@noshiro/react-blueprintjs-utils';
import {
  DeleteAccountCreatedWithGoogleStore,
  UpdateUserInfoDialogStore,
} from '../../../store';
import { Label } from '../../atoms';
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
    } = useObservableValue(DeleteAccountCreatedWithGoogleStore.state);

    const body = useMemo(
      () => (
        <div
          css={css`
            width: 300px;
            height: 100px;
          `}
        >
          <FormGroup
            helperText={formState.error}
            intent={emailFormIntent}
            label={verifyEmailInputLabel}
          >
            <BpInput
              // suppress auto complete
              autoComplete={'new-password'}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={true}
              disabled={isWaitingResponse}
              intent={emailFormIntent}
              type={'email'}
              value={formState.inputValue}
              onValueChange={
                DeleteAccountCreatedWithGoogleStore.inputEmailHandler
              }
            />
          </FormGroup>
        </div>
      ),
      [
        emailFormIntent,
        formState.error,
        formState.inputValue,
        isWaitingResponse,
      ],
    );

    const submitButton = useMemo(
      () => (
        <Button
          disabled={enterButtonDisabled}
          intent={'danger'}
          loading={isWaitingResponse}
          onClick={DeleteAccountCreatedWithGoogleStore.enterClickHandler}
        >
          {dc.button.deleteAccount}
        </Button>
      ),
      [enterButtonDisabled, isWaitingResponse],
    );

    return (
      <UpdateUserInfoDialogTemplate
        body={body}
        closeDialog={UpdateUserInfoDialogStore.closeDialog}
        dialogIsOpen={dialogIsOpen}
        isWaitingResponse={isWaitingResponse}
        submitButton={submitButton}
        title={dc.deleteAccount.title}
      />
    );
  },
);

const verifyEmailInputLabel = <Label>{dc.deleteAccount.verifyEmail}</Label>;
