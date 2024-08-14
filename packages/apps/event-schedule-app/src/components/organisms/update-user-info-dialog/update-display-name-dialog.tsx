import { Button, FormGroup } from '@blueprintjs/core';
import {
  UpdateDisplayNamePageStore,
  UpdateUserInfoDialogStore,
} from '../../../store';
import { Label } from '../../atoms';
import { BpInput } from '../../bp';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = Readonly<{
  dialogIsOpen: boolean;
}>;

export const UpdateDisplayNameDialog = memoNamed<Props>(
  'UpdateDisplayNameDialog',
  ({ dialogIsOpen }) => {
    const { formState, displayNameFormIntent, enterButtonDisabled } =
      useObservableValue(UpdateDisplayNamePageStore.state$);

    return (
      <UpdateUserInfoDialogTemplate
        body={
          <div
            css={css`
              width: 300px;
              height: 80px;
            `}
          >
            <FormGroup
              helperText={formState.displayName.error}
              intent={displayNameFormIntent}
              label={<Label>{dc.updateDisplayName.newDisplayName}</Label>}
            >
              <BpInput
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                disabled={formState.isWaitingResponse}
                intent={displayNameFormIntent}
                type={'text'}
                value={formState.displayName.inputValue}
                onValueChange={
                  UpdateDisplayNamePageStore.inputDisplayNameHandler
                }
              />
            </FormGroup>
          </div>
        }
        closeDialog={UpdateUserInfoDialogStore.closeDialog}
        dialogIsOpen={dialogIsOpen}
        isWaitingResponse={formState.isWaitingResponse}
        submitButton={
          <Button
            disabled={enterButtonDisabled}
            intent={'primary'}
            loading={formState.isWaitingResponse}
            onClick={UpdateDisplayNamePageStore.enterClickHandler}
          >
            {dc.button.update}
          </Button>
        }
        title={dc.updateDisplayName.title}
      />
    );
  },
);
