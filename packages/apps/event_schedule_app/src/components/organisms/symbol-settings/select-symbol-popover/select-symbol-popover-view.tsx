import { Button, IconName, Popover } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { AnswerSymbolIconId } from '../../../../types/enum/answer-symbol-icon';
import { IList } from '../../../../utils/immutable';
import { SelectSymbolPopoverContent } from './select-symbol-popover-content';

export const SelectSymbolPopoverView = memoNamed<{
  openerIcon: IconName | JSX.Element;
  iconsInUse: IList<AnswerSymbolIconId>;
  isOpen: boolean;
  onOpenClick: () => void;
  onClose: () => void;
  onIconSelect: (iconId: AnswerSymbolIconId) => void;
}>(
  'SelectSymbolPopoverView',
  ({ isOpen, iconsInUse, onClose, openerIcon, onOpenClick, onIconSelect }) => (
    <Popover
      target={<Button icon={openerIcon} minimal={true} onClick={onOpenClick} />}
      content={
        <SelectSymbolPopoverContent
          iconsInUse={iconsInUse}
          onIconSelect={onIconSelect}
        />
      }
      isOpen={isOpen}
      onClose={onClose}
      canEscapeKeyClose={true}
    />
  )
);
