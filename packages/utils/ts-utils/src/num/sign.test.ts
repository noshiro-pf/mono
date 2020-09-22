import { sign } from './sign';

test('sign', () => {
  expect(sign(-2)).toBe(-1);
});

test('sign', () => {
  expect(sign(0)).toBe(0);
});

test('sign', () => {
  expect(sign(2)).toBe(1);
});
