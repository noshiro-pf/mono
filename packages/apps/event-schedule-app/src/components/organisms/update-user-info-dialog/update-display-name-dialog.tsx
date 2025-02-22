import { Button, FormGroup } from '@blueprintjs/core';
import { BpInput } from '@noshiro/react-blueprintjs-utils';
import {
  UpdateDisplayNamePageStore,
  UpdateUserInfoDialogStore,
} from '../../../store';
import { Label } from '../../atoms';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = Readonly<{
  dialogIsOpen: boolean;
}>;

export const UpdateDisplayNameDialog = memoNamed<Props>(
  'UpdateDisplayNameDialog',
  ({ dialogIsOpen }) => {
    const { formState, displayNameFormIntent, enterButtonDisabled } =
      useObservableValue(UpdateDisplayNamePageStore.state);

    const body = useMemo(
      () => (
        <div
          css={css`
            width: 300px;
            height: 80px;
          `}
        >
          <FormGroup
            helperText={formState.displayName.error}
            intent={displayNameFormIntent}
            label={newDisplayNameInputLabel}
          >
            <BpInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={true}
              disabled={formState.isWaitingResponse}
              intent={displayNameFormIntent}
              type={'text'}
              value={formState.displayName.inputValue}
              onValueChange={UpdateDisplayNamePageStore.inputDisplayNameHandler}
            />
          </FormGroup>
        </div>
      ),
      [
        displayNameFormIntent,
        formState.displayName.error,
        formState.displayName.inputValue,
        formState.isWaitingResponse,
      ],
    );

    const submitButton = useMemo(
      () => (
        <Button
          disabled={enterButtonDisabled}
          intent={'primary'}
          loading={formState.isWaitingResponse}
          onClick={UpdateDisplayNamePageStore.enterClickHandler}
        >
          {dc.button.update}
        </Button>
      ),
      [enterButtonDisabled, formState.isWaitingResponse],
    );

    return (
      <UpdateUserInfoDialogTemplate
        body={body}
        closeDialog={UpdateUserInfoDialogStore.closeDialog}
        dialogIsOpen={dialogIsOpen}
        isWaitingResponse={formState.isWaitingResponse}
        submitButton={submitButton}
        title={dc.updateDisplayName.title}
      />
    );
  },
);

const newDisplayNameInputLabel = (
  <Label>{dc.updateDisplayName.newDisplayName}</Label>
);
