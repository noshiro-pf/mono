import type { IconName } from '@blueprintjs/core';
import { Icon } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';
import type { AnswerSymbolIconId } from '../../types';
import { CircleIcon, CloseIcon, TriangleIcon } from './icons';

type Props = Readonly<{
  iconName: AnswerSymbolIconId;
  color?: string;
  size?: number;
}>;

export const CustomIcon = memoNamed<Props>(
  'MyIcon',
  ({ iconName, color, size }) => {
    const icon = useMemo<IconName | JSX.Element>(() => {
      switch (iconName) {
        case 'handmade-circle':
          return <CircleIcon color={color} size={size} />;
        case 'handmade-triangle':
          return <TriangleIcon color={color} size={size} />;
        case 'handmade-cross':
          return <CloseIcon color={color} size={size} />;
        default:
          return iconName;
      }
    }, [iconName, color, size]);

    return <Icon icon={icon} color={color} iconSize={size} />;
  }
);
