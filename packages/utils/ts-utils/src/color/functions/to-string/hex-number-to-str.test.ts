import { hexNumberToStr } from './hex-number-to-str';

test('hexToStr', () => {
  expect(hexNumberToStr(0x123456)).toBe('#123456');
});
