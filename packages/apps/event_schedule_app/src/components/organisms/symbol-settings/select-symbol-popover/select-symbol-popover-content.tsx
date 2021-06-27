import type { IconName } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';
import styled from 'styled-components';
import type { AnswerSymbolIconId } from '../../../../types';
import { answerSymbolIconIdsFromBp } from '../../../../types';
import { CircleIcon, CloseIcon, TriangleIcon } from '../../../atoms';

const icons: readonly {
  id: AnswerSymbolIconId;
  icon: IconName | JSX.Element;
}[] = [
  ...answerSymbolIconIdsFromBp.map((iconId) => ({ id: iconId, icon: iconId })),
  { id: 'handmade-circle', icon: <CircleIcon /> },
  { id: 'handmade-triangle', icon: <TriangleIcon /> },
  { id: 'handmade-cross', icon: <CloseIcon /> },
];

type Props = Readonly<{
  iconsInUse: readonly AnswerSymbolIconId[];
  onIconSelect: (iconId: AnswerSymbolIconId) => void;
}>;

export const SelectSymbolPopoverContent = memoNamed<Props>(
  'SelectSymbolPopoverContent',
  ({ iconsInUse, onIconSelect }) => {
    const iconsWithHandler = useMemo(
      () =>
        icons.map((icn) => ({
          ...icn,
          disabled: iconsInUse.includes(icn.id),
          onClickHandler: () => {
            onIconSelect(icn.id);
          },
        })),

      [iconsInUse, onIconSelect]
    );

    return (
      <Root>
        {iconsWithHandler.map(({ id, icon, disabled, onClickHandler }) => (
          <BpButton
            key={id}
            icon={icon}
            minimal={true}
            disabled={disabled || true}
            onClick={onClickHandler}
          />
        ))}
      </Root>
    );
  }
);

const Root = styled.div`
  padding: 10px;
`;
