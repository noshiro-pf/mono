import { IconName, Popover } from '@blueprintjs/core';
import { BpButton } from '@mono/react-blueprintjs-utils';
import { memoNamed, useBooleanState } from '@mono/react-utils';
import React, { useCallback } from 'react';
import { AnswerSymbolIconId } from '../../../../types/enum/answer-symbol-icon';
import { IList } from '../../../../utils/immutable';
import { SelectSymbolPopoverContent } from './select-symbol-popover-content';

interface Props {
  openerIcon: IconName | JSX.Element;
  iconsInUse: IList<AnswerSymbolIconId>;
  onIconSelectSubmit: (id: AnswerSymbolIconId) => void;
}

export const SelectSymbolPopover = memoNamed<Props>(
  'SelectSymbolPopover',
  ({ openerIcon, iconsInUse, onIconSelectSubmit }) => {
    const [isOpen, open, close] = useBooleanState(false);

    const onIconSelect = useCallback(
      (id: AnswerSymbolIconId) => {
        onIconSelectSubmit(id);
        close();
      },
      [onIconSelectSubmit, close]
    );

    return (
      <Popover
        target={<BpButton icon={openerIcon} minimal={true} onClick={open} />}
        content={
          <SelectSymbolPopoverContent
            iconsInUse={iconsInUse}
            onIconSelect={onIconSelect}
          />
        }
        isOpen={isOpen}
        onClose={close}
        canEscapeKeyClose={true}
      />
    );
  }
);
