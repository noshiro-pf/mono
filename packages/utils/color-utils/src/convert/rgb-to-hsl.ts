import {
  Hsl,
  Hsla,
  numberToHue,
  numberToPercent,
  Rgb,
  Rgba,
} from '@mono/ts-utils';

export const rgbToHsl = ([r, g, b]: Rgb): Hsl => {
  const [r01, g01, b01] = [r / 255, g / 255, b / 255];

  const max = Math.max(r01, g01, b01);
  const min = Math.min(r01, g01, b01);
  const l = (max + min) / 2;

  if (max === min) {
    // achromatic
    return [0, 0, numberToPercent(100 * l)];
  }

  const d = max - min;

  let h = 0;

  switch (max) {
    case r01:
      h = (g01 - b01) / d + (g01 < b01 ? 6 : 0);
      break;
    case g01:
      h = (b01 - r01) / d + 2;
      break;
    case b01:
      h = (r01 - g01) / d + 4;
      break;
    default:
      break;
  }
  h /= 6;

  return [
    numberToHue(h * 360),
    numberToPercent(100 * (l > 0.5 ? d / (2 - max - min) : d / (max + min))),
    numberToPercent(100 * l),
  ];
};

export const rgbaToHsla = ([r, g, b, a]: Rgba): Hsla => {
  const [h, s, l] = rgbToHsl([r, g, b]);
  return [h, s, l, a];
};
