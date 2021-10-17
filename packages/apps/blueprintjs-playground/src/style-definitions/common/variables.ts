export const ptGridSizePx = 10;

export const ptFontFamily = `
    -apple-system,
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "Open Sans",
    "Helvetica Neue",
    "Icons16",
    sans-serif;`;

export const ptFontSizePx = ptGridSizePx * 1.4;
export const ptFontSizeLargePx = ptGridSizePx * 1.6;
export const ptFontSizeSmallPx = ptGridSizePx * 1.2;

// a little bit extra to ensure the height comes out to just over 18px (and browser rounds to 18px)
export const ptLineHeightPx = (ptGridSizePx * 1.8) / ptFontSizePx + 0.0001;

// Icon variables

export const icons16Family = 'Icons16';
export const icons20Family = 'Icons20';

export const ptIconSizeStandardPx = 16;
export const ptIconSizeLargePx = 20;

// Grids & dimensions

export const ptBorderRadiusPx = Math.floor(ptGridSizePx / 3);

// Buttons

export const ptButtonHeightPx = ptGridSizePx * 3;
export const ptButtonHeightSmallPx = ptGridSizePx * 2.4;
export const ptButtonHeightSmallerPx = ptGridSizePx * 2;
export const ptButtonHeightLargePx = ptGridSizePx * 4;

// Inputs
export const ptInputHeightPx = ptGridSizePx * 3;
export const ptInputHeightLargePx = ptGridSizePx * 4;
export const ptInputHeightSmallPx = ptGridSizePx * 2.4;

// Others
export const ptNavbarHeightPx = ptGridSizePx * 5;

// Z-indices
export const ptZIndexBase = 0;
export const ptZIndexContent = ptZIndexBase + 10;
export const ptZIndexOverlay = ptZIndexContent + 10;
export const ptZIndexDialogHeader = ptZIndexOverlay + 10;

// Shadow opacities
export const ptBorderShadowOpacity = 0.1;
export const ptDropShadowOpacity = 0.2;
export const ptDarkBorderShadowOpacity = ptBorderShadowOpacity * 2;
export const ptDarkDropShadowOpacity = ptDropShadowOpacity * 2;
