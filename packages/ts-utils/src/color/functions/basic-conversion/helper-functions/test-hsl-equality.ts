import { Hsl } from '../../../../color';
import { dist } from '../../../../num';
import { epsilon } from '../color-test-values';

export const testHslEquality = (name: string, hsl1: Hsl, hsl2: Hsl): void => {
  test(name, () => {
    const [h1, s1, l1] = hsl1;
    const [h2, s2, l2] = hsl2;
    expect(dist(h1, h2) < epsilon).toBe(true);
    expect(dist(s1, s2) < epsilon).toBe(true);
    expect(dist(l1, l2) < epsilon).toBe(true);
  });
};
