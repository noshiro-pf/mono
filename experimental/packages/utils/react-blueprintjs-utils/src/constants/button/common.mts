import { css, type SerializedStyles } from '@emotion/react';
import { hexToRgba, joinCssStr } from '../../utils/index.mjs';
import {
  black,
  blue1,
  blue2,
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
  ptFontSizePx,
  ptGridSizePx,
  ptIconSizeLargePx,
  ptIconSizeStandardPx,
  ptIntentDanger,
  ptIntentPrimary,
  ptIntentSuccess,
  ptIntentWarning,
  ptTextColor,
  ptTextColorDisabled,
  red1,
  red2,
  white,
} from '../common/index.mjs';

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
  `inset 0 ${-buttonBorderWidthPx}px 0 ${hexToRgba(black, 0.1)}`,
);
export const buttonBoxShadowActive = joinCssStr(
  `inset 0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.2)}`,
  `inset 0 1px 2px ${hexToRgba(black, 0.2)}`,
);
export const buttonIntentBoxShadow = joinCssStr(
  `inset 0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.4)}`,
  `inset 0 ${-buttonBorderWidthPx}px 0 ${hexToRgba(black, 0.2)}`,
);
export const buttonIntentBoxShadowActive = joinCssStr(
  `inset 0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.4)}`,
  `inset 0 1px 2px ${hexToRgba(black, 0.2)}`,
);

/*
Overlay shadows are used for default buttons
floating on top of other elements. This way, the
shadows blend with the colors beneath it.
Switches and slider handles both use these variables.
*/
export const buttonBoxShadowOverlay = joinCssStr(
  `0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.2)}`,
  `0 1px 1px ${hexToRgba(black, 0.2)}`,
);

export const buttonBoxShadowOverlayActive = joinCssStr(
  `0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.2)}`,
  `inset 0 1px 1px ${hexToRgba(black, 0.1)}`,
);

export const darkButtonBoxShadow = joinCssStr(
  `0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.4)}`,
);
export const darkButtonBoxShadowActive = joinCssStr(
  `0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.6)}`,
  `inset 0 1px 2px ${hexToRgba(black, 0.2)}`,
);
export const darkButtonIntentBoxShadow = joinCssStr(
  `0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.4)}`,
);
export const darkButtonIntentBoxShadowActive = joinCssStr(
  `0 0 0 ${buttonBorderWidthPx}px ${hexToRgba(black, 0.4)}`,
  `inset 0 1px 2px ${hexToRgba(black, 0.2)}`,
);

export const buttonGradient = joinCssStr(
  `linear-gradient(to bottom, ${hexToRgba(white, 0.8)}, ${hexToRgba(
    white,
    0,
  )})`,
);
export const buttonIntentGradient = joinCssStr(
  `linear-gradient(to bottom, ${hexToRgba(white, 0.1)}, ${hexToRgba(
    white,
    0,
  )})`,
);
export const darkButtonGradient = joinCssStr(
  `linear-gradient(to bottom, ${hexToRgba(white, 0.05)}, ${hexToRgba(
    white,
    0,
  )})`,
);

export const buttonColorDisabled = ptTextColorDisabled;
export const buttonBackgroundColor = lightGray5;
export const buttonBackgroundColorHover = lightGray4;
export const buttonBackgroundColorActive = lightGray2;
export const buttonBackgroundColorDisabled = hexToRgba(lightGray1, 0.5);
export const buttonBackgroundColorActiveDisabled = hexToRgba(lightGray1, 0.7);
export const buttonIntentColorDisabled = hexToRgba(white, 0.6);

