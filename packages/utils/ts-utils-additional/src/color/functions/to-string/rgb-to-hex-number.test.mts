import { rgbaToHexNumber, rgbToHexNumber } from './rgb-to-hex-number.mjs';

test('rgbToHexNumber', () => {
  expect(rgbToHexNumber([230, 29, 25])).toBe(0xe6_1d_19);
});

test('rgbaToHexNumber', () => {
  expect(rgbaToHexNumber([230, 29, 25, 0.5])).toStrictEqual({
    hex: 0xe6_1d_19,
    alpha: 0.5,
  });
});
