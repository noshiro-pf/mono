import { hexNumberToStr } from './hex-number-to-str.mjs';

test('hexToStr', () => {
  expect(hexNumberToStr(0x12_34_56)).toBe('#123456');
});
