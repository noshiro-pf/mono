import { hexStrToNumber } from './hex-str-to-number';

test('hexStrToNumber', () => {
  expect(hexStrToNumber('#123456')).toBe(0x12_34_56);
});
