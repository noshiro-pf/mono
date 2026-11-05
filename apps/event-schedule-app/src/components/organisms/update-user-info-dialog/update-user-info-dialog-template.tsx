import { Button, Dialog } from 'blueprint-synstate';
import { constant, type Bindable, type Child, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { UpdateUserInfoDialogStore } from '../../../store/index.mjs';
import {
  ButtonsWrapperAlignEnd,
  maxWidthModalClass,
} from '../../styled/index.mjs';

type Props = Readonly<{
  body: Child;
  submitButton: Child;
  dialogIsOpen: Bindable<boolean>;
  title: string;
  isWaitingResponse: Bindable<boolean>;
}>;

export const UpdateUserInfoDialogTemplate = ({
  body,
  submitButton,
  dialogIsOpen,
  title,
  isWaitingResponse,
}: Props): JSX.Element => (
  <Dialog
    class={maxWidthModalClass}
    icon={'user'}
    isOpen={dialogIsOpen}
    title={constant(title)}
    onClose={UpdateUserInfoDialogStore.closeDialog}
  >
    <div class={constant('bp6-dialog-body')}>{body}</div>
    <div class={constant('bp6-dialog-footer')}>
      <ButtonsWrapperAlignEnd>
        <Button
          disabled={isWaitingResponse}
          intent={'none'}
          text={constant(dict.common.buttonText.cancel)}
          onClick={UpdateUserInfoDialogStore.closeDialog}
        />
        {submitButton}
      </ButtonsWrapperAlignEnd>
    </div>
  </Dialog>
);
