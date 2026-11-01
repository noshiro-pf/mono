import { expectType } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import {
  isOptionalProperty,
  optional,
  type OptionalPropertyType,
} from './optional.mjs';
import { record } from './record.mjs';

describe(optional, () => {
  const numberType = number(42);

  const optionalNumber = optional(numberType);

  type OptionalNumber = OptionalPropertyType<typeof numberType>;

  expectType<typeof optionalNumber, OptionalNumber>('=');

  describe('optional function', () => {
    test('creates optional property type', () => {
      assert.deepStrictEqual(optionalNumber, {
        ...numberType,
        optional: true,
      });

      expect(optionalNumber.defaultValue).toBe(42);
    });

    test('preserves original type properties', () => {
      expect(optionalNumber.defaultValue).toBe(42);

      expect(optionalNumber.typeName).toBe('number');
    });
  });

  describe('record shape metadata', () => {
    const Zip = string('0000000', { minLength: 7, maxLength: 7 });

    const Address = record({ zip: Zip });

    test('keeps the nested member types and their constraints reachable', () => {
      const User = record({ address: optional(Address) });

      assert.strictEqual(User.shape.address.shape, Address.shape);

      assert.strictEqual(User.shape.address.shape.zip, Zip);

      assert.strictEqual(User.shape.address.shape.zip.constraints.minLength, 7);

      expectType<typeof User.shape.address.shape.zip.constraints.minLength, 7>(
        '=',
      );
    });

    test('retains the shape when an optional record is wrapped again', () => {
      const wrapped = optional(optional(Address));

      assert.strictEqual(wrapped.shape, Address.shape);

      assert.strictEqual(wrapped.shape.zip, Zip);
    });

    test('preserves the shape without reading a forced-undefined default', () => {
      const guarded = {
        ...Address,
        get defaultValue(): typeof Address.defaultValue {
          return assert.fail();
        },
      } as const;

      const wrapped = optional(guarded, { forceUndefinedDefault: true });

      assert.isUndefined(wrapped.defaultValue);

      assert.strictEqual(wrapped.shape, Address.shape);

      assert.strictEqual(wrapped.shape.zip.constraints.maxLength, 7);
    });
  });

  describe('carried-over properties', () => {
    test('keeps a property attached by another wrapper', () => {
      const tagged = { ...numberType, tag: 'price' } as const;

      const wrapped = optional(tagged);

      assert.strictEqual(wrapped.tag, 'price');

      expectType<typeof wrapped.tag, 'price'>('=');
    });

    test('keeps the members a type inherits through its prototype', () => {
      // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
      const inherited = Object.create(numberType) as typeof numberType;

      const wrapped = optional(inherited);

      assert.isTrue(wrapped.is(1));

      assert.strictEqual(wrapped.typeName, 'number');

      assert.isTrue(record({ x: wrapped }).is({}));

      assert.isFalse(record({ x: wrapped }).is({ x: 'a' }));
    });

    test('leaves a lazy default unevaluated until it is read', () => {
      const computeDefault = vi.fn((): number => 7);

      const lazy = {
        ...numberType,
        get defaultValue(): number {
          return computeDefault();
        },
      } as const;

      const wrapped = optional(lazy);

      expect(computeDefault).not.toHaveBeenCalled();

      assert.strictEqual(wrapped.defaultValue, 7);

      expect(computeDefault).toHaveBeenCalledExactlyOnceWith();
    });
  });

  describe(isOptionalProperty, () => {
    test('returns true for optional property', () => {
      assert.isTrue(isOptionalProperty(optionalNumber));
    });

    test('returns false for non-optional property', () => {
      assert.isFalse(isOptionalProperty(numberType));
    });

    test('returns false for object without optional key', () => {
      const { optional: _, ...obj } = { ...numberType } as const;

      assert.isFalse(isOptionalProperty(obj));
    });
  });
});
