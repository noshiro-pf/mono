import { packageNameOf } from './package-name.mjs';

describe('packageNameOf', () => {
  test.each([
    ['synstate', 'synstate'],
    ['ts-data-forge/internal', 'ts-data-forge'],
    ['@synstate/docs', '@synstate/docs'],
    ['@scope/pkg/sub/path', '@scope/pkg'],
  ])('reads %s as %s', (specifier, name) => {
    assert.strictEqual(packageNameOf(specifier), name);
  });

  test.each([
    './shared.mjs',
    '../paths.mjs',
    '/abs.mjs',
    'node:fs',
    '#configs/rules',
    'file:///repo/rules.mjs',
    'data:text/javascript,export {}',
  ])('reads %s as no package', (specifier) => {
    assert.isUndefined(packageNameOf(specifier));
  });
});
