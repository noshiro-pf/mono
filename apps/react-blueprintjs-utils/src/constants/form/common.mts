import { css } from '@emotion/react';
import { type MutableRecord, type ReadonlyRecord } from 'ts-type-forge';
import { hexToRgba } from '../../utils/index.mjs';
import { buttonColorDisabled } from '../button/index.mjs';
import {
  black,
  borderShadow,
  darkGray5,
  lightGray1,
  ptBorderRadiusPx,
  ptDividerBlack,
  ptDropShadowOpacity,
  ptFontSizePx,
  ptGridSizePx,
  ptIconSizeStandardPx,
  ptInputBoxShadow,
  ptInputHeightPx,
  ptInputHeightSmallPx,
  ptIntentPrimary,
  ptTextColor,
  ptTextColorDisabled,
  ptTransitionDuration,
  ptTransitionEase,
  white,
} from '../common/index.mjs';

export const inputPaddingHorizontalPx = ptGridSizePx;

export const inputSmallPaddingPx = ptInputHeightSmallPx - ptIconSizeStandardPx;

export const inputFontWeight = 400;

export const inputTransition =
  `box-shadow ${ptTransitionDuration} ${ptTransitionEase}` as const;

export const inputColor = ptTextColor;

export const inputColorDisabled = buttonColorDisabled;

export const inputPlaceholderColor = ptTextColorDisabled;

export const inputBackgroundColor = white;

export const inputBackgroundColorDisabled = hexToRgba(lightGray1, 0.5);

export const inputShadowColorFocus = ptIntentPrimary;

export const darkInputBackgroundColor = hexToRgba(black, 0.3);

export const darkInputBackgroundColorDisabled = hexToRgba(darkGray5, 0.5);

// avoids edge blurriness for light theme focused default input
// second box-shadow of pt-input-box-shadow
export const inputBoxShadowFocus = `inset 0 1px 1px ${hexToRgba(
  black,
  ptDropShadowOpacity,
)}` as const;

// for best visual results, button group and control group elements should be
// stacked in the following order to ensure sharp edges in all cases and states:

export const controlGroupStack = [
  // lowest z-index
  'input-disabled',
  'input-default',
  'button-disabled',
  'button-default',
  'button-focus',
  'button-hover',
  'button-active',
  'intent-button-disabled',
  'intent-button-default',
  'intent-button-focus',
  'intent-button-hover',
  'intent-button-active',
  'intent-input-default',
  'input-focus',
  'intent-input-focus',
  'input-group-children',
  'select-caret',
] as const;

// Built by hand rather than with `Object.fromEntries`, whose return type is a
// plain string-keyed record and so does not cover the union of layer names.
const mut_controlGroupStackZIndex: MutableRecord<string, number> = {};

for (const [index, key] of controlGroupStack.entries()) {
  mut_controlGroupStackZIndex[key] = index;
}

export const controlGroupStackZIndex: ReadonlyRecord<string, number> =
  mut_controlGroupStackZIndex;

export const inputTransitionShadow = (
  color: string = inputShadowColorFocus,
  focused: boolean = false,
): string =>
  focused
    ? [borderShadow(1, color, 1), borderShadow(0.3, color, 3)].join(', ')
    : [borderShadow(0, color, 0), borderShadow(0, color, 0)].join(', ');

export const ptInputPlaceholder = css`
  &::placeholder {
    color: ${inputPlaceholderColor};
    // normalize.css sets an opacity less than 1, we don't want this
    opacity: 1;
  }
`;

export const ptInputDisabled = css`
  background: ${inputBackgroundColorDisabled};
  box-shadow: none;
  color: ${inputColorDisabled};
  cursor: not-allowed;
  resize: none;
`;

export const ptInput = css`
  ${ptInputPlaceholder}

  appearance: none;
  background: ${inputBackgroundColor};
  border: none;
  border-radius: ${ptBorderRadiusPx}px;
  box-shadow:
    ${inputTransitionShadow(inputShadowColorFocus)}, ${ptInputBoxShadow};
  color: ${inputColor};
  font-size: ${ptFontSizePx}px;
  font-weight: ${inputFontWeight};
  height: ${ptInputHeightPx}px;
  line-height: ${ptInputHeightPx}px;

  outline: none;
  padding: 0 ${inputPaddingHorizontalPx}px;
  transition: ${inputTransition};
  vertical-align: middle;

  &:focus {
    box-shadow:
      ${inputTransitionShadow(inputShadowColorFocus, true)},
      ${inputBoxShadowFocus};
  }

  &[type='search'] {
    border-radius: ${ptInputHeightPx}px;
    // override normalize.css
    box-sizing: border-box;
    padding-left: ${ptGridSizePx}px;
  }

  &[readonly] {
    box-shadow: inset 0 0 0 1px ${ptDividerBlack};
  }

  &:disabled {
    ${ptInputDisabled}
  }
`;

export { darkButtonColorDisabled as darkInputColorDisabled } from '../button/index.mjs';

export {
  ptIconSizeLargePx as controlIndicatorSizeLargePx,
  ptIconSizeStandardPx as controlIndicatorSizePx,
  ptDarkTextColor as darkInputColor,
  ptDarkTextColorDisabled as darkInputPlaceholderColor,
  ptIntentPrimary as darkInputShadowColorFocus,
} from '../common/index.mjs';
