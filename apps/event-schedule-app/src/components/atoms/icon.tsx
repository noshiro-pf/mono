import type { Bindable, JSX } from 'synstate-dom';
import { CircleIcon, CloseIcon, TriangleIcon } from './icons/index.mjs';

type Props = Readonly<{
  iconName: AnswerIconIdWithNone;
  color?: Bindable<string>;
  size?: number;
}>;

/** The answer icon, ○ △ ×, or an empty box for none. */
export const CustomIcon = ({ iconName, color, size }: Props): JSX.Element => {
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
};
