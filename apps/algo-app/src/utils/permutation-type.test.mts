import { expectType } from 'ts-data-forge';
import type * as t from 'ts-fortress';
import { permutationType } from './permutation-type.mjs';

/** The `expectedType` a rejected value is reported against: the members, quoted. */
const asUnionText = (values: readonly string[]): string =>
  values.map((v) => `'${v}'`).join(' | ');

describe('permutationType', () => {
  {
    const target = '1234';

    describe(target, () => {
      const targetType = permutationType<'1234'>(target);

      type TargetType = t.TypeOf<typeof targetType>;

      expectType<
        TargetType,
        | '1234'
        | '1243'
        | '1324'
        | '1342'
        | '1423'
        | '1432'
        | '2134'
        | '2143'
        | '2314'
        | '2341'
        | '2413'
        | '2431'
        | '3124'
        | '3142'
        | '3214'
        | '3241'
        | '3412'
        | '3421'
        | '4123'
        | '4132'
        | '4213'
        | '4231'
        | '4312'
        | '4321'
      >('=');

      expectType<typeof targetType.defaultValue, TargetType>('=');

      describe('is', () => {
        test('truthy case', () => {
          expect(targetType.is('4321')).toBe(true);
        });

        test('falsy case', () => {
          expect(targetType.is('012')).toBe(false);
        });
      });

      describe('validate', () => {
        test('falsy case 1', () => {
          assert.deepStrictEqual(targetType.validate('431234').value, [
            {
              path: [],
              actualValue: '431234',
              expectedType: asUnionText([
                '1234',
                '1243',
                '1324',
                '1342',
                '1423',
                '1432',
                '2134',
                '2143',
                '2314',
                '2341',
                '2413',
                '2431',
                '3124',
                '3142',
                '3214',
                '3241',
                '3412',
                '3421',
                '4123',
                '4132',
                '4213',
                '4231',
                '4312',
                '4321',
              ]),
              typeName: 'permutation(1234)',
              details: undefined,
            },
          ]);
        });
      });
    });
  }

  {
    const target = '012';

    describe(target, () => {
      const targetType = permutationType<'012'>(target);

      type TargetType = t.TypeOf<typeof targetType>;

      expectType<TargetType, '012' | '021' | '102' | '120' | '201' | '210'>(
        '=',
      );

      expectType<typeof targetType.defaultValue, TargetType>('=');

      describe('is', () => {
        test('truthy case', () => {
          expect(targetType.is('012')).toBe(true);
        });

        test('falsy case', () => {
          expect(targetType.is('4321')).toBe(false);
        });
      });

      describe('validate', () => {
        test('falsy case 1', () => {
          assert.deepStrictEqual(targetType.validate('4312').value, [
            {
              path: [],
              actualValue: '4312',
              expectedType: asUnionText([
                '012',
                '021',
                '102',
                '120',
                '201',
                '210',
              ]),
              typeName: 'permutation(012)',
              details: undefined,
            },
          ]);
        });
      });
    });
  }
});
