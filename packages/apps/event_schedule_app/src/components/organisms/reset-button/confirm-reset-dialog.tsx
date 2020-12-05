import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { texts } from '../../../constants/texts';
import { BpAlert } from '../../atoms/blueprint-js-wrapper/bp-dialog';

const vt = texts.createEventPage.resetButton;

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmResetDialog = memoNamed<Props>(
  'ConfirmResetDialog',
  (props) => (
    <BpAlert
      isOpen={props.isOpen}
      onConfirm={props.onConfirm}
      onCancel={props.onCancel}
      cancelButtonText={texts.buttonText.cancel}
      confirmButtonText={texts.buttonText.reset}
      intent={'danger'}
      icon={'reset'}
      canEscapeKeyCancel={true}
      canOutsideClickCancel={true}
    >
      <p>{vt.resetConfirmation}</p>
    </BpAlert>
  )
);
