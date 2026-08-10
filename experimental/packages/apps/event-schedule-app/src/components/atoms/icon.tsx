import { Icon } from '@blueprintjs/core';
import { CircleIcon, CloseIcon, TriangleIcon } from './icons';

type Props = Readonly<{
  iconName: AnswerIconIdWithNone;
  color?: string;
  size?: number;
}>;

export const CustomIcon = memoNamed<Props>(
  'MyIcon',
  ({ iconName, color, size }) => {
    const icon = useMemo<React.JSX.Element>(() => {
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

    return <Icon color={color} icon={icon} size={size} />;
  },
);
