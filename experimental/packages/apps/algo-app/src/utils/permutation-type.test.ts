import type * as t from '@noshiro/io-ts';
import { permutationType } from './permutation-type';

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
          expect(targetType.validate('431234').value).toStrictEqual([
            `The value is expected to be one of the elements contained in { '1234', '1243', '1324', '1342', '1423', '1432', '2134', '2143', '2314', '2341', '2413', '2431', '3124', '3142', '3214', '3241', '3412', '3421', '4123', '4132', '4213', '4231', '4312', '4321' }, but it is actually '"431234"'.`,
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
          expect(targetType.validate('4312').value).toStrictEqual([
            `The value is expected to be one of the elements contained in { '012', '021', '102', '120', '201', '210' }, but it is actually '"4312"'.`,
          ]);
        });
      });
    });
  }
});
