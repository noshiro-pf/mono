import { sign } from './sign';

describe('sign', () => {
  test('case 1', () => {
    expect(sign(-2)).toBe(-1);
  });

  test('case 2', () => {
    expect(sign(0)).toBe(0);
  });

  test('case 3', () => {
    expect(sign(2)).toBe(1);
  });
});
