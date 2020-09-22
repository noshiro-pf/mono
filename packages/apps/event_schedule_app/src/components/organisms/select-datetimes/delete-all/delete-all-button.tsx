import { Button, Toaster } from '@blueprintjs/core';
import { memoNamed, useBooleanState } from '@mono/react-utils';
import React, { useCallback } from 'react';
import { texts } from '../../../../constants/texts';
import { ConfirmDeleteAllDialog } from './confirm-delete-all-dates-dialog';

const vt = texts.createEventPage.section2;

const toast = Toaster.create({ canEscapeKeyClear: true, position: 'top' });

export const DeleteAllButton = memoNamed<{
  onConfirmDeleteAll: () => void;
}>('DeleteAllButton', ({ onConfirmDeleteAll }) => {
  const [isOpen, open, close] = useBooleanState(false);

  const onConfirm = useCallback(() => {
    onConfirmDeleteAll();
    close();
    toast.show({
      timeout: 2000,
      intent: 'success',
      message: vt.removeAllResultMessage,
      icon: 'tick',
    });
  }, [onConfirmDeleteAll, close]);

  return (
    <>
      <Button
        intent='danger'
        icon={'trash'}
        onClick={open}
        text={vt.removeAllDates}
      />
      <ConfirmDeleteAllDialog
        isOpen={isOpen}
        onCancel={close}
        onConfirm={onConfirm}
      />
    </>
  );
});
