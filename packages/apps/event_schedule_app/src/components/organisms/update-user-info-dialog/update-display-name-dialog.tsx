import { Button, FormGroup } from '@blueprintjs/core';
import {
  UpdateDisplayNamePage,
  UpdateUserInfoDialogState,
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
      useObservableValue(UpdateDisplayNamePage.state$);

    return (
      <UpdateUserInfoDialogTemplate
        body={
          <Content>
            <FormGroup
              helperText={formState.displayName.error}
              intent={displayNameFormIntent}
              label={<Label>{dc.updateDisplayName.newDisplayName}</Label>}
            >
              <BpInput
                autoFocus={true}
                disabled={formState.isWaitingResponse}
                intent={displayNameFormIntent}
                type={'text'}
                value={formState.displayName.inputValue}
                onValueChange={UpdateDisplayNamePage.inputDisplayNameHandler}
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
            intent={'primary'}
            loading={formState.isWaitingResponse}
            onClick={UpdateDisplayNamePage.enterClickHandler}
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
