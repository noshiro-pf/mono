import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { texts } from '../../../../constants/texts';
import { BpAlert } from '../../../atoms/blueprint-js-wrapper/bp-dialog';

const vt = texts.createEventPage.section2;

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteAllDialog = memoNamed<Props>(
  'ConfirmDeleteAllDialog',
  (props) => (
    <BpAlert
      isOpen={props.isOpen}
      onConfirm={props.onConfirm}
      onCancel={props.onCancel}
      cancelButtonText={texts.buttonText.cancel}
      confirmButtonText={texts.buttonText.delete}
      intent={'danger'}
      icon={'trash'}
      canEscapeKeyCancel={true}
      canOutsideClickCancel={true}
    >
      <p>{vt.removeAllConfirmation}</p>
    </BpAlert>
  )
);
