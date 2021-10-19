import {
  black,
  blue1,
  blue2,
  darkGray2,
  darkGray4,
  darkGray5,
  gray2,
  gray3,
  gray4,
  green1,
  green2,
  lightGray1,
  lightGray2,
  lightGray4,
  lightGray5,
  orange1,
  orange2,
  ptBorderRadiusPx,
  ptButtonHeightLargePx,
  ptButtonHeightPx,
  ptDarkTextColorDisabled,
  ptFontSizePx,
  ptGridSizePx,
  ptIconSizeLargePx,
  ptIconSizeStandardPx,
  ptIntentDanger,
  ptIntentPrimary,
  ptIntentSuccess,
  ptIntentWarning,
  ptTextColorDisabled,
  red1,
  red2,
  white,
} from '../common';
import { hexToRgba, joinCssStr } from '../utils';

export const buttonBorderWidthPx = 1;
export const buttonPadding = `${ptGridSizePx / 2}px ${ptGridSizePx}px`;

export const buttonPaddingSmall = `0 ${ptGridSizePx * 0.7}px`;
export const buttonPaddingLarge = `${ptGridSizePx / 2}px ${
  ptGridSizePx * 1.5
}px`;
export const buttonIconSpacingPx =
  (ptButtonHeightPx - ptIconSizeStandardPx) / 2;
export const buttonIconSpacingLargePx =
  (ptButtonHeightLargePx - ptIconSizeLargePx) / 2;

/*
CSS `border` property issues:
- An element can only have one border.
- Borders can't stack with shadows.
- Borders modify the size of the element they're applied to.
- Border positioning requires the extra `box-sizing` property.

`box-shadow` doesn't have these issues, we're using it instead of `border`.
*/
export const buttonBoxShadow = joinCssStr(
  `inset 0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.2)}`,
  `inset 0 ${-buttonBorderWidthPx}px 0 ${hexToRgba(black, 0.1)}`
);
export const buttonBoxShadowActive = joinCssStr(
  `inset 0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.2)}`,
  `inset 0 1px 2px ${hexToRgba(black, 0.2)}`
);
export const buttonIntentBoxShadow = joinCssStr(
  `inset 0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.4)}`,
  `inset 0 ${-buttonBorderWidthPx}px 0 ${hexToRgba(black, 0.2)}`
);
export const buttonIntentBoxShadowActive = joinCssStr(
  `inset 0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.4)}`,
  `inset 0 1px 2px ${hexToRgba(black, 0.2)}`
);

/*
Overlay shadows are used for default buttons
floating on top of other elements. This way, the
shadows blend with the colors beneath it.
Switches and slider handles both use these variables.
*/
export const buttonBoxShadowOverlay = joinCssStr(
  `0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.2)}`,
  `0 1px 1px ${hexToRgba(black, 0.2)}`
);

export const buttonBoxShadowOverlayActive = joinCssStr(
  `0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.2)}`,
  `inset 0 1px 1px ${hexToRgba(black, 0.1)}`
);

export const darkButtonBoxShadow = joinCssStr(
  `0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.4)}`
);
export const darkButtonBoxShadowActive = joinCssStr(
  `0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.6)}`,
  `inset 0 1px 2px ${hexToRgba(black, 0.2)}`
);
export const darkButtonIntentBoxShadow = joinCssStr(
  `0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.4)}`
);
export const darkButtonIntentBoxShadowActive = joinCssStr(
  `0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.4)}`,
  `inset 0 1px 2px ${hexToRgba(black, 0.2)}`
);

export const buttonGradient = joinCssStr(
  `linear-gradient(to bottom, ${hexToRgba(white, 0.8)}, ${hexToRgba(white, 0)})`
);
export const buttonIntentGradient = joinCssStr(
  `linear-gradient(to bottom, ${hexToRgba(white, 0.1)}, ${hexToRgba(white, 0)})`
);
export const darkButtonGradient = joinCssStr(
  `linear-gradient(to bottom, ${hexToRgba(white, 0.05)}, ${hexToRgba(
    white,
    0
  )})`
);

export const buttonColorDisabled = ptTextColorDisabled;
export const buttonBackgroundColor = lightGray5;
export const buttonBackgroundColorHover = lightGray4;
export const buttonBackgroundColorActive = lightGray2;
export const buttonBackgroundColorDisabled = hexToRgba(lightGray1, 0.5);
export const buttonBackgroundColorActiveDisabled = hexToRgba(lightGray1, 0.7);
export const buttonIntentColorDisabled = hexToRgba(white, 0.6);
export const darkButtonColorDisabled = ptDarkTextColorDisabled;
export const darkButtonBackgroundColor = darkGray5;
export const darkButtonBackgroundColorHover = darkGray4;
export const darkButtonBackgroundColorActive = darkGray2;
export const darkButtonBackgroundColorDisabled = hexToRgba(darkGray5, 0.5);
export const darkButtonBackgroundColorActiveDisabled = hexToRgba(
  darkGray5,
  0.7
);
export const darkButtonIntentColorDisabled = hexToRgba(white, 0.3);

export const minimalButtonDividerWidthPx = 1;
export const minimalButtonBackgroundColor = 'none';
export const minimalButtonBackgroundColorHover = hexToRgba(gray4, 0.3);
export const minimalButtonBackgroundColorActive = hexToRgba(gray2, 0.3);
export const darkMinimalButtonBackgroundColor = 'none';
export const darkMinimalButtonBackgroundColorHover = hexToRgba(gray3, 0.15);
export const darkMinimalButtonBackgroundColorActive = hexToRgba(gray3, 0.3);

export const buttonOutlinedWidthPx = 1;
export const buttonOutlinedBorderIntentOpacity = 0.6;
export const buttonOutlinedBorderDisabledIntentOpacity = 0.2;

// "intent": (default, hover, active colors)
export const buttonIntents = {
  primary: [ptIntentPrimary, blue2, blue1],
  success: [ptIntentSuccess, green2, green1],
  warning: [ptIntentWarning, orange2, orange1],
  danger: [ptIntentDanger, red2, red1],
} as const;

export const ptButtonBase = `
  display: inline-flex;

  align-items: center;

  border: none;
  border-radius: ${ptBorderRadiusPx}px;
  cursor: pointer;
  font-size: ${ptFontSizePx}px;
  justify-content: center;
  padding: ${buttonPadding};
  text-align: left;
  vertical-align: middle;
`;

export const ptButtonHeight = (heightPx: number): string => `
  min-height: ${heightPx}px;
  min-width: ${heightPx}px;
`;
