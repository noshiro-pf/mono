import type { IconName } from '@blueprintjs/core';
import { Popover } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import { useCallback } from 'react';
import type { AnswerSymbolIconId } from '../../../../types';
import { SelectSymbolPopoverContent } from './select-symbol-popover-content';

type Props = Readonly<{
  openerIcon: IconName | JSX.Element;
  iconsInUse: readonly AnswerSymbolIconId[];
  onIconSelectSubmit: (id: AnswerSymbolIconId) => void;
}>;

export const SelectSymbolPopover = memoNamed<Props>(
  'SelectSymbolPopover',
  ({ openerIcon, iconsInUse, onIconSelectSubmit }) => {
    const [isOpen, handleOpen, handleClose] = useBooleanState(false);

    const onIconSelect = useCallback(
      (id: AnswerSymbolIconId) => {
        onIconSelectSubmit(id);
        handleClose();
      },
      [onIconSelectSubmit, handleClose]
    );

    return (
      <Popover
        content={
          <SelectSymbolPopoverContent
            iconsInUse={iconsInUse}
            onIconSelect={onIconSelect}
          />
        }
        isOpen={isOpen}
        onClose={handleClose}
        canEscapeKeyClose={true}
      >
        <BpButton icon={openerIcon} minimal={true} onClick={handleOpen} />
      </Popover>
    );
  }
);
