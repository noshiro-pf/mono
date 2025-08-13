import { expectType } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import {
  isOptionalProperty,
  optional,
  type OptionalPropertyType,
} from './optional.mjs';

describe('optional', () => {
  const numberType = number(42);
  const optionalNumber = optional(numberType);

  type OptionalNumber = OptionalPropertyType<typeof numberType>;

  expectType<typeof optionalNumber, OptionalNumber>('=');

  describe('optional function', () => {
    test('creates optional property type', () => {
      expect(optionalNumber).toStrictEqual({
        ...numberType,
        optional: true,
      });
    });

    test('preserves original type properties', () => {
      expect(optionalNumber.defaultValue).toBe(42);
      expect(optionalNumber.typeName).toBe('number');
    });
  });

  describe('isOptionalProperty', () => {
    test('returns true for optional property', () => {
      expect(isOptionalProperty(optionalNumber)).toBe(true);
    });

    test('returns false for non-optional property', () => {
      expect(isOptionalProperty(numberType)).toBe(false);
    });

    test('returns false for object without optional key', () => {
      const { optional: _, ...obj } = { ...numberType };

      expect(isOptionalProperty(obj)).toBe(false);
    });
  });
});
