import { average } from './average.mjs';

describe('average', () => {
  test('case 1', () => {
    expect(average([1, 2, 3])).toBe(2);
  });

  test('case 2', () => {
    expect(average([])).toBe(0);
  });

  test('case 3', () => {
    expect(average([1, 2, 3, 4])).toBe(2.5);
  });
});
