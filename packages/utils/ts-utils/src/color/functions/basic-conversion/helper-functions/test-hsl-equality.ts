import { dist } from '../../../../num';
import type { Hsl } from '../../../types';
import { epsilon } from '../color-test-values';

export const testHslEquality = (
  testname: string,
  hsl1: Hsl,
  hsl2: Hsl
): void => {
  test(testname, () => {
    const [h1, s1, l1] = hsl1;
    const [h2, s2, l2] = hsl2;
    expect(dist(h1, h2) < epsilon).toBe(true);
    expect(dist(s1, s2) < epsilon).toBe(true);
    expect(dist(l1, l2) < epsilon).toBe(true);
  });
};
