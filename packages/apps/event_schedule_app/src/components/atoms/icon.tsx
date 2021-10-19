import { Icon } from '@blueprintjs/core';
import type { AnswerSymbolIdWithNone } from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';
import { CircleIcon, CloseIcon, TriangleIcon } from './icons';

type Props = Readonly<{
  iconName: AnswerSymbolIdWithNone;
  color?: string;
  size?: number;
}>;

export const CustomIcon = memoNamed<Props>(
  'MyIcon',
  ({ iconName, color, size }) => {
    const icon = useMemo<JSX.Element>(() => {
      switch (iconName) {
        case 'good':
          return <CircleIcon color={color} size={size} />;
        case 'fair':
          return <TriangleIcon color={color} size={size} />;
        case 'poor':
          return <CloseIcon color={color} size={size} />;
        case 'none':
          return <div />;
      }
    }, [iconName, color, size]);

    return <Icon color={color} icon={icon} iconSize={size} />;
  }
);
