import { expect, test } from 'vitest';
import { hexStrToNumber } from './hex-str-to-number.mjs';

test('hexStrToNumber', () => {
  expect(hexStrToNumber('#123456')).toBe(0x12_34_56);
});
