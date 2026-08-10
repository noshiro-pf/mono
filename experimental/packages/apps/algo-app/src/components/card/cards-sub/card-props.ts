import { type CardTextColor } from '../../../constants';
import { type CardColor } from '../../../types';

export type CardProps = Readonly<{
  color: CardColor;
  textColor: CardTextColor;
}>;
