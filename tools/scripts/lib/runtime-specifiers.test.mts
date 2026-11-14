import dedent from 'dedent';
import { runtimeImportSpecifiers } from './runtime-specifiers.mjs';

describe('runtimeImportSpecifiers', () => {
  test('reads every import and re-export, in order', () => {
    assert.deepStrictEqual(
      runtimeImportSpecifiers(dedent`
        import { eslintConfigOffForSumiCheck } from '@sumi-lang/cli';
        import {
          eslintConfigForTypeScript,
          type FlatConfig,
        } from 'eslint-config-typed';
        import { Arr } from 'ts-data-forge/array';
        import { local } from './scripts/local.mjs';
        export { shared } from '@scope/eslint-plugin/rules';
      `),
      [
        '@sumi-lang/cli',
        'eslint-config-typed',
        'ts-data-forge/array',
        './scripts/local.mjs',
        '@scope/eslint-plugin/rules',
      ],
    );
  });

  test('reads a dynamic import and an import-equals declaration', () => {
    assert.deepStrictEqual(
      runtimeImportSpecifiers(dedent`
        import type { Shape } from 'shapes';
        import plugin = require('eslint-plugin-legacy');
        export const load = async () => import('@sumi-lang/cli/configs');
        const pattern = /"/u;
        export * as rules from './rules.mjs';
        import defer * as deferred from 'deferred';
        const commonjs = require('eslint-plugin-commonjs');
        const wrapped = await import(('eslint-plugin-wrapped' as string));
      `),
      [
        'eslint-plugin-legacy',
        '@sumi-lang/cli/configs',
        './rules.mjs',
        'deferred',
        'eslint-plugin-commonjs',
        'eslint-plugin-wrapped',
      ],
    );
  });

  test('a type-only import loads nothing', () => {
    assert.deepStrictEqual(
      runtimeImportSpecifiers(dedent`
        import type { ReadonlyRecord } from 'ts-type-forge';
        export type { Shape } from 'shapes';
        import type Legacy = require('legacy');
        type Config = typeof import('eslint-config-typed');
        const config: import('eslint').Linter.Config = {};
        declare module 'augmented' {
          import { Ambient } from 'ambient';
        }
      `),
      [],
    );
  });

  test('a specifier in a comment or a string is not an import', () => {
    assert.deepStrictEqual(
      runtimeImportSpecifiers(dedent`
        // \`import * as Arr from 'ts-data-forge/array'\`, which esbuild tree-shakes
        export default [
          {
            message: "imports only \`Arr\` from 'ts-data-forge/array'; see above",
          },
        ];
      `),
      [],
    );
  });
});