export const darkButtonBackgroundColorDisabled = hexToRgba(darkGray5, 0.5);
export const darkButtonBackgroundColorActiveDisabled = hexToRgba(
  darkGray5,
  0.7,
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

export const ptButtonBase = css`
  /* pt-flex-container */
  display: inline-flex;

  /* pt-button-base */
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

export const ptButtonHeight = (heightPx: number): SerializedStyles => css`
  min-height: ${heightPx}px;
  min-width: ${heightPx}px;
`;

// @mixin pt-button-height-large() {
//   @include pt-button-height($pt-button-height-large);
//   @include pt-flex-margin(row, $button-icon-spacing-large);
//   font-size: $pt-font-size-large;
//   padding: $button-padding-large;
// }

export const ptButtonHeightDefault = css`
  ${ptButtonHeight(ptButtonHeightPx)}
  padding: ${buttonPadding};
`;

// @mixin pt-button-height-small() {
//   @include pt-button-height($pt-button-height-small);
//   padding: $button-padding-small;
// }

const ptButtonHover = css`
  background-clip: padding-box;
  background-color: ${buttonBackgroundColorHover};
  box-shadow: ${buttonBoxShadow};
`;

const ptButtonActive = css`
  background-color: ${buttonBackgroundColorActive};
  background-image: none;
  box-shadow: ${buttonBoxShadowActive};
`;

const ptButtonDisabled = css`
  background-color: ${buttonBackgroundColorDisabled};
  background-image: none;
  box-shadow: none;
  color: ${buttonColorDisabled};
  cursor: not-allowed;
  outline: none;

  &:active &:hover {
    background: ${buttonBackgroundColorActiveDisabled};
  }
`;

export const ptButton = css`
  background-color: ${buttonBackgroundColor};
  background-image: ${buttonGradient};
  box-shadow: ${buttonBoxShadow};
  color: ${ptTextColor};

  &:hover {
    ${ptButtonHover}
  }

  &:active {
    ${ptButtonActive}
  }

  &:disabled {
    ${ptButtonDisabled}
  }
`;

// @mixin pt-button-intent($default-color, $hover-color, $active-color) {
//   background-color: $default-color;
//   background-image: $button-intent-gradient;
//   box-shadow: $button-intent-box-shadow;
//   color: $white;

//   &:hover,
//   &:active,
//   &.#{$ns}-active {
//     color: $white;
//   }

//   &:hover {
//     background-color: $hover-color;
//     box-shadow: $button-intent-box-shadow;
//   }

//   &:active,
//   &.#{$ns}-active {
//     background-color: $active-color;
//     background-image: none;
//     box-shadow: $button-intent-box-shadow-active;
//   }

//   &:disabled,
//   &.#{$ns}-disabled {
//     @include pt-button-intent-disabled($default-color);
//   }
// }

// @mixin pt-button-intent-disabled($default-color) {
//   background-color: rgba($default-color, 0.5);
//   background-image: none;
//   border-color: transparent;
//   box-shadow: none;
//   color: $button-intent-color-disabled;
// }

// @mixin pt-dark-button() {
//   background-color: $dark-button-background-color;
//   background-image: $dark-button-gradient;
//   box-shadow: $dark-button-box-shadow;
//   color: $pt-dark-text-color;

//   &:hover,
//   &:active,
//   &.#{$ns}-active {
//     color: $pt-dark-text-color;
//   }

//   &:hover {
//     @include pt-dark-button-hover();
//   }

//   &:active,
//   &.#{$ns}-active {
//     @include pt-dark-button-active();
//   }

//   &:disabled,
//   &.#{$ns}-disabled {
//     @include pt-dark-button-disabled();
//   }

//   .#{$ns}-button-spinner .#{$ns}-spinner-head {
//     background: $dark-progress-track-color;
//     stroke: $dark-progress-head-color;
//   }
// }

// @mixin pt-dark-button-hover() {
//   background-color: $dark-button-background-color-hover;
//   box-shadow: $dark-button-box-shadow;
// }

// @mixin pt-dark-button-active() {
//   background-color: $dark-button-background-color-active;
//   background-image: none;
//   box-shadow: $dark-button-box-shadow-active;
// }

// @mixin pt-dark-button-disabled() {
//   background-color: $dark-button-background-color-disabled;
//   background-image: none;
//   box-shadow: none;
//   color: $dark-button-color-disabled;

//   &.#{$ns}-active {
//     background: $dark-button-background-color-active-disabled;
//   }
// }

// @mixin pt-dark-button-intent() {
//   box-shadow: $dark-button-intent-box-shadow;

//   &:hover {
//     box-shadow: $dark-button-intent-box-shadow;
//   }

//   &:active,
//   &.#{$ns}-active {
//     box-shadow: $dark-button-intent-box-shadow-active;
//   }

//   &:disabled,
//   &.#{$ns}-disabled {
//     @include pt-dark-button-intent-disabled();
//   }
// }

// @mixin pt-dark-button-intent-disabled() {
//   background-image: none;
//   box-shadow: none;
//   color: $dark-button-intent-color-disabled;
// }

// @mixin pt-button-minimal() {
//   background: $minimal-button-background-color;
//   box-shadow: none;

//   &:hover {
//     background: $minimal-button-background-color-hover;
//     box-shadow: none;
//     color: $pt-text-color;
//     text-decoration: none;
//   }

//   &:active,
//   &.#{$ns}-active {
//     background: $minimal-button-background-color-active;
//     box-shadow: none;
//     color: $pt-text-color;
//   }

//   &:disabled,
//   &:disabled:hover,
//   &.#{$ns}-disabled,
//   &.#{$ns}-disabled:hover {
//     background: none;
//     color: $pt-text-color-disabled;
//     cursor: not-allowed;

//     &.#{$ns}-active {
//       background: $minimal-button-background-color-active;
//     }
//   }

//   .#{$ns}-dark & {
//     @include pt-dark-button-minimal();
//   }

//   @each $intent, $colors in $button-intents {
//     &.#{$ns}-intent-#{$intent} {
//       @include pt-button-minimal-intent(
//         map-get($pt-intent-colors, $intent),
//         map-get($pt-intent-text-colors, $intent),
//         map-get($pt-dark-intent-text-colors, $intent)
//       );
//     }
//   }
// }

// @mixin pt-dark-button-minimal() {
//   background: $dark-minimal-button-background-color;
//   box-shadow: none;
//   color: inherit;

//   &:hover,
//   &:active,
//   &.#{$ns}-active {
//     background: none;
//     box-shadow: none;
//   }

//   &:hover {
//     background: $dark-minimal-button-background-color-hover;
//   }

//   &:active,
//   &.#{$ns}-active {
//     background: $dark-minimal-button-background-color-active;
//     color: $pt-dark-text-color;
//   }

//   &:disabled,
//   &:disabled:hover,
//   &.#{$ns}-disabled,
//   &.#{$ns}-disabled:hover {
//     background: none;
//     color: $pt-dark-text-color-disabled;
//     cursor: not-allowed;

//     &.#{$ns}-active {
//       background: $dark-minimal-button-background-color-active;
//     }
//   }
// }

// @mixin pt-button-minimal-intent($intent-color, $text-color, $dark-text-color) {
//   color: $text-color;

//   &:hover,
//   &:active,
//   &.#{$ns}-active {
//     background: none;
//     box-shadow: none;
//     color: $text-color;
//   }

//   &:hover {
//     background: rgba($intent-color, 0.15);
//     color: $text-color;
//   }

//   &:active,
//   &.#{$ns}-active {
//     background: rgba($intent-color, 0.3);
//     color: $text-color;
//   }

//   &:disabled,
//   &.#{$ns}-disabled {
//     background: none;
//     color: rgba($text-color, 0.5);

//     &.#{$ns}-active {
//       background: rgba($intent-color, 0.3);
//     }
//   }

//   .#{$ns}-button-spinner .#{$ns}-spinner-head {
//     stroke: $text-color;
//   }

//   .#{$ns}-dark & {
//     color: $dark-text-color;

//     &:hover {
//       background: rgba($intent-color, 0.2);
//       color: $dark-text-color;
//     }

//     &:active,
//     &.#{$ns}-active {
//       background: rgba($intent-color, 0.3);
//       color: $dark-text-color;
//     }

//     &:disabled,
//     &.#{$ns}-disabled {
//       background: none;
//       color: rgba($dark-text-color, 0.5);

//       &.#{$ns}-active {
//         background: rgba($intent-color, 0.3);
//       }
//     }
//   }
// }

// @mixin pt-button-minimal-divider() {
//   $divider-height: $pt-grid-size * 2;
//   background: $pt-divider-black;

//   margin: ($pt-button-height - $divider-height) / 2;
//   width: $minimal-button-divider-width;

//   .#{$ns}-dark & {
//     background: $pt-dark-divider-white;
//   }
// }

// @mixin pt-button-outlined() {
//   border: $button-outlined-width solid rgba($pt-text-color, 0.2);
//   box-sizing: border-box;

//   &:disabled,
//   &.#{$ns}-disabled,
//   &:disabled:hover,
//   &.#{$ns}-disabled:hover {
//     border-color: rgba($pt-text-color-disabled, 0.1);
//   }

//   .#{$ns}-dark & {
//     @include pt-dark-button-outlined();
//   }

//   @each $intent, $colors in $button-intents {
//     &.#{$ns}-intent-#{$intent} {
//       @include pt-button-outlined-intent(
//         map-get($pt-intent-text-colors, $intent),
//         map-get($pt-dark-intent-text-colors, $intent)
//       );
//     }
//   }
// }

// @mixin pt-dark-button-outlined() {
//   border-color: rgba($white, 0.4);

//   &:disabled,
//   &:disabled:hover,
//   &.#{$ns}-disabled,
//   &.#{$ns}-disabled:hover {
//     border-color: rgba($white, 0.2);
//   }
// }

// @mixin pt-button-outlined-intent($text-color, $dark-text-color) {
//   border-color: rgba($text-color, $button-outlined-border-intent-opacity);

//   &:disabled,
//   &.#{$ns}-disabled {
//     border-color: rgba($text-color, $button-outlined-border-disabled-intent-opacity);
//   }

//   .#{$ns}-dark & {
//     border-color: rgba($dark-text-color, $button-outlined-border-intent-opacity);

//     &:disabled,
//     &.#{$ns}-disabled {
//       border-color: rgba($dark-text-color, $button-outlined-border-disabled-intent-opacity);
//     }
//   }
// }

export {
  darkGray5 as darkButtonBackgroundColor,
  darkGray2 as darkButtonBackgroundColorActive,
  darkGray4 as darkButtonBackgroundColorHover,
  ptDarkTextColorDisabled as darkButtonColorDisabled,
} from '../common/index.mjs';
