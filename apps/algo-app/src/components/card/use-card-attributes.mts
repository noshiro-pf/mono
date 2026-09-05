import { useBoolState } from 'better-preact-use-state';
import { useMemo } from 'preact/hooks';
import { type RectSize } from 'ts-utils-additional';
import {
  darkGray,
  eyeIconColorDef,
  lightGray,
  zIndex,
  type CardTextColor,
  type CustomColor,
} from '../../constants/index.mjs';
import { fillCardSize, flipColor } from '../../functions/index.mjs';
import { type CardColor, type VisibilityFromMe } from '../../types/index.mjs';

export const useCardAttributes = (
  color: CardColor,
  size: Partial<RectSize> | undefined,
  visibilityFromMe: VisibilityFromMe,
  isClickable: boolean,
  float: 'always' | 'never' | 'onHover',
  showOutline: 'always' | 'never' | 'onHover',
  outlineColor: CustomColor,
): {
  textColor: CardTextColor;
  eyeIconColor: string;
  wrapperStyle: preact.CSSProperties;
  backSideStyle: preact.CSSProperties;
  frontSideStyle: preact.CSSProperties;
  rectStyle: preact.CSSProperties;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
} => {
  const { width, height } = useMemo(() => fillCardSize(size), [size]);

  const textColor =
    visibilityFromMe === 'faceDownButVisibleToMe'
      ? color === 'black'
        ? darkGray
        : lightGray
      : flipColor(color);

  const eyeIconColor =
    color === 'black' ? eyeIconColorDef.light : eyeIconColorDef.dark;

  const [isMouseOver, { setTrue: onMouseEnter, setFalse: onMouseLeave }] =
    useBoolState(false);

  const wrapperStyle = useMemo<preact.CSSProperties>(
    () => ({
      display: 'block',
      cursor: isClickable ? 'pointer' : 'default',
      transform: `translateY(${
        float === 'always' || (float === 'onHover' && isMouseOver) ? -20 : 0
      }px)`,
      height: `${height}px`,
      width: `${width}px`,
      zIndex: zIndex.cards,
    }),
    [isClickable, float, isMouseOver, height, width],
  );

  const backSideStyle = useMemo<preact.CSSProperties>(
    () => ({
      transform:
        visibilityFromMe === 'faceUp' ? 'rotateY(180deg)' : 'rotateY(0)',
    }),
    [visibilityFromMe],
  );

  const frontSideStyle = useMemo<preact.CSSProperties>(
    () => ({
      transform:
        visibilityFromMe === 'faceUp' ? 'rotateY(0)' : 'rotateY(180deg)',
    }),
    [visibilityFromMe],
  );

  const showOutline_ =
    showOutline === 'always' || (showOutline === 'onHover' && isMouseOver);

  const rectStyle = useMemo<preact.CSSProperties>(
    () => ({
      stroke: showOutline_ ? outlineColor : '',
      strokeWidth: showOutline_ ? 8 : 0,
      fill: color,
    }),
    [showOutline_, color, outlineColor],
  );

  return {
    textColor,
    eyeIconColor,
    wrapperStyle,
    backSideStyle,
    frontSideStyle,
    rectStyle,
    onMouseEnter,
    onMouseLeave,
  };
};
