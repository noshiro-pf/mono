import { dist } from '../../../../num';
import type { Rgb } from '../../../types';
import { epsilon } from '../color-test-values';

export const testRgbEquality = (
  testname: string,
  rgb1: Rgb,
  rgb2: Rgb
): void => {
  test(testname, () => {
    const [r1, g1, b1] = rgb1;
    const [r2, g2, b2] = rgb2;

    expect(dist(r1, r2)).toBeLessThan(epsilon);
    expect(dist(g1, g2)).toBeLessThan(epsilon);
    expect(dist(b1, b2)).toBeLessThan(epsilon);
  });
};
