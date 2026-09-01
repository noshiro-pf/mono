import { type CardTextColor } from '../../../constants/index.mjs';
import { type CardColor } from '../../../types/index.mjs';

export type CardProps = Readonly<{
  color: CardColor;
  textColor: CardTextColor;
}>;
