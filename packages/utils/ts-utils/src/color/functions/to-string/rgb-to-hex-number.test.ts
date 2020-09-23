import { rgbaToHexNumber, rgbToHexNumber } from './rgb-to-hex-number';

test('rgbToHexNumber', () => {
  expect(rgbToHexNumber([230, 29, 25])).toBe(0xe61d19);
});

test('rgbaToHexNumber', () => {
  expect(rgbaToHexNumber([230, 29, 25, 0.5])).toEqual({
    hex: 0xe61d19,
    alpha: 0.5,
  });
});
