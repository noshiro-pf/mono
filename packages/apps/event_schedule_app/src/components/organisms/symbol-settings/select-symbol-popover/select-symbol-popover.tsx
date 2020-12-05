import { IconName } from '@blueprintjs/core';
import { memoNamed, useBooleanState } from '@mono/react-utils';
import React, { useCallback } from 'react';
import { AnswerSymbolIconId } from '../../../../types/enum/answer-symbol-icon';
import { IList } from '../../../../utils/immutable';
import { SelectSymbolPopoverView } from './select-symbol-popover-view';

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
      <SelectSymbolPopoverView
        openerIcon={openerIcon}
        iconsInUse={iconsInUse}
        isOpen={isOpen}
        onOpenClick={open}
        onClose={close}
        onIconSelect={onIconSelect}
      />
    );
  }
);
