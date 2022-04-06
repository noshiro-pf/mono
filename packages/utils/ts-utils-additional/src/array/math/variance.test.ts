import { variance } from './variance';

test('variance', () => {
  expect(variance([50, 60, 70, 70, 100])).toBe(280);
});
