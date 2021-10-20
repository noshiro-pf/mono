import {
  buttonBackgroundColor,
  buttonBackgroundColorActive,
  buttonBackgroundColorHover,
  buttonIntents,
  darkButtonBackgroundColor,
  darkButtonBackgroundColorActive,
  darkButtonBackgroundColorHover,
} from '../button';
import { ptGridSizePx } from '../common';

export const controlBackgroundColor = buttonBackgroundColor;
export const controlBackgroundColorHover = buttonBackgroundColorHover;
export const controlBackgroundColorActive = buttonBackgroundColorActive;
export const darkControlBackgroundColor = darkButtonBackgroundColor;
export const darkControlBackgroundColorHover = darkButtonBackgroundColorHover;
export const darkControlBackgroundColorActive = darkButtonBackgroundColorActive;

export const controlCheckedBackgroundColor = buttonIntents.primary[0];
export const controlCheckedBackgroundColorHover = buttonIntents.primary[1];
export const controlCheckedBackgroundColorActive = buttonIntents.primary[2];

// export const controlIndicatorSizePx = ptIconSizeStandardPx;
// export const controlIndicatorSizeLargePx = ptIconSizeLargePx;
export const controlIndicatorSpacingPx = ptGridSizePx;
