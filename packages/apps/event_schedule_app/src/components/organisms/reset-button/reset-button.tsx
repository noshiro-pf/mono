import { Toaster } from '@blueprintjs/core';
import { memoNamed, useBooleanState } from '@mono/react-utils';
import React, { useCallback } from 'react';
import { texts } from '../../../constants/texts';
import { BpButton } from '../../atoms/blueprint-js-wrapper/button';
import { ConfirmResetDialog } from './confirm-reset-dialog';

const vt = texts.createEventPage.resetButton;

const toast = Toaster.create({ canEscapeKeyClear: true, position: 'top' });

interface Props {
  onResetClick: () => void;
}

export const ResetButton = memoNamed<Props>(
  'ResetButton',
  ({ onResetClick }) => {
    const [isOpen, open, close] = useBooleanState(false);

    const onReset = useCallback(() => {
      onResetClick();
      close();
      toast.show({
        timeout: 2000,
        intent: 'success',
        message: vt.resetResultMessage,
        icon: 'tick',
      });
    }, [onResetClick, close]);

    return (
      <>
        <BpButton intent='none' text={vt.name} onClick={open} />
        <ConfirmResetDialog
          isOpen={isOpen}
          onCancel={close}
          onConfirm={onReset}
        />
      </>
    );
  }
);
