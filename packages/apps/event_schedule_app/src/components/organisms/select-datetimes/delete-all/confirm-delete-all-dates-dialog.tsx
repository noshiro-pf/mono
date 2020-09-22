import { Alert } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { texts } from '../../../../constants/texts';

const vt = texts.createEventPage.section2;

export const ConfirmDeleteAllDialog = memoNamed<{
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}>('ConfirmDeleteAllDialog', ({ isOpen, onCancel, onConfirm }) => (
  <Alert
    isOpen={isOpen}
    onConfirm={onConfirm}
    onCancel={onCancel}
    cancelButtonText={texts.buttonText.cancel}
    confirmButtonText={texts.buttonText.delete}
    intent={'danger'}
    icon={'trash'}
    canEscapeKeyCancel={true}
    canOutsideClickCancel={true}
  >
    <p>{vt.removeAllConfirmation}</p>
  </Alert>
));
