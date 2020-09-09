import { Button, IconName } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import {
  AnswerSymbolIconId,
  answerSymbolIconIdsFromBp,
} from '../../../../types/enum/answer-symbol-icon';
import { IList } from '../../../../utils/immutable';
import { CircleIcon, CloseIcon, TriangleIcon } from '../../../atoms/icons';

const Root = styled.div`
  padding: 10px;
`;

const icons: { id: AnswerSymbolIconId; icon: IconName | JSX.Element }[] = [
  ...answerSymbolIconIdsFromBp.map((iconId) => ({ id: iconId, icon: iconId })),
  { id: 'handmade-circle', icon: <CircleIcon /> },
  { id: 'handmade-triangle', icon: <TriangleIcon /> },
  { id: 'handmade-cross', icon: <CloseIcon /> },
];

export const SelectSymbolPopoverContent = memoNamed<{
  iconsInUse: IList<AnswerSymbolIconId>;
  onIconSelect: (iconId: AnswerSymbolIconId) => void;
}>('SelectSymbolPopoverContent', ({ iconsInUse, onIconSelect }) => {
  const iconsWithHandler = useMemo(
    () =>
      icons.map((icn) => ({
        ...icn,
        disabled: iconsInUse.includes(icn.id),
        onClickHandler: () => onIconSelect(icn.id),
      })),

    [iconsInUse, onIconSelect]
  );

  return (
    <Root>
      {iconsWithHandler.map(({ id, icon, disabled, onClickHandler }) => (
        <Button
          key={id}
          icon={icon}
          minimal={true}
          disabled={disabled || true}
          onClick={onClickHandler}
        />
      ))}
    </Root>
  );
});
