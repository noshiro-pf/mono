import { expect, test } from 'vitest';
import { variance } from './variance.mjs';

test('variance', () => {
  expect(variance([50, 60, 70, 70, 100])).toBe(280);
});
