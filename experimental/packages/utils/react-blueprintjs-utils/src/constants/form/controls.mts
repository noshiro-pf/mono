import { buttonIntents } from '../button/index.mjs';

export const controlCheckedBackgroundColor = buttonIntents.primary[0];
export const controlCheckedBackgroundColorHover = buttonIntents.primary[1];
export const controlCheckedBackgroundColorActive = buttonIntents.primary[2];

// export const controlIndicatorSizePx = ptIconSizeStandardPx;
// export const controlIndicatorSizeLargePx = ptIconSizeLargePx;

export {
  buttonBackgroundColor as controlBackgroundColor,
  buttonBackgroundColorActive as controlBackgroundColorActive,
  buttonBackgroundColorHover as controlBackgroundColorHover,
  darkButtonBackgroundColor as darkControlBackgroundColor,
  darkButtonBackgroundColorActive as darkControlBackgroundColorActive,
  darkButtonBackgroundColorHover as darkControlBackgroundColorHover,
} from '../button/index.mjs';
export { ptGridSizePx as controlIndicatorSpacingPx } from '../common/index.mjs';
