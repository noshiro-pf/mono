import { mapNullable, RectSize } from '@noshiro/ts-utils';
import { JSXInternal } from 'preact/src/jsx';
import { defaultCardSize } from '../../../constants/default-card-size';
import { fillCardSize } from '../../../functions/fill-card-size';
import { flipColor } from '../../../functions/flip-color';
import { CardColor } from '../../../types/card-color';
import {
  CardTextColor,
  darkGray,
  lightGray,
} from '../../../types/card-text-color';

export type CardProps = Readonly<{
  color: CardColor;
  size?: Partial<RectSize>;
  visibleToMe: boolean;
}>;

const style = { display: 'block' };

export const useCardAttributes = (
  color: CardColor,
  size: Partial<RectSize> | undefined,
  visibleToPair: boolean
): {
  textColor: CardTextColor;
  width: number;
  height: number;
  style: JSXInternal.CSSProperties;
} => {
  const { width, height } = mapNullable(fillCardSize)(size) ?? defaultCardSize;
  const textColor = visibleToPair
    ? color === 'black'
      ? darkGray
      : lightGray
    : flipColor(color);

  return {
    textColor,
    width,
    height,
    style,
  };
};
