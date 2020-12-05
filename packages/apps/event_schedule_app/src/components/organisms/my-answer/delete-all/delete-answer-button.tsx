import { memoNamed, useBooleanState } from '@mono/react-utils';
import React, { useCallback } from 'react';
import { texts } from '../../../../constants/texts';
import { BpButton } from '../../../atoms/blueprint-js-wrapper/button';
import { ConfirmDeleteAnswerDialog } from './confirm-delete-answer-dialog';

interface Props {
  onConfirmDeleteAnswer: () => void;
  loading: boolean;
  disabled: boolean;
}

export const DeleteAnswerButton = memoNamed<Props>(
  'DeleteAnswerButton',
  ({ onConfirmDeleteAnswer, loading, disabled }) => {
    const [isOpen, open, close] = useBooleanState(false);

    const onConfirm = useCallback(() => {
      onConfirmDeleteAnswer();
      close();
    }, [onConfirmDeleteAnswer, close]);

    return (
      <>
        <BpButton
          intent='danger'
          icon={'trash'}
          onClick={open}
          text={texts.buttonText.delete}
          loading={loading}
          disabled={disabled}
          nowrap={true}
        />
        <ConfirmDeleteAnswerDialog
          isOpen={isOpen}
          onCancel={close}
          onConfirm={onConfirm}
        />
      </>
    );
  }
);
