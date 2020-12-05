import { IconName, Popover } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { AnswerSymbolIconId } from '../../../../types/enum/answer-symbol-icon';
import { IList } from '../../../../utils/immutable';
import { BpButton } from '../../../atoms/blueprint-js-wrapper/button';
import { SelectSymbolPopoverContent } from './select-symbol-popover-content';

interface Props {
  openerIcon: IconName | JSX.Element;
  iconsInUse: IList<AnswerSymbolIconId>;
  isOpen: boolean;
  onOpenClick: () => void;
  onClose: () => void;
  onIconSelect: (iconId: AnswerSymbolIconId) => void;
}

export const SelectSymbolPopoverView = memoNamed<Props>(
  'SelectSymbolPopoverView',
  (props) => (
    <Popover
      target={
        <BpButton
          icon={props.openerIcon}
          minimal={true}
          onClick={props.onOpenClick}
        />
      }
      content={
        <SelectSymbolPopoverContent
          iconsInUse={props.iconsInUse}
          onIconSelect={props.onIconSelect}
        />
      }
      isOpen={props.isOpen}
      onClose={props.onClose}
      canEscapeKeyClose={true}
    />
  )
);
