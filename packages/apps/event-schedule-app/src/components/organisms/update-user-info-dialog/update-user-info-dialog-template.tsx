import { Button, Classes } from '@blueprintjs/core';
import { DialogWithMaxWidth } from '../../bp';
import { ButtonsWrapperAlignEnd } from '../../styled';

type Props = Readonly<{
  body: React.ReactNode;
  submitButton: React.ReactNode;
  dialogIsOpen: boolean;
  closeDialog: () => void;
  title: string;
  isWaitingResponse: boolean;
}>;

export const UpdateUserInfoDialogTemplate = memoNamed<Props>(
  'UpdateUserInfoDialogTemplate',
  ({
    body,
    submitButton,
    dialogIsOpen,
    closeDialog,
    title,
    isWaitingResponse,
  }) => (
    <DialogWithMaxWidth
      icon={'user'}
      isOpen={dialogIsOpen}
      title={title}
      onClose={closeDialog}
    >
      <div className={Classes.DIALOG_BODY}>{body}</div>
      <div className={Classes.DIALOG_FOOTER}>
        <ButtonsWrapperAlignEnd>
          <Button
            disabled={isWaitingResponse}
            intent={'none'}
            onClick={closeDialog}
          >
            {dict.common.buttonText.cancel}
          </Button>
          {submitButton}
        </ButtonsWrapperAlignEnd>
      </div>
    </DialogWithMaxWidth>
  ),
);
