import { Icon, IconName } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';
import { AnswerSymbolIconId } from '../../types/enum/answer-symbol-icon';
import { CircleIcon, CloseIcon, TriangleIcon } from './icons';

interface Props {
  name: AnswerSymbolIconId;
  color?: string;
  size?: number;
}

export const CustomIcon = memoNamed<Props>(
  'MyIcon',
  ({ name, color, size }) => {
    const icon = useMemo<IconName | JSX.Element>(() => {
      switch (name) {
        case 'handmade-circle':
          return <CircleIcon color={color} size={size} />;
        case 'handmade-triangle':
          return <TriangleIcon color={color} size={size} />;
        case 'handmade-cross':
          return <CloseIcon color={color} size={size} />;
        default:
          return name;
      }
    }, [name, color, size]);

    return <Icon icon={icon} color={color} iconSize={size} />;
  }
);
