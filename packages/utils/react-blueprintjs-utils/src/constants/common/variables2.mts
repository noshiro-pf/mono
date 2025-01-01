import { hexToRgba, joinCssStr } from '../../utils/index.mjs';
import { ptDarkDividerBlack, ptDividerBlack } from './color-aliases.mjs';
import { black } from './colors.mjs';
import { borderShadow } from './mixins.mjs';
import {
  ptBorderShadowOpacity,
  ptDarkBorderShadowOpacity,
  ptDarkDropShadowOpacity,
  ptDropShadowOpacity,
} from './variables.mjs';

// Elevations
// all shadow lists must be the same length to avoid flicker in transitions.
export const ptElevationShadow0 = joinCssStr(
  `0 0 0 1px ${ptDividerBlack}`,
  `0 0 0 ${hexToRgba(black, 0)}`,
  `0 0 0 ${hexToRgba(black, 0)}`,
);

export const ptElevationShadow1 = joinCssStr(
  borderShadow(ptBorderShadowOpacity),
  `0 0 0 ${hexToRgba(black, 0)}`,
  `0 1px 1px ${hexToRgba(black, ptDropShadowOpacity)}`,
);

export const ptElevationShadow2 = joinCssStr(
  borderShadow(ptBorderShadowOpacity),
  `0 1px 1px ${hexToRgba(black, ptDropShadowOpacity)}`,
  `0 2px 6px ${hexToRgba(black, ptDropShadowOpacity)}`,
);

export const ptElevationShadow3 = joinCssStr(
  borderShadow(ptBorderShadowOpacity),
  `0 2px 4px ${hexToRgba(black, ptDropShadowOpacity)}`,
  `0 8px 24px ${hexToRgba(black, ptDropShadowOpacity)}`,
);

export const ptElevationShadow4 = joinCssStr(
  borderShadow(ptBorderShadowOpacity),
  `0 4px 8px ${hexToRgba(black, ptDropShadowOpacity)}`,
  `0 18px 46px 6px ${hexToRgba(black, ptDropShadowOpacity)}`,
);

export const ptDarkElevationShadow0 = joinCssStr(
  `0 0 0 1px ${ptDarkDividerBlack}`,
  `0 0 0 ${hexToRgba(black, 0)}`,
  `0 0 0 ${hexToRgba(black, 0)}`,
);

export const ptDarkElevationShadow1 = joinCssStr(
  borderShadow(ptDarkBorderShadowOpacity),
  `0 0 0 ${hexToRgba(black, 0)}`,
  `0 1px 1px ${hexToRgba(black, ptDarkDropShadowOpacity)}`,
);

export const ptDarkElevationShadow2 = joinCssStr(
  borderShadow(ptDarkBorderShadowOpacity),
  `0 1px 1px ${hexToRgba(black, ptDarkDropShadowOpacity)}`,
  `0 2px 6px ${hexToRgba(black, ptDarkDropShadowOpacity)}`,
);

export const ptDarkElevationShadow3 = joinCssStr(
  borderShadow(ptDarkBorderShadowOpacity),
  `0 2px 4px ${hexToRgba(black, ptDarkDropShadowOpacity)}`,
  `0 8px 24px ${hexToRgba(black, ptDarkDropShadowOpacity)}`,
);

export const ptDarkElevationShadow4 = joinCssStr(
  borderShadow(ptDarkBorderShadowOpacity),
  `0 4px 8px ${hexToRgba(black, ptDarkDropShadowOpacity)}`,
  `0 18px 46px 6px ${hexToRgba(black, ptDarkDropShadowOpacity)}`,
);

// Transitions
export const ptTransitionEase = `cubic-bezier(0.4, 1, 0.75, 0.9)`;
export const ptTransitionEaseBounce = `cubic-bezier(0.54, 1.12, 0.38, 1.11)`;
export const ptTransitionDuration = '100ms';

// Light theme styles

export const ptInputBoxShadow = joinCssStr(
  `inset ${borderShadow(0.15)}`,
  `inset 0 1px 1px ${hexToRgba(black, ptDropShadowOpacity)}`,
);

export const ptDialogBoxShadow = ptElevationShadow4;
export const ptPopoverBoxShadow = ptElevationShadow3;
export const ptTooltipBoxShadow = ptPopoverBoxShadow;

// Dark theme styles

export const ptDarkInputBoxShadow = joinCssStr(
  `inset ${borderShadow(0.3)}`,
  `inset 0 1px 1px ${hexToRgba(black, ptDarkDropShadowOpacity)}`,
);

export const ptDarkDialogBoxShadow = ptDarkElevationShadow4;
export const ptDarkPopoverBoxShadow = ptDarkElevationShadow3;
export const ptDarkTooltipBoxShadow = ptDarkPopoverBoxShadow;
