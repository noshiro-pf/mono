/**
 * The ink for a label chip of GitHub colour `hex` (`RRGGBB`): black or white,
 * whichever contrasts more by WCAG's relative luminance, so that every default
 * GitHub label reads at 4.5:1 or better (spec §7.2).
 */
export const labelInk = (hex: string): '#000' | '#fff' => {
  const luminance = relativeLuminance(hex);

  // Contrast with black is (L + 0.05) / 0.05, with white 1.05 / (L + 0.05).
  return (luminance + 0.05) ** 2 >= 1.05 * 0.05 ? '#000' : '#fff';
};

/** `#RRGGBB` for CSS, or a neutral grey for a colour GitHub did not give. */
export const labelBackground = (hex: string): string =>
  HEX.test(hex) ? (`#${hex}` as const) : '#ededed';

/** WCAG 2's relative luminance of `RRGGBB`; 1 (white) when malformed. */
export const relativeLuminance = (hex: string): number => {
  if (!HEX.test(hex)) {
    return 1;
  }

  const channel = (offset: number): number => {
    const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;

    return value <= 0.039_28 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
};

const HEX = /^[0-9a-f]{6}$/iu;
