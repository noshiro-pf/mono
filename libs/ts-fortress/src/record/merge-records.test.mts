import { Arr, asUint32, expectType, type Int, Result } from 'ts-data-forge';
import { array } from '../array/index.mjs';
import { intersection, union } from '../compose/index.mjs';
import { enumType } from '../enum/index.mjs';
import { toJsonSchema } from '../json-schema/index.mjs';
import { annotate, literal, recursion } from '../other-types/index.mjs';
import { int } from '../predefined/index.mjs';
import { boolean, nullType, number, string } from '../primitives/index.mjs';
import type { Type, TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { mergeRecords } from './merge-records.mjs';
import { optional } from './optional.mjs';
import { partial } from './partial.mjs';
import { record, strictRecord } from './record.mjs';
import { required } from './required.mjs';

describe(mergeRecords, () => {
  const targetType = mergeRecords([
    record({ x: number(), y: number() }),
    record({ z: number(), w: number() }),
  ]);

  type TargetType = TypeOf<typeof targetType>;

  describe('type checking for arguments', () => {
    test('argument must be a non-empty array of record types', () => {
      expect(() => {
        // @ts-expect-error should pass record type
        mergeRecords([record({ x: number(), y: number() }), number()]);
      }).toThrow(
        'Expected a record type but received a non-record type in mergeRecords',
      );
    });

    // Default (no explicit excessProperty) with record() inputs → DeriveStrictestEP = 'allow'
    expectType<
      TargetType,
      Readonly<{
        x: number;
        y: number;
        z: number;
        w: number;
      }>
    >('=');

    expectType<typeof targetType.defaultValue, TypeOf<typeof targetType>>('=');

    // excessProperty: 'allow' → type includes UnknownRecord
    // (consistent with RecordType<R, 'allow'>)
    const _allowType = mergeRecords(
      [record({ x: number() }), record({ y: number() })],
      { excessProperty: 'allow' },
    );

    type AllowType = TypeOf<typeof _allowType>;

    expectType<AllowType, Readonly<{ x: number; y: number }>>('=');

    // excessProperty: 'reject' → exact type (no UnknownRecord)
    const _errorType = mergeRecords(
      [record({ x: number() }), record({ y: number() })],
      { excessProperty: 'reject' },
    );

    type ErrorType = TypeOf<typeof _errorType>;

    expectType<ErrorType, Readonly<{ x: number; y: number }>>('=');
  });

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = { x: 0, y: 1, z: 2, w: 3 } as const;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('truthy case 2', () => {
      const x: unknown = { x: 0, y: 1, z: 2, w: 3, a: 0, b: 0 } as const;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = { x: 0, y: 1 } as const;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate({ x: 0, y: 1, z: 2, w: 3 });

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue, { x: 0, y: 1, z: 2, w: 3 });
    });

    test('validate returns input as-is for OK cases', () => {
      const input = { x: 0, y: 1, z: 2, w: 3 } as const;

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case', () => {
      const result = targetType.validate({ x: 0, y: 1 });

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: ['z'],
          actualValue: { x: 0, y: 1 },
          typeName: '({ x: number, y: number } & { z: number, w: number })',
          expectedType: '({ x: number, y: number } & { z: number, w: number })',
          details: {
            kind: 'missing-key',
            key: 'z',
          },
        },
        {
          path: ['w'],
          actualValue: { x: 0, y: 1 },
          typeName: '({ x: number, y: number } & { z: number, w: number })',
          expectedType: '({ x: number, y: number } & { z: number, w: number })',
          details: {
            kind: 'missing-key',
            key: 'w',
          },
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error at z: missing required key "z".',
        'Error at w: missing required key "w".',
      ]);
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = { x: 0, y: 1, z: 2, w: 3 } as const;

      assert.deepStrictEqual(targetType.fill(x), { x: 0, y: 1, z: 2, w: 3 });
    });

    test('fill with the default value', () => {
      const x = { x: 0, y: 1, z: 2 } as const;

      assert.deepStrictEqual(targetType.fill(x), { x: 0, y: 1, z: 2, w: 0 });
    });
  });

  describe('with strictRecord', () => {
    const strictTargetType = mergeRecords([
      strictRecord({ x: number(), y: number() }),
      strictRecord({ z: number(), w: number() }),
    ]);

    type StrictTargetType = TypeOf<typeof strictTargetType>;

    expectType<
      StrictTargetType,
      Readonly<{
        x: number;
        y: number;
        z: number;
        w: number;
      }>
    >('=');

    describe('is', () => {
      test('truthy case', () => {
        assert.isTrue(strictTargetType.is({ x: 0, y: 1, z: 2, w: 3 }));
      });

      test('rejects excess properties', () => {
        assert.isFalse(strictTargetType.is({ x: 0, y: 1, z: 2, w: 3, a: 0 }));
      });

      test('rejects missing properties', () => {
        assert.isFalse(strictTargetType.is({ x: 0, y: 1 }));
      });
    });

    describe('validate', () => {
      test('truthy case', () => {
        const result = strictTargetType.validate({ x: 0, y: 1, z: 2, w: 3 });

        assert.isTrue(Result.isOk(result));

        const resultValue = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue, { x: 0, y: 1, z: 2, w: 3 });
      });

      test('validate returns input as-is for OK cases', () => {
        const input = { x: 0, y: 1, z: 2, w: 3 } as const;

        const result = strictTargetType.validate(input);

        assert.isTrue(Result.isOk(result));

        expect(Result.unwrapThrow(result)).toBe(input);
      });

      test('rejects non-record input', () => {
        const result = strictTargetType.validate('not a record');

        assert.isTrue(Result.isErr(result));
      });

      test('rejects excess properties', () => {
        const result = strictTargetType.validate({
          x: 0,
          y: 1,
          z: 2,
          w: 3,
          extra: 99,
        });

        assert.isTrue(Result.isErr(result));

        const errors = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(validationErrorsToMessages(errors), [
          'Error at extra: excess property "extra" is not allowed.',
        ]);
      });

      test('rejects missing properties', () => {
        const result = strictTargetType.validate({ x: 0, y: 1 });

        assert.isTrue(Result.isErr(result));

        const errors = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(validationErrorsToMessages(errors), [
          'Error at z: missing required key "z".',
          'Error at w: missing required key "w".',
        ]);
      });
    });

    describe('fill', () => {
      test('noop', () => {
        const x: unknown = { x: 0, y: 1, z: 2, w: 3 } as const;

        assert.deepStrictEqual(strictTargetType.fill(x), {
          x: 0,
          y: 1,
          z: 2,
          w: 3,
        });
      });

      test('fill with the default value', () => {
        const x = { x: 0, y: 1, z: 2 } as const;

        assert.deepStrictEqual(strictTargetType.fill(x), {
          x: 0,
          y: 1,
          z: 2,
          w: 0,
        });
      });
    });
  });

  describe('additional test cases', () => {
    test('merging with union variants', () => {
      const Base = strictRecord({ name: string() });

      const VariantA = strictRecord({ a: number() });

      const VariantB = strictRecord({ b: number() });

      const Variants = union([VariantA, VariantB]);

      const Merged = mergeRecords([Base, Variants]);

      expectType<
        TypeOf<typeof Merged>,
        Readonly<({ a: number } | { b: number }) & { name: string }>
      >('=');

      expectType<
        TypeOf<typeof Merged>,
        Readonly<{ name: string; a: number } | { name: string; b: number }>
      >('=');

      assert.isTrue(Merged.is({ name: 'x', a: 1 }));

      assert.isTrue(Merged.is({ name: 'x', b: 2 }));
    });

    test('merging multiple unions', () => {
      const Base = record({ id: string() });

      const TypeVariant = union([
        record({ type: literal('A') }),
        record({ type: literal('B') }),
      ]);

      const StatusVariant = union([
        record({ status: literal('active') }),
        record({ status: literal('inactive') }),
      ]);

      const Merged = mergeRecords([Base, TypeVariant, StatusVariant]);

      expectType<
        TypeOf<typeof Merged>,
        Readonly<
          | { id: string; type: 'A'; status: 'active' }
          | { id: string; type: 'A'; status: 'inactive' }
          | { id: string; type: 'B'; status: 'active' }
          | { id: string; type: 'B'; status: 'inactive' }
        >
      >('=');

      // All 4 combinations should be valid
      assert.isTrue(Merged.is({ id: '1', type: 'A', status: 'active' }));

      assert.isTrue(Merged.is({ id: '2', type: 'A', status: 'inactive' }));

      assert.isTrue(Merged.is({ id: '3', type: 'B', status: 'active' }));

      assert.isTrue(Merged.is({ id: '4', type: 'B', status: 'inactive' }));

      // Invalid combinations should fail
      assert.isFalse(Merged.is({ id: '5', type: 'A' }));

      assert.isFalse(Merged.is({ id: '6', status: 'active' }));

      assert.isFalse(Merged.is({ id: '7', type: 'C', status: 'active' }));
    });

    test('merging union with intersection', () => {
      const Base = record({ base: string() });

      const PropA = record({ a: number() });

      const PropB = record({ b: number() });

      const Combined = intersection(
        [PropA, PropB],
        record({ a: number(), b: number() }),
      );

      const Variant = union([
        record({ variant: literal('X') }),
        record({ variant: literal('Y') }),
      ]);

      const Merged = mergeRecords([Base, Combined, Variant]);

      expectType<
        TypeOf<typeof Merged>,
        Readonly<
          | { base: string; a: number; b: number; variant: 'X' }
          | { base: string; a: number; b: number; variant: 'Y' }
        >
      >('=');

      assert.isTrue(Merged.is({ base: 'test', a: 1, b: 2, variant: 'X' }));

      assert.isTrue(Merged.is({ base: 'test', a: 3, b: 4, variant: 'Y' }));

      assert.isFalse(Merged.is({ base: 'test', a: 1, variant: 'X' }));

      assert.isFalse(Merged.is({ base: 'test', b: 2, variant: 'Y' }));
    });

    test('nested union structure', () => {
      const Inner1 = union([
        record({ inner: literal('a') }),
        record({ inner: literal('b') }),
      ]);

      const Inner2 = union([
        record({ value: literal(1) }),
        record({ value: literal(2) }),
      ]);

      const Outer = union([Inner1, Inner2]);

      const Base = record({ id: string() });

      const Merged = mergeRecords([Base, Outer]);

      expectType<
        TypeOf<typeof Merged>,
        Readonly<
          | { id: string; inner: 'a' }
          | { id: string; inner: 'b' }
          | { id: string; value: 1 }
          | { id: string; value: 2 }
        >
      >('=');

      // Should accept all 4 variants
      assert.isTrue(Merged.is({ id: 'x', inner: 'a' }));

      assert.isTrue(Merged.is({ id: 'x', inner: 'b' }));

      assert.isTrue(Merged.is({ id: 'x', value: 1 }));

      assert.isTrue(Merged.is({ id: 'x', value: 2 }));

      assert.isFalse(Merged.is({ id: 'x', inner: 'c' }));

      assert.isFalse(Merged.is({ id: 'x', value: 3 }));
    });

    test('complex intersection of unions', () => {
      const Color = union([
        record({ color: literal('red') }),
        record({ color: literal('blue') }),
      ]);

      const Size = union([
        record({ size: literal('small') }),
        record({ size: literal('large') }),
      ]);

      const ColorSize = intersection(
        [Color, Size],
        record({ color: literal('red'), size: literal('small') }),
      );

      const Base = record({ name: string() });

      const Merged = mergeRecords([Base, ColorSize]);

      expectType<
        TypeOf<typeof Merged>,
        Readonly<
          | { name: string; color: 'red'; size: 'small' }
          | { name: string; color: 'red'; size: 'large' }
          | { name: string; color: 'blue'; size: 'small' }
          | { name: string; color: 'blue'; size: 'large' }
        >
      >('=');

      // All 4 color-size combinations should be valid
      assert.isTrue(Merged.is({ name: 'item', color: 'red', size: 'small' }));

      assert.isTrue(Merged.is({ name: 'item', color: 'red', size: 'large' }));

      assert.isTrue(Merged.is({ name: 'item', color: 'blue', size: 'small' }));

      assert.isTrue(Merged.is({ name: 'item', color: 'blue', size: 'large' }));
    });

    test('three-way union merge', () => {
      const V1 = record({ type: literal('type1'), data1: string() });

      const V2 = record({ type: literal('type2'), data2: number() });

      const V3 = record({ type: literal('type3'), data3: boolean() });

      const Variants = union([V1, V2, V3]);

      const Common = record({ id: string(), timestamp: number() });

      const Merged = mergeRecords([Common, Variants]);

      expectType<
        TypeOf<typeof Merged>,
        Readonly<
          | { id: string; timestamp: number; type: 'type1'; data1: string }
          | { id: string; timestamp: number; type: 'type2'; data2: number }
          | { id: string; timestamp: number; type: 'type3'; data3: boolean }
        >
      >('=');

      assert.isTrue(
        Merged.is({ id: '1', timestamp: 100, type: 'type1', data1: 'hello' }),
      );

      assert.isTrue(
        Merged.is({ id: '2', timestamp: 200, type: 'type2', data2: 42 }),
      );

      assert.isTrue(
        Merged.is({ id: '3', timestamp: 300, type: 'type3', data3: true }),
      );

      assert.isFalse(
        Merged.is({ id: '4', timestamp: 400, type: 'type1', data2: 99 }),
      );
    });

    test('multi-level nested structure: union of intersections', () => {
      const Base = record({ id: string() });

      const Tag = union([
        record({ tag: literal('public') }),
        record({ tag: literal('private') }),
      ]);

      const Status = union([
        record({ status: literal('active') }),
        record({ status: literal('archived') }),
      ]);

      // Create intersection of unions: Tag & Status
      const TagStatus = intersection(
        [Tag, Status],
        record({ tag: literal('public'), status: literal('active') }),
      );

      // Merge Base with the intersection of unions
      const Merged = mergeRecords([Base, TagStatus]);

      expectType<
        TypeOf<typeof Merged>,
        Readonly<
          | { id: string; tag: 'public'; status: 'active' }
          | { id: string; tag: 'public'; status: 'archived' }
          | { id: string; tag: 'private'; status: 'active' }
          | { id: string; tag: 'private'; status: 'archived' }
        >
      >('=');

      // Should create 4 variants: 2 tags × 2 statuses
      assert.isTrue(Merged.is({ id: '1', tag: 'public', status: 'active' }));

      assert.isTrue(Merged.is({ id: '2', tag: 'public', status: 'archived' }));

      assert.isTrue(Merged.is({ id: '3', tag: 'private', status: 'active' }));

      assert.isTrue(Merged.is({ id: '4', tag: 'private', status: 'archived' }));

      assert.isFalse(Merged.is({ id: '5', tag: 'public' }));

      assert.isFalse(Merged.is({ id: '6', status: 'active' }));
    });

    test('union of merged records', () => {
      const BaseA = record({ type: literal('A'), value: number() });

      const ExtA = record({ extA: string() });

      const MergedA = mergeRecords([BaseA, ExtA]);

      const BaseB = record({ type: literal('B'), count: number() });

      const ExtB = record({ extB: boolean() });

      const MergedB = mergeRecords([BaseB, ExtB]);

      const Combined = union([MergedA, MergedB]);

      expectType<
        TypeOf<typeof Combined>,
        Readonly<
          | { type: 'A'; value: number; extA: string }
          | { type: 'B'; count: number; extB: boolean }
        >
      >('=');

      assert.isTrue(Combined.is({ type: 'A', value: 10, extA: 'hello' }));

      assert.isTrue(Combined.is({ type: 'B', count: 5, extB: true }));

      assert.isFalse(Combined.is({ type: 'A', count: 5, extA: 'hello' }));

      assert.isFalse(Combined.is({ type: 'B', value: 10, extB: true }));
    });

    test('intersection of merged records', () => {
      const Common = record({ id: string() });

      const PartA = record({ a: number() });

      const MergedA = mergeRecords([Common, PartA]);

      const PartB = record({ b: string() });

      const MergedB = mergeRecords([Common, PartB]);

      const Intersected = intersection(
        [MergedA, MergedB],
        record({ id: string(), a: number(), b: string() }),
      );

      expectType<
        TypeOf<typeof Intersected>,
        Readonly<{ id: string; a: number; b: string }>
      >('=');

      assert.isTrue(Intersected.is({ id: 'x', a: 1, b: 'hello' }));

      assert.isFalse(Intersected.is({ id: 'x', a: 1 }));

      assert.isFalse(Intersected.is({ id: 'x', b: 'hello' }));
    });

    test('deeply nested: mergeRecords of union of intersections', () => {
      // Create small building blocks
      const Base = record({ id: number() });

      const TypeA = record({ type: literal('A') });

      const TypeB = record({ type: literal('B') });

      const PropX = record({ x: string() });

      const PropY = record({ y: string() });

      // Create intersections: TypeA & PropX, TypeB & PropY
      const VariantA = intersection(
        [TypeA, PropX],
        record({ type: literal('A'), x: string() }),
      );

      const VariantB = intersection(
        [TypeB, PropY],
        record({ type: literal('B'), y: string() }),
      );

      // Create union of intersections
      const Variants = union([VariantA, VariantB]);

      // Merge with Base
      const Final = mergeRecords([Base, Variants]);

      expectType<
        TypeOf<typeof Final>,
        Readonly<
          | { id: number; type: 'A'; x: string }
          | { id: number; type: 'B'; y: string }
        >
      >('=');

      assert.isTrue(Final.is({ id: 1, type: 'A', x: 'hello' }));

      assert.isTrue(Final.is({ id: 2, type: 'B', y: 'world' }));

      assert.isFalse(Final.is({ id: 3, type: 'A', y: 'wrong' }));

      assert.isFalse(Final.is({ id: 4, type: 'B', x: 'wrong' }));

      assert.isFalse(Final.is({ id: 5, type: 'A' }));
    });

    test('cartesian product expansion: 3 unions merged', () => {
      const DimA = union([
        record({ a: literal('a1') }),
        record({ a: literal('a2') }),
      ]);

      const DimB = union([
        record({ b: literal('b1') }),
        record({ b: literal('b2') }),
      ]);

      const DimC = union([
        record({ c: literal('c1') }),
        record({ c: literal('c2') }),
      ]);

      // Should create 2³ = 8 combinations
      const Merged = mergeRecords([DimA, DimB, DimC]);

      expectType<
        TypeOf<typeof Merged>,
        Readonly<
          | { a: 'a1'; b: 'b1'; c: 'c1' }
          | { a: 'a1'; b: 'b1'; c: 'c2' }
          | { a: 'a1'; b: 'b2'; c: 'c1' }
          | { a: 'a1'; b: 'b2'; c: 'c2' }
          | { a: 'a2'; b: 'b1'; c: 'c1' }
          | { a: 'a2'; b: 'b1'; c: 'c2' }
          | { a: 'a2'; b: 'b2'; c: 'c1' }
          | { a: 'a2'; b: 'b2'; c: 'c2' }
        >
      >('=');

      // Verify all 8 combinations
      assert.isTrue(Merged.is({ a: 'a1', b: 'b1', c: 'c1' }));

      assert.isTrue(Merged.is({ a: 'a1', b: 'b1', c: 'c2' }));

      assert.isTrue(Merged.is({ a: 'a1', b: 'b2', c: 'c1' }));

      assert.isTrue(Merged.is({ a: 'a1', b: 'b2', c: 'c2' }));

      assert.isTrue(Merged.is({ a: 'a2', b: 'b1', c: 'c1' }));

      assert.isTrue(Merged.is({ a: 'a2', b: 'b1', c: 'c2' }));

      assert.isTrue(Merged.is({ a: 'a2', b: 'b2', c: 'c1' }));

      assert.isTrue(Merged.is({ a: 'a2', b: 'b2', c: 'c2' }));

      // Invalid combinations
      assert.isFalse(Merged.is({ a: 'a1', b: 'b1' }));

      assert.isFalse(Merged.is({ a: 'a3', b: 'b1', c: 'c1' }));
    });

    test('complex nesting: union of mergeRecords of intersections', () => {
      const CommonFields = record({ timestamp: number() });

      const TypeField = record({ type: literal('event') });

      const EventVariantA = record({ eventType: literal('click') });

      const EventVariantB = record({ eventType: literal('hover') });

      const EventType = union([EventVariantA, EventVariantB]);

      // Merge TypeField with EventType
      const EventWithType = mergeRecords([TypeField, EventType]);

      // Create another branch
      const DataFieldA = record({
        type: literal('data'),
        format: literal('json'),
      });

      const DataFieldB = record({
        type: literal('data'),
        format: literal('xml'),
      });

      const DataType = union([DataFieldA, DataFieldB]);

      // Combine both branches
      const AllTypes = union([EventWithType, DataType]);

      // Merge with common fields
      const Final = mergeRecords([CommonFields, AllTypes]);

      expectType<
        TypeOf<typeof Final>,
        Readonly<
          | { timestamp: number; type: 'event'; eventType: 'click' }
          | { timestamp: number; type: 'event'; eventType: 'hover' }
          | { timestamp: number; type: 'data'; format: 'json' }
          | { timestamp: number; type: 'data'; format: 'xml' }
        >
      >('=');

      // Event variants
      assert.isTrue(
        Final.is({ timestamp: 100, type: 'event', eventType: 'click' }),
      );

      assert.isTrue(
        Final.is({ timestamp: 200, type: 'event', eventType: 'hover' }),
      );

      // Data variants
      assert.isTrue(Final.is({ timestamp: 300, type: 'data', format: 'json' }));

      assert.isTrue(Final.is({ timestamp: 400, type: 'data', format: 'xml' }));

      // Invalid combinations
      assert.isFalse(
        Final.is({ timestamp: 500, type: 'event', format: 'json' }),
      );

      assert.isFalse(
        Final.is({ timestamp: 600, type: 'data', eventType: 'click' }),
      );
    });

    test('intersection of unions merged together', () => {
      const ColorDim = union([
        record({ color: literal('red') }),
        record({ color: literal('blue') }),
        record({ color: literal('green') }),
      ]);

      const SizeDim = union([
        record({ size: literal('S') }),
        record({ size: literal('M') }),
        record({ size: literal('L') }),
      ]);

      // Create all combinations: 3 colors × 3 sizes = 9 variants
      const Attributes = intersection(
        [ColorDim, SizeDim],
        record({ color: literal('red'), size: literal('S') }),
      );

      const Product = record({ sku: string(), price: number() });

      const ProductWithAttributes = mergeRecords([Product, Attributes]);

      expectType<
        TypeOf<typeof ProductWithAttributes>,
        Readonly<
          | { sku: string; price: number; color: 'red'; size: 'S' }
          | { sku: string; price: number; color: 'red'; size: 'M' }
          | { sku: string; price: number; color: 'red'; size: 'L' }
          | { sku: string; price: number; color: 'blue'; size: 'S' }
          | { sku: string; price: number; color: 'blue'; size: 'M' }
          | { sku: string; price: number; color: 'blue'; size: 'L' }
          | { sku: string; price: number; color: 'green'; size: 'S' }
          | { sku: string; price: number; color: 'green'; size: 'M' }
          | { sku: string; price: number; color: 'green'; size: 'L' }
        >
      >('=');

      // Verify some combinations
      assert.isTrue(
        ProductWithAttributes.is({
          sku: 'P001',
          price: 100,
          color: 'red',
          size: 'S',
        }),
      );

      assert.isTrue(
        ProductWithAttributes.is({
          sku: 'P002',
          price: 150,
          color: 'blue',
          size: 'M',
        }),
      );

      assert.isTrue(
        ProductWithAttributes.is({
          sku: 'P003',
          price: 200,
          color: 'green',
          size: 'L',
        }),
      );

      assert.isFalse(
        ProductWithAttributes.is({
          sku: 'P004',
          price: 120,
          color: 'yellow',
          size: 'M',
        }),
      );
    });
  });

  describe('recursion combinations', () => {
    test('recursion with union in mergeRecords', () => {
      type TreeNode = Readonly<{
        value: number;
        children: readonly TreeNode[];
      }>;

      const TreeNodeType: Type<TreeNode> = recursion<TreeNode>('TreeNode', () =>
        record({ value: number(), children: array(TreeNodeType) }),
      );

      const TypeA = record({ type: literal('A') });

      const TypeB = record({ type: literal('B') });

      const TypeVariant = union([TypeA, TypeB]);

      const Final = mergeRecords([TreeNodeType, TypeVariant]);

      expectType<
        TypeOf<typeof Final>,
        Readonly<
          | { value: number; children: readonly TreeNode[]; type: 'A' }
          | { value: number; children: readonly TreeNode[]; type: 'B' }
        >
      >('=');

      assert.isTrue(
        Final.is({
          value: 1,
          children: [{ value: 2, children: [] }],
          type: 'A',
        }),
      );

      assert.isTrue(Final.is({ value: 3, children: [], type: 'B' }));
    });

    test('union → recursion → mergeRecords', () => {
      const Var1 = record({ variant: literal('v1') });

      const Var2 = record({ variant: literal('v2') });

      const Variants = union([Var1, Var2]);

      type RecType = Readonly<
        | { variant: 'v1'; items: readonly RecType[] }
        | { variant: 'v2'; items: readonly RecType[] }
      >;

      const RecursiveType: Type<RecType> = recursion<RecType>('RecType', () =>
        mergeRecords([Variants, record({ items: array(RecursiveType) })]),
      );

      const Base = record({ id: number() });

      const Final = mergeRecords([Base, RecursiveType]);

      expectType<
        TypeOf<typeof Final>,
        Readonly<
          | { id: number; variant: 'v1'; items: readonly RecType[] }
          | { id: number; variant: 'v2'; items: readonly RecType[] }
        >
      >('=');

      assert.isTrue(
        Final.is({
          id: 1,
          variant: 'v1',
          items: [{ variant: 'v2', items: [] }],
        }),
      );

      assert.isTrue(Final.is({ id: 2, variant: 'v2', items: [] }));
    });

    test('intersection → recursion → mergeRecords', () => {
      const Part1 = record({ a: number() });

      const Part2 = record({ b: string() });

      const BaseInt = intersection(
        [Part1, Part2],
        record({ a: number(), b: string() }),
      );

      type RecData = Readonly<{
        a: number;
        b: string;
        children: readonly RecData[];
      }>;

      const RecursiveType: Type<RecData> = recursion<RecData>('RecData', () =>
        mergeRecords([BaseInt, record({ children: array(RecursiveType) })]),
      );

      const Extra = record({ id: string() });

      const Final = mergeRecords([Extra, RecursiveType]);

      expectType<
        TypeOf<typeof Final>,
        Readonly<{
          id: string;
          a: number;
          b: string;
          children: readonly RecData[];
        }>
      >('=');

      assert.isTrue(
        Final.is({
          id: 'test',
          a: 1,
          b: 'hello',
          children: [{ a: 2, b: 'nested', children: [] }],
        }),
      );
    });

    test('mergeRecords → recursion → union', () => {
      const Base1 = record({ prop1: string() });

      const Base2 = record({ prop2: number() });

      const MergedBase = mergeRecords([Base1, Base2]);

      type RecType = Readonly<{
        prop1: string;
        prop2: number;
        refs: readonly RecType[];
      }>;

      const RecursiveType: Type<RecType> = recursion<RecType>('RecType', () =>
        mergeRecords([MergedBase, record({ refs: array(RecursiveType) })]),
      );

      const Var1 = record({ variant: literal('v1') });

      const Var2 = record({ variant: literal('v2') });

      const Options = union([Var1, Var2]);

      const Final = mergeRecords([RecursiveType, Options]);

      expectType<
        TypeOf<typeof Final>,
        Readonly<
          | {
              prop1: string;
              prop2: number;
              refs: readonly RecType[];
              variant: 'v1';
            }
          | {
              prop1: string;
              prop2: number;
              refs: readonly RecType[];
              variant: 'v2';
            }
        >
      >('=');

      assert.isTrue(
        Final.is({
          prop1: 'test',
          prop2: 42,
          refs: [{ prop1: 'nested', prop2: 10, refs: [] }],
          variant: 'v1',
        }),
      );

      assert.isTrue(
        Final.is({ prop1: 'test', prop2: 20, refs: [], variant: 'v2' }),
      );
    });

    test('complex: intersection of unions with recursion', () => {
      const Color = union([
        record({ color: literal('red') }),
        record({ color: literal('blue') }),
      ]);

      const Size = union([
        record({ size: literal('S') }),
        record({ size: literal('M') }),
      ]);

      const Attributes = intersection(
        [Color, Size],
        record({ color: literal('red'), size: literal('S') }),
      );

      type RecProduct = Readonly<
        | { color: 'red'; size: 'S'; related: readonly RecProduct[] }
        | { color: 'red'; size: 'M'; related: readonly RecProduct[] }
        | { color: 'blue'; size: 'S'; related: readonly RecProduct[] }
        | { color: 'blue'; size: 'M'; related: readonly RecProduct[] }
      >;

      const RecursiveProduct: Type<RecProduct> = recursion<RecProduct>(
        'RecProduct',
        () =>
          mergeRecords([
            Attributes,
            record({ related: array(RecursiveProduct) }),
          ]),
      );

      const Base = record({ sku: string() });

      const Final = mergeRecords([Base, RecursiveProduct]);

      expectType<
        TypeOf<typeof Final>,
        Readonly<
          | {
              sku: string;
              color: 'red';
              size: 'S';
              related: readonly RecProduct[];
            }
          | {
              sku: string;
              color: 'red';
              size: 'M';
              related: readonly RecProduct[];
            }
          | {
              sku: string;
              color: 'blue';
              size: 'S';
              related: readonly RecProduct[];
            }
          | {
              sku: string;
              color: 'blue';
              size: 'M';
              related: readonly RecProduct[];
            }
        >
      >('=');

      assert.isTrue(
        Final.is({
          sku: 'P001',
          color: 'red',
          size: 'S',
          related: [{ color: 'blue', size: 'M', related: [] }],
        }),
      );
    });
  });

  describe('negative cases for complex compositions', () => {
    test('mergeRecords with union rejects invalid variant combinations', () => {
      const Base = record({ id: string() });

      const TypeA = record({ type: literal('A'), dataA: number() });

      const TypeB = record({ type: literal('B'), dataB: string() });

      const TypeVariant = union([TypeA, TypeB]);

      const Merged = mergeRecords([Base, TypeVariant]);

      // Wrong type literal
      assert.isFalse(Merged.is({ id: '1', type: 'C', dataA: 1 }));

      // Missing type-specific field
      assert.isFalse(Merged.is({ id: '2', type: 'A' }));

      // Wrong field for variant
      assert.isFalse(Merged.is({ id: '3', type: 'A', dataB: 'wrong' }));

      // Mixed fields from different variants are allowed by default (excessProperty: 'allow')
      // To reject this, use mergeRecords with { excessProperty: 'reject' }
      assert.isTrue(
        Merged.is({ id: '4', type: 'A', dataA: 1, dataB: 'extra' }),
      );
    });

    test('mergeRecords with union and strict mode rejects excess properties', () => {
      const Base = record({ id: string() });

      const TypeA = record({ type: literal('A'), dataA: number() });

      const TypeB = record({ type: literal('B'), dataB: string() });

      const TypeVariant = union([TypeA, TypeB]);

      const Merged = mergeRecords([Base, TypeVariant], {
        excessProperty: 'reject',
      });

      // Valid cases
      assert.isTrue(Merged.is({ id: '1', type: 'A', dataA: 1 }));

      assert.isTrue(Merged.is({ id: '2', type: 'B', dataB: 'test' }));

      // Excess property should be rejected in strict mode
      assert.isFalse(
        Merged.is({ id: '3', type: 'A', dataA: 1, extra: 'field' }),
      );

      // Mixed fields from different variants should be rejected
      assert.isFalse(
        Merged.is({ id: '4', type: 'A', dataA: 1, dataB: 'extra' }),
      );
    });

    test('mergeRecords with intersection rejects missing fields', () => {
      const Base = record({ id: string() });

      const Part1 = record({ x: number() });

      const Part2 = record({ y: number() });

      const Intersected = intersection(
        [Part1, Part2],
        record({ x: number(), y: number() }),
      );

      const Merged = mergeRecords([Base, Intersected]);

      // Missing 'x'
      assert.isFalse(Merged.is({ id: '1', y: 2 }));

      // Missing 'y'
      assert.isFalse(Merged.is({ id: '2', x: 1 }));

      // Missing both
      assert.isFalse(Merged.is({ id: '3' }));
    });

    test('cartesian product rejects partial combinations', () => {
      const DimA = union([
        record({ a: literal('a1') }),
        record({ a: literal('a2') }),
      ]);

      const DimB = union([
        record({ b: literal('b1') }),
        record({ b: literal('b2') }),
      ]);

      const Merged = mergeRecords([DimA, DimB]);

      // Valid values from each dimension but invalid combination
      assert.isFalse(Merged.is({ a: 'a1' })); // missing 'b'

      assert.isFalse(Merged.is({ b: 'b1' })); // missing 'a'

      // Invalid values
      assert.isFalse(Merged.is({ a: 'a3', b: 'b1' }));

      assert.isFalse(Merged.is({ a: 'a1', b: 'b3' }));
    });

    test('recursion with union rejects invalid nested types', () => {
      type TreeNode = Readonly<{
        value: number;
        children: readonly TreeNode[];
      }>;

      const TreeNodeType: Type<TreeNode> = recursion<TreeNode>('TreeNode', () =>
        record({ value: number(), children: array(TreeNodeType) }),
      );

      const TypeA = record({ type: literal('A') });

      const TypeB = record({ type: literal('B') });

      const TypeVariant = union([TypeA, TypeB]);

      const Final = mergeRecords([TreeNodeType, TypeVariant]);

      // Wrong type literal
      assert.isFalse(Final.is({ value: 1, children: [], type: 'C' }));

      // Missing type
      assert.isFalse(Final.is({ value: 1, children: [] }));

      // Wrong value type
      assert.isFalse(
        Final.is({ value: 'not a number', children: [], type: 'A' }),
      );

      // Invalid children
      assert.isFalse(
        Final.is({ value: 1, children: 'not an array', type: 'A' }),
      );

      // Invalid nested child
      assert.isFalse(
        Final.is({
          value: 1,
          children: [{ value: 'invalid', children: [], type: 'A' }],
          type: 'A',
        }),
      );
    });
  });

  describe('records that declare the same key', () => {
    const Base = record({ id: int(0), tag: enumType(['a', 'b']) });

    const Loose = record({ id: number(0), tag: enumType(['b', 'c']) });

    test('a value has to satisfy every member of the key', () => {
      const Merged = mergeRecords([Base, Loose]);

      expectType<TypeOf<typeof Merged>, Readonly<{ id: Int; tag: 'b' }>>('=');

      assert.isFalse(Merged.is({ id: 1.5, tag: 'c' }));

      assert.isFalse(Merged.is({ id: 1, tag: 'a' }));

      assert.isFalse(Merged.is({ id: 1, tag: 'c' }));

      assert.isTrue(Merged.is({ id: 1, tag: 'b' }));

      assert.isTrue(Result.isErr(Merged.validate({ id: 1.5, tag: 'b' })));
    });

    test('defaultValue and fill satisfy is', () => {
      const Merged = mergeRecords([Base, Loose]);

      assert.deepStrictEqual(Merged.defaultValue, { id: 0, tag: 'b' });

      assert.isTrue(Merged.is(Merged.defaultValue));

      assert.isTrue(Merged.is(Merged.fill({})));

      assert.deepStrictEqual(Merged.fill({ id: 3, tag: 'c' }), {
        id: 3,
        tag: 'b',
      });
    });

    test("the default is the earlier member's when the later member's does not satisfy both", () => {
      const Merged = mergeRecords([
        record({ tag: enumType(['b', 'c']) }),
        record({ tag: enumType(['a', 'b']) }),
      ]);

      assert.deepStrictEqual(Merged.defaultValue, { tag: 'b' });
    });

    test('the default is any member’s that satisfies all of them, among three records', () => {
      const Merged = mergeRecords([
        record({ tag: enumType(['a', 'b', 'c']) }),
        record({ tag: enumType(['b', 'a']) }),
        record({ tag: enumType(['c', 'a']) }),
      ]);

      expectType<TypeOf<typeof Merged>, Readonly<{ tag: 'a' }>>('=');

      assert.deepStrictEqual(Merged.defaultValue, { tag: 'a' });

      assert.isTrue(Merged.is({ tag: 'a' }));

      assert.isFalse(Merged.is({ tag: 'b' }));

      assert.isFalse(Merged.is({ tag: 'c' }));
    });

    test('members that list their values and share none are refused when the merge is built', () => {
      expect(() =>
        mergeRecords([
          record({ tag: literal(0) }),
          record({ tag: literal(1) }),
        ]),
      ).toThrow('mergeRecords: no value of "tag" satisfies all of 0, 1');
    });

    test("contradictory members that do not list their values default to the last member's default", () => {
      const Merged = mergeRecords([
        record({ n: number(0, { max: 1 }) }),
        record({ n: number(5, { min: 5 }) }),
      ]);

      assert.isFalse(Merged.is({ n: 0 }));

      assert.isFalse(Merged.is({ n: 5 }));

      assert.deepStrictEqual(Merged.defaultValue, { n: 5 });

      assert.isFalse(Merged.is(Merged.defaultValue));

      assert.deepStrictEqual(Merged.fill({ n: 3 }), { n: 5 });
    });

    test('an optional key whose members contradict defaults to undefined', () => {
      const Merged = mergeRecords([
        record({ n: optional(number(0, { max: 1 })) }),
        record({ n: optional(number(5, { min: 5 })) }),
      ]);

      assert.isFalse(Merged.is({ n: 0 }));

      assert.isFalse(Merged.is({ n: 5 }));

      assert.deepStrictEqual(Merged.defaultValue, { n: undefined });

      assert.isTrue(Merged.is(Merged.defaultValue));

      assert.deepStrictEqual(Merged.fill({ n: 3 }), { n: undefined });

      assert.deepStrictEqual(Merged.fill({}), { n: undefined });
    });

    test('the default is the default of a union branch every member accepts', () => {
      const Merged = mergeRecords([
        record({ v: union([literal('a'), number()]) }),
        record({ v: union([literal('b'), number()]) }),
      ]);

      assert.isTrue(Merged.is({ v: 1 }));

      assert.deepStrictEqual(Merged.defaultValue, { v: 0 });

      assert.deepStrictEqual(Merged.fill({ v: 'z' }), { v: 0 });

      assert.deepStrictEqual(Merged.fill({ v: 3 }), { v: 3 });
    });

    test('the default merges the record branches of the members', () => {
      const Merged = mergeRecords([
        record({ meta: record({ a: number() }) }),
        record({ meta: union([nullType, record({ b: number() })]) }),
      ]);

      assert.isTrue(Merged.is({ meta: { a: 1, b: 2 } }));

      assert.isFalse(Merged.is({ meta: { a: 1 } }));

      assert.deepStrictEqual(Merged.defaultValue, { meta: { a: 0, b: 0 } });

      assert.deepStrictEqual(Merged.fill({ meta: { a: 5 } }), {
        meta: { a: 5, b: 0 },
      });

      assert.deepStrictEqual(Merged.fill({}), { meta: { a: 0, b: 0 } });
    });

    test('record branches merge in the order of the records', () => {
      const Merged = mergeRecords([
        record({
          x: union([string(), record({ a: number(5), k: number(1) })]),
        }),
        record({
          x: union([boolean(), record({ b: number(7), k: number(2) })]),
        }),
      ]);

      assert.deepStrictEqual(Merged.defaultValue, { x: { a: 5, k: 2, b: 7 } });
    });

    test('a key the parts of an intersection share requires every part', () => {
      const Both = intersection(
        [record({ id: int() }), record({ id: number() })],
        record({ id: int() }),
      );

      const Merged = mergeRecords([Both, record({ z: number() })]);

      assert.isFalse(Merged.is({ id: 1.5, z: 0 }));

      assert.isTrue(Merged.is({ id: 1, z: 0 }));
    });

    test('a combination of variants whose intersection parts contradict is left out', () => {
      const Variants = intersection(
        [
          union([
            record({ k: literal('a'), x: number() }),
            record({ k: literal('b') }),
          ]),
          record({ k: literal('b') }),
        ],
        record({ k: literal('b') }),
      );

      const MergedVariants = mergeRecords([Variants]);

      assert.isFalse(MergedVariants.is({ k: 'a', x: 0 }));

      assert.isTrue(MergedVariants.is({ k: 'b' }));

      // Were the contradicting combination of `{ k: 'a', x }` and `{ k: 'b' }`
      // kept, it would come first, and the default would be its merge, with `x`.
      assert.deepStrictEqual(MergedVariants.defaultValue, { k: 'b' });
    });

    test("past the bound on combinations of record branches, the default is the last member's", () => {
      const branches = (prefix: string): readonly Type<unknown>[] =>
        Array.from({ length: 9 }, (_, i) =>
          record({ [`${prefix}${i.toString()}`]: number() }),
        );

      const Merged = mergeRecords([
        record({ k: union(Arr.toUnshifted(nullType)(branches('x'))) }),
        record({ k: union(Arr.toUnshifted(literal('z'))(branches('y'))) }),
      ]);

      assert.isTrue(Merged.is({ k: { x0: 0, y0: 0 } }));

      assert.deepStrictEqual(Merged.defaultValue, { k: 'z' });

      const Within = mergeRecords([
        record({
          k: union(Arr.toUnshifted(nullType)(Arr.take(branches('x'), 2))),
        }),
        record({
          k: union(Arr.toUnshifted(literal('z'))(Arr.take(branches('y'), 2))),
        }),
      ]);

      assert.isTrue(Within.is(Within.defaultValue));
    });

    test('one member that lists its values stands for the others when they accept them all', () => {
      const Merged = mergeRecords([
        record({ type: string() }),
        record({ type: literal('x') }),
      ]);

      assert.deepStrictEqual(
        toJsonSchema(Merged),
        Result.ok({
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: { type: { const: 'x' } },
          required: ['type'],
        }),
      );
    });

    test('one member that lists no value the others accept is refused when the merge is built', () => {
      expect(() =>
        mergeRecords([
          record({ k: literal('a') }),
          record({ k: record({ z: number() }) }),
        ]),
      ).toThrow('mergeRecords: no value of "k" satisfies all of');
    });

    test('a required standing member is kept as it is', () => {
      const tag = literal('a');

      const Merged = mergeRecords([
        record({ tag }),
        record({ tag: enumType(['a', 'b']) }),
      ]);

      assert.strictEqual(
        Merged.structure?.kind === 'record'
          ? Merged.structure.shape['tag']
          : undefined,
        tag,
      );
    });

    test('an optional standing member keeps an undefined default that a member forces', () => {
      const Merged = mergeRecords([
        record({ t: optional(literal('a')) }),
        record({
          t: optional(enumType(['a', 'b']), { forceUndefinedDefault: true }),
        }),
      ]);

      assert.deepStrictEqual(Merged.defaultValue, { t: undefined });

      const Earlier = mergeRecords([
        record({
          t: optional(enumType(['a', 'b']), { forceUndefinedDefault: true }),
        }),
        record({ t: optional(literal('a')) }),
      ]);

      assert.deepStrictEqual(Earlier.defaultValue, { t: undefined });
    });

    test('the default is a value both members list when neither default is one', () => {
      const Merged = mergeRecords([
        record({ tag: enumType(['a', 'b']) }),
        record({ tag: enumType(['c', 'b']) }),
      ]);

      expectType<TypeOf<typeof Merged>, Readonly<{ tag: 'b' }>>('=');

      assert.deepStrictEqual(Merged.defaultValue, { tag: 'b' });

      assert.deepStrictEqual(Merged.fill({ tag: 'c' }), { tag: 'b' });
    });

    test('an optional key whose members share no value can only be absent', () => {
      const Merged = mergeRecords([
        record({ tag: optional(literal(0)) }),
        record({ tag: optional(literal(1)) }),
      ]);

      assert.isTrue(Merged.is({}));

      assert.isFalse(Merged.is({ tag: 0 }));

      assert.isTrue(Merged.is(Merged.defaultValue));
    });

    test('union variants whose shared key contradicts are left out', () => {
      const A = union([
        record({ kind: literal('a'), x: number() }),
        record({ kind: literal('b'), y: string() }),
      ]);

      const B = union([
        record({ kind: literal('b'), q: number() }),
        record({ kind: literal('a'), p: string() }),
      ]);

      const Merged = mergeRecords([A, B]);

      expectType<
        TypeOf<typeof Merged>,
        Readonly<
          | { kind: 'a'; x: number; p: string }
          | { kind: 'b'; y: string; q: number }
        >
      >('~=');

      assert.isTrue(Result.isErr(Merged.validate({ kind: 'c' })));

      assert.isTrue(Merged.is(Merged.defaultValue));

      assert.isTrue(Merged.is(Merged.fill({})));

      assert.isTrue(Merged.is({ kind: 'a', x: 1, p: 'p' }));

      assert.isFalse(Merged.is({ kind: 'a', x: 1, q: 1 }));
    });

    test('a nested contradiction leaves an optional key only absent, and a union variant out', () => {
      const Optional = mergeRecords([
        record({ p: optional(record({ x: literal(1) })) }),
        record({ p: optional(record({ x: literal(2) })) }),
      ]);

      assert.isTrue(Optional.is({}));

      assert.isFalse(Optional.is({ p: { x: 1 } }));

      assert.isTrue(Optional.is(Optional.defaultValue));

      const Variants = mergeRecords([
        union([
          record({ k: literal('a'), p: record({ x: literal(1) }) }),
          record({ k: literal('b') }),
        ]),
        record({ p: record({ x: literal(2) }) }),
      ]);

      assert.isTrue(Variants.is({ k: 'b', p: { x: 2 } }));

      assert.isFalse(Variants.is({ k: 'a', p: { x: 2 } }));

      expect(() =>
        mergeRecords([
          record({ p: record({ x: literal(1) }) }),
          record({ p: record({ x: literal(2) }) }),
        ]),
      ).toThrow('mergeRecords: no value of "p.x" satisfies all of 1, 2');
    });

    test('a member whose listed values every member accepts is kept as it is', () => {
      const Merged = mergeRecords([
        union([
          record({ kind: literal('a'), x: number() }),
          record({ kind: literal('b'), y: number() }),
        ]),
        union([
          record({ kind: literal('a'), z: number() }),
          record({ kind: literal('b'), w: number() }),
        ]),
      ]);

      const schema = toJsonSchema(Merged);

      assert.isTrue(Result.isOk(schema));

      assert.notInclude(JSON.stringify(schema), 'allOf');

      assert.isTrue(Merged.is({ kind: 'a', x: 0, z: 0 }));

      assert.isFalse(Merged.is({ kind: 'a', x: 0, w: 0 }));
    });

    test('the default is a value one member lists that the others accept', () => {
      const Merged = mergeRecords([
        record({ s: enumType(['a', 'bb']) }),
        record({ s: string('cc', { minLength: 2 }) }),
      ]);

      assert.deepStrictEqual(Merged.defaultValue, { s: 'bb' });

      assert.deepStrictEqual(Merged.fill({ s: 'zz' }), { s: 'bb' });
    });

    test('a union of literals lists its values', () => {
      expect(() =>
        mergeRecords([
          union([record({ k: literal('x') }), record({ k: literal('y') })]),
          record({ k: union([literal('a'), literal('b')]) }),
        ]),
      ).toThrow('mergeRecords: no value of "k" satisfies all of');
    });

    test('fill repairs a deep value whose members are recursions', () => {
      type TreeA = Readonly<{ a: number; c?: TreeA }>;

      type TreeB = Readonly<{ b: number; c?: TreeB }>;

      const TreeA: Type<TreeA> = recursion('TreeA', () =>
        record({
          a: number(),
          c: optional(TreeA, { forceUndefinedDefault: true }),
        }),
      );

      const TreeB: Type<TreeB> = recursion('TreeB', () =>
        record({
          b: number(),
          c: optional(TreeB, { forceUndefinedDefault: true }),
        }),
      );

      const Merged = mergeRecords([
        record({ c: optional(TreeA, { forceUndefinedDefault: true }) }),
        record({ c: optional(TreeB, { forceUndefinedDefault: true }) }),
      ]);

      const deep = (depth: number): unknown =>
        depth === 0
          ? ({ a: 'x' } as const)
          : ({ a: 1, b: 2, c: deep(depth - 1) } as const);

      const filled: unknown = Merged.fill({ c: deep(50) });

      assert.isTrue(Merged.is(filled));
    });

    test('a key merged as records fills and defaults as the top level does', () => {
      const Merged = mergeRecords([
        record({ s: record({ x: optional(number()) }) }),
        record({ s: record({ y: optional(string()) }) }),
      ]);

      assert.deepStrictEqual(Merged.defaultValue, { s: { x: 0, y: '' } });

      assert.deepStrictEqual(Merged.fill({ s: { x: 1, y: 'a', extra: 3 } }), {
        s: { x: 1, y: 'a' },
      });
    });

    test('a record member wrapped in a recursion is validated as the records merged', () => {
      const Node: Type<Readonly<{ id: string }>> = recursion('Node', () =>
        strictRecord({ id: string() }),
      );

      const Merged = mergeRecords([
        record({ n: Node }),
        record({ n: record({ extra: number() }) }),
      ]);

      assert.isTrue(Merged.is({ n: { id: 'a', extra: 1 } }));

      assert.isFalse(Merged.is({ n: { id: 'a', extra: 1, more: 0 } }));

      assert.deepStrictEqual(Merged.defaultValue, { n: { id: '', extra: 0 } });
    });

    test('an optional member stands for a required key whose values it narrows', () => {
      const Merged = mergeRecords([
        record({ k: union([literal('a'), literal('b')]) }),
        record({ k: optional(literal('a')) }),
      ]);

      assert.isFalse(Merged.is({}));

      assert.isTrue(Merged.is({ k: 'a' }));

      assert.isFalse(Merged.is({ k: 'b' }));

      assert.notInclude(JSON.stringify(toJsonSchema(Merged)), 'allOf');
    });

    test('an optional member that forces an undefined default stands for a required key with a value it lists', () => {
      const Merged = mergeRecords([
        record({ k: union([literal('a'), literal('b')]) }),
        record({ k: optional(literal('a'), { forceUndefinedDefault: true }) }),
      ]);

      assert.deepStrictEqual(Merged.defaultValue, { k: 'a' });

      assert.isTrue(Merged.is(Merged.defaultValue));

      assert.deepStrictEqual(Merged.fill({}), { k: 'a' });

      assert.isFalse(Merged.is({ k: 'b' }));

      assert.notInclude(JSON.stringify(toJsonSchema(Merged)), 'allOf');
    });

    test('a standing member whose default reads undefined stands for a required key with a value it lists', () => {
      // `k` of `Inner` is optional and defaults to `undefined`, as one of its
      // members forces.
      const Inner = mergeRecords([
        record({ k: optional(literal('a')) }),
        record({ k: optional(literal('a'), { forceUndefinedDefault: true }) }),
      ]);

      const Merged = mergeRecords([record({ k: literal('a') }), Inner]);

      assert.deepStrictEqual(Merged.defaultValue, { k: 'a' });

      assert.deepStrictEqual(Merged.fill({}), { k: 'a' });

      const Reversed = mergeRecords([Inner, record({ k: literal('a') })]);

      assert.deepStrictEqual(Reversed.defaultValue, { k: 'a' });

      // `required` keeps the `undefined` default of `k` in `InnerBA`, and the
      // key defaults to `b`, what that enum's `fill` repairs `undefined` to,
      // not to the union's `a`.
      const InnerBA = mergeRecords([
        record({ k: optional(enumType(['b', 'a'])) }),
        record({
          k: optional(enumType(['b', 'a']), { forceUndefinedDefault: true }),
        }),
      ]);

      const RequiredInner = mergeRecords([
        record({ k: union([literal('a'), literal('b')]) }),
        required(InnerBA),
      ]);

      assert.deepStrictEqual(RequiredInner.defaultValue, { k: 'b' });

      assert.deepStrictEqual(RequiredInner.fill({}), { k: 'b' });

      assert.notInclude(JSON.stringify(toJsonSchema(RequiredInner)), 'allOf');

      // `b` again where the enum lists it last.
      const InnerDefaultB = mergeRecords([
        record({ k: optional(enumType(['a', 'b'], { defaultValue: 'b' })) }),
        record({
          k: optional(enumType(['a', 'b'], { defaultValue: 'b' }), {
            forceUndefinedDefault: true,
          }),
        }),
      ]);

      const RequiredInnerDefaultB = mergeRecords([
        record({ k: union([literal('a'), literal('b')]) }),
        required(InnerDefaultB),
      ]);

      assert.deepStrictEqual(RequiredInnerDefaultB.defaultValue, { k: 'b' });

      assert.deepStrictEqual(RequiredInnerDefaultB.fill({ k: 'c' }), {
        k: 'b',
      });
    });

    test('a required member whose forced undefined default `required` kept stands for a required key with a value it lists', () => {
      const RequiredForced = mergeRecords([
        record({ k: union([literal('a'), literal('b')]) }),
        required(
          record({
            k: optional(enumType(['b', 'a']), { forceUndefinedDefault: true }),
          }),
        ),
      ]);

      // `b`, what the standing enum's `fill` repairs to, not the union's `a`.
      assert.deepStrictEqual(RequiredForced.defaultValue, { k: 'b' });

      assert.deepStrictEqual(RequiredForced.fill({}), { k: 'b' });

      assert.deepStrictEqual(RequiredForced.fill({ k: 'z' }), { k: 'b' });

      // `b` again where the enum lists it last: the default is the value the
      // key's `fill` repairs to.
      const ForcedDefaultB = mergeRecords([
        record({ k: union([literal('a'), literal('b')]) }),
        required(
          record({
            k: optional(enumType(['a', 'b'], { defaultValue: 'b' }), {
              forceUndefinedDefault: true,
            }),
          }),
        ),
      ]);

      assert.deepStrictEqual(ForcedDefaultB.defaultValue, { k: 'b' });

      assert.deepStrictEqual(ForcedDefaultB.fill({}), { k: 'b' });

      assert.deepStrictEqual(ForcedDefaultB.fill({ k: 'z' }), { k: 'b' });

      assert.isFalse(RequiredForced.is({}));

      assert.notInclude(JSON.stringify(toJsonSchema(RequiredForced)), 'allOf');

      // The member written for `k` stores `b` as its default, so a later merge
      // keeps it as it is rather than reading it through a getter.
      const keyMemberOf = (type: Type<unknown>): unknown =>
        type.structure?.kind === 'record'
          ? type.structure.shape['k']
          : undefined;

      const MergedAgain = mergeRecords([
        record({ k: union([literal('a'), literal('b')]) }),
        RequiredForced,
      ]);

      assert.isDefined(keyMemberOf(RequiredForced));

      assert.strictEqual(keyMemberOf(MergedAgain), keyMemberOf(RequiredForced));
    });

    test('a default read by a getter is not run while the merge is built, or later', () => {
      const listed = enumType(['b', 'a']);

      let mut_reads = 0;

      const Lazy: Type<'a' | 'b'> = {
        ...listed,
        get defaultValue() {
          mut_reads += 1;

          return 'b' as const;
        },
      } as const;

      const Merged = mergeRecords([
        record({ k: union([literal('a'), literal('b')]) }),
        record({ k: Lazy }),
      ]);

      assert.strictEqual(mut_reads, 0);

      // The key lists what `Lazy` lists, in its order, so the first of them.
      assert.deepStrictEqual(Merged.defaultValue, { k: 'b' });

      assert.deepStrictEqual(Merged.fill({}), { k: 'b' });

      assert.strictEqual(mut_reads, 0);
    });

    test('an optional standing member keeps its own default on a required key when it lists it', () => {
      const Merged = mergeRecords([
        record({ k: union([literal('a'), literal('b')]) }),
        record({ k: optional(enumType(['a', 'b'], { defaultValue: 'b' })) }),
      ]);

      assert.deepStrictEqual(Merged.defaultValue, { k: 'b' });
    });

    test('fill repairs a value through the members', () => {
      const Merged = mergeRecords([
        record({ xs: array(int()) }),
        record({ xs: array(number()) }),
      ]);

      const filled: unknown = Merged.fill({ xs: [1, 2, 'x'] });

      assert.deepStrictEqual(filled, { xs: [1, 2, 0] });
    });

    test('a record member wrapped in a recursion is merged when its default is needed', () => {
      const Meta: Type<Readonly<{ b: string }>> = recursion('Meta', () =>
        record({ b: string() }),
      );

      const Merged = mergeRecords([
        record({ meta: record({ a: number() }) }),
        record({ meta: Meta }),
      ]);

      assert.deepStrictEqual(Merged.defaultValue, { meta: { a: 0, b: '' } });

      assert.deepStrictEqual(Merged.fill({ meta: { a: 1 } }), {
        meta: { a: 1, b: '' },
      });

      const withExcess = { meta: { a: 1, b: '', z: 0 } } as const;

      assert.deepStrictEqual(Merged.prune(withExcess), {
        meta: { a: 1, b: '' },
      });
    });

    test('an optional record key keeps an undefined default', () => {
      const Merged = mergeRecords([
        record({
          meta: optional(record({ a: number() }), {
            forceUndefinedDefault: true,
          }),
        }),
        record({
          meta: optional(record({ b: string() }), {
            forceUndefinedDefault: true,
          }),
        }),
      ]);

      assert.deepStrictEqual(Merged.defaultValue, { meta: undefined });

      assert.isTrue(Merged.is({ meta: { a: 1, b: '' } }));

      assert.isFalse(Merged.is({ meta: { a: 1 } }));
    });

    test('the same member in both records is kept as it is', () => {
      const tag = enumType(['a', 'b']);

      const Merged = mergeRecords([
        record({ tag, x: number() }),
        record({ tag, y: number() }),
      ]);

      assert.deepStrictEqual(
        toJsonSchema(Merged),
        Result.ok({
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: {
            tag: { enum: ['a', 'b'] },
            x: { type: 'number' },
            y: { type: 'number' },
          },
          required: ['tag', 'x', 'y'],
        }),
      );
    });

    test('the JSON schema of a listed key lists the values every member accepts', () => {
      const Merged = mergeRecords([
        record({ tag: enumType(['b', 'c']) }),
        record({ tag: enumType(['a', 'b']) }),
      ]);

      assert.deepStrictEqual(
        toJsonSchema(Merged),
        Result.ok({
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: { tag: { const: 'b' } },
          required: ['tag'],
        }),
      );

      const Several = mergeRecords([
        record({ tag: enumType(['a', 'b', 'c']) }),
        record({ tag: enumType(['c', 'b']) }),
      ]);

      assert.deepStrictEqual(
        toJsonSchema(Several),
        Result.ok({
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: { tag: { enum: ['c', 'b'] } },
          required: ['tag'],
        }),
      );
    });

    test('a single value in common that a literal cannot hold is listed by an enum', () => {
      const Merged = mergeRecords([
        record({ k: enumType([undefined, 'a']) }),
        record({ k: enumType(['b', undefined]) }),
      ]);

      expectType<TypeOf<typeof Merged>, Readonly<{ k: undefined }>>('=');

      assert.isTrue(Merged.is({ k: undefined }));

      assert.isFalse(Merged.is({ k: 'a' }));

      assert.deepStrictEqual(Merged.defaultValue, { k: undefined });

      assert.isTrue(Merged.is(Merged.defaultValue));
    });

    test('a value a union lists twice is listed once', () => {
      const Merged = mergeRecords([
        record({ k: string() }),
        record({ k: union([literal('a'), enumType(['a'])]) }),
      ]);

      assert.deepStrictEqual(
        toJsonSchema(Merged),
        Result.ok({
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: { k: { const: 'a' } },
          required: ['k'],
        }),
      );
    });

    test('an optional copy of the member a record declares adds nothing to require', () => {
      const R = record({ n: number() });

      const Merged = mergeRecords([R, partial(R)]);

      assert.lengthOf(Result.unwrapErrThrow(Merged.validate({ n: 'x' })), 1);

      assert.isFalse(Merged.is({}));

      assert.deepStrictEqual(
        toJsonSchema(Merged),
        Result.ok({
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: { n: { type: 'number' } },
          required: ['n'],
        }),
      );

      const Reversed = mergeRecords([partial(R), R]);

      assert.isFalse(Reversed.is({}));

      assert.isTrue(Reversed.is({ n: 1 }));
    });

    test('a union of records merged with its optional copy keeps its variants', () => {
      // 101 variants, whose square passes the bound on variants.
      const U = union(
        Arr.toUnshifted(record({ kind: literal(100) }))(
          Arr.map(Arr.seq(asUint32(100)), (i) => record({ kind: literal(i) })),
        ),
      );

      const O = record({ inner: U });

      const Merged = mergeRecords([O, partial(O)]);

      assert.isTrue(Merged.is({ inner: { kind: 100 } }));

      assert.isFalse(Merged.is({}));
    });

    test('an annotated copy of a member is required with it, its annotations kept', () => {
      const N = number();

      const Merged = mergeRecords([
        record({ n: annotate(N, { description: 'd' }) }),
        record({ n: N }),
      ]);

      assert.include(JSON.stringify(toJsonSchema(Merged)), '"description":"d"');
    });

    test('the copy kept for an optional key is one that forces an undefined default', () => {
      const Inner = record({ id: number() });

      const Merged = mergeRecords([
        record({ c: optional(Inner, { forceUndefinedDefault: true }) }),
        record({ c: optional(Inner) }),
      ]);

      assert.deepStrictEqual(Merged.defaultValue, { c: undefined });
    });

    test('the copy kept for a required key is one that does not force an undefined default', () => {
      const N = number(3);

      const Forced = required(
        record({ k: optional(N, { forceUndefinedDefault: true }) }),
      );

      const Merged = mergeRecords([record({ k: N }), Forced]);

      assert.deepStrictEqual(Merged.defaultValue, { k: 3 });

      const Reversed = mergeRecords([Forced, record({ k: N })]);

      assert.deepStrictEqual(Reversed.defaultValue, { k: 3 });
    });

    test('a member declared again, or a copy of it, counts where it is last declared', () => {
      const N = number(1);

      const M = number(2);

      const Again = mergeRecords([
        record({ k: N }),
        record({ k: M }),
        record({ k: N }),
      ]);

      // The members are `M` and `N`, in that order, and the default search
      // starts from the last.
      assert.deepStrictEqual(Again.defaultValue, { k: 1 });

      const Copy = mergeRecords([
        record({ k: N }),
        record({ k: M }),
        required(record({ k: optional(N) })),
      ]);

      assert.deepStrictEqual(Copy.defaultValue, { k: 1 });

      // The required `N` is kept over its optional copy, last.
      const OptionalCopy = mergeRecords([
        record({ k: N }),
        record({ k: M }),
        record({ k: optional(N) }),
      ]);

      assert.deepStrictEqual(OptionalCopy.defaultValue, { k: 1 });

      assert.isFalse(OptionalCopy.is({}));
    });

    describe('records whose merge at a shared key passes the bound on variants', () => {
      // 101 variants: two of them merged make 10,201.
      const variants = (prefix: string): Type<unknown> =>
        union(
          Arr.toUnshifted(record({ [`${prefix}_first`]: number() }))(
            Arr.map(Arr.seq(asUint32(100)), (i) =>
              record({ [`${prefix}${i.toString()}`]: number() }),
            ),
          ),
        );

      test('throw when the merge is built, each time', () => {
        const build = (): unknown =>
          mergeRecords([
            record({ p: variants('a') }),
            record({ p: variants('b') }),
          ]);

        expect(build).toThrow('exceeding the limit of 10000');

        expect(build).toThrow('exceeding the limit of 10000');
      });

      test('are not merged in the search for a default that comes before them', () => {
        const Merged = mergeRecords([
          record({ v: union([record({ p: variants('a') }), number()]) }),
          record({ v: union([record({ p: variants('b') }), number()]) }),
        ]);

        assert.deepStrictEqual(Merged.defaultValue, { v: 0 });

        assert.deepStrictEqual(Merged.fill({ v: 'x' }), { v: 0 });
      });

      test('throw when the search for a default reaches them', () => {
        const Merged = mergeRecords([
          record({
            v: union([
              record({ p: variants('a') }),
              record({ q: number() }),
              literal('x'),
            ]),
          }),
          record({
            v: union([
              record({ p: variants('b') }),
              record({ r: number() }),
              literal('y'),
            ]),
          }),
        ]);

        // No member's default nor branch default is accepted by the other, so
        // the search reaches the merged record branches. The merge of the `p`
        // branches, the first combination, passes the bound.
        expect(() => Merged.defaultValue).toThrow(
          'exceeding the limit of 10000',
        );

        assert.isTrue(Merged.is({ v: { p: { a_first: 0 }, r: 0 } }));
      });
    });

    test('a listed key whose other member wraps a union with a recursion is built without resolving it', () => {
      const Branch = union([
        literal('a'),
        record({ next: recursion('Self', () => Self) }),
      ]);

      const Self: Type<unknown> = mergeRecords([
        record({ k: enumType(['a', 'b']) }),
        record({ k: intersection([Branch], Branch) }),
      ]);

      assert.isTrue(Self.is({ k: 'a' }));

      assert.isFalse(Self.is({ k: 'b' }));
    });

    test('a key of recursions with defaults of their own takes those defaults', () => {
      const tree = (name: string): Type<unknown> => {
        const T: Type<unknown> = recursion(
          name,
          () =>
            union([
              record({ kind: literal('node'), child: T }),
              record({ kind: literal('leaf') }),
            ]),
          { defaultValue: { kind: 'leaf' } },
        );

        return T;
      };

      const Merged = mergeRecords([
        record({ t: tree('A') }),
        record({ t: tree('B') }),
      ]);

      assert.deepStrictEqual(Merged.defaultValue, { t: { kind: 'leaf' } });

      assert.deepStrictEqual(Merged.fill({ t: { kind: 'node' } }), {
        t: { kind: 'node', child: { kind: 'leaf' } },
      });
    });

    test('a key of records shared by several variants is merged once', () => {
      const N1 = union([record({ a: number() }), record({ b: number() })]);

      const N2 = union([record({ c: number() }), record({ d: number() })]);

      const Merged = mergeRecords([
        union([
          record({ k: literal('x'), n: N1 }),
          record({ k: literal('y'), n: N1 }),
        ]),
        record({ n: N2 }),
      ]);

      const keyMembers =
        Merged.structure?.kind === 'union'
          ? Arr.map(Merged.structure.memberTypes, (variant) =>
              variant.structure?.kind === 'record'
                ? variant.structure.shape['n']
                : undefined,
            )
          : ([] as const);

      assert.lengthOf(keyMembers, 2);

      assert.isDefined(keyMembers[0]);

      assert.strictEqual(keyMembers[0], keyMembers[1]);

      assert.isTrue(Merged.is({ k: 'y', n: { b: 0, c: 0 } }));
    });

    test('the JSON schema of any other key requires every member', () => {
      const Merged = mergeRecords([
        record({ n: int() }),
        record({ n: number() }),
      ]);

      assert.deepStrictEqual(
        toJsonSchema(Merged),
        Result.ok({
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: {
            n: {
              allOf: [
                { type: 'integer', 'x-brand': 'Int' },
                { type: 'number' },
              ],
            },
          },
          required: ['n'],
        }),
      );
    });

    test('a key that a union variant declares too', () => {
      const Merged = mergeRecords([
        Base,
        union([
          record({ k: literal('x'), id: number() }),
          record({ k: literal('y') }),
        ]),
      ]);

      expectType<
        TypeOf<typeof Merged>,
        Readonly<
          | { id: Int; tag: 'a' | 'b'; k: 'x' }
          | { id: Int; tag: 'a' | 'b'; k: 'y' }
        >
      >('=');

      assert.isFalse(Merged.is({ k: 'x', id: 1.5, tag: 'a' }));

      assert.isTrue(Merged.is({ k: 'x', id: 1, tag: 'a' }));

      assert.isFalse(Merged.is({ k: 'y', id: 1.5, tag: 'a' }));

      assert.isTrue(Merged.is({ k: 'y', id: 1, tag: 'a' }));
    });

    test("under excessProperty: 'reject'", () => {
      const Merged = mergeRecords([strictRecord(Base.shape), Loose]);

      assert.isFalse(Merged.is({ id: 1.5, tag: 'c' }));

      assert.isTrue(Merged.is({ id: 1, tag: 'b' }));

      assert.isFalse(Merged.is({ id: 1, tag: 'b', extra: 0 }));
    });

    test('a key that holds a record in both is the merge of the two records', () => {
      const Merged = mergeRecords([
        record({ meta: record({ a: number() }) }),
        record({ meta: record({ b: string() }) }),
      ]);

      expectType<
        TypeOf<typeof Merged>,
        Readonly<{ meta: Readonly<{ a: number; b: string }> }>
      >('~=');

      assert.isTrue(Merged.is({ meta: { a: 1, b: 'x' } }));

      assert.isFalse(Merged.is({ meta: { a: 1 } }));

      assert.isFalse(Merged.is({ meta: { b: 'x' } }));

      assert.deepStrictEqual(Merged.defaultValue, { meta: { a: 0, b: '' } });

      assert.deepStrictEqual(Merged.fill({ meta: { a: 5 } }), {
        meta: { a: 5, b: '' },
      });
    });

    test('the key is optional only when every record makes it optional', () => {
      const BothOptional = mergeRecords([
        record({ n: optional(number()) }),
        record({ n: optional(int()) }),
      ]);

      expectType<TypeOf<typeof BothOptional>, Readonly<{ n?: Int }>>('=');

      assert.isTrue(BothOptional.is({}));

      assert.isTrue(BothOptional.is({ n: 1 }));

      assert.isFalse(BothOptional.is({ n: 1.5 }));

      assert.isTrue(BothOptional.is(BothOptional.defaultValue));

      const OneOptional = mergeRecords([
        record({ n: optional(number()) }),
        record({ n: int() }),
      ]);

      expectType<TypeOf<typeof OneOptional>, Readonly<{ n: Int }>>('=');

      assert.isFalse(OneOptional.is({}));

      assert.isTrue(OneOptional.is({ n: 1 }));

      assert.isFalse(OneOptional.is({ n: 1.5 }));
    });

    test('a union member is not asked for its default while the merge is built', () => {
      // `Later` is not initialized yet while the merge is built, and the
      // union's default and `fill` run its default type's.
      const Merged = mergeRecords([
        record({ k: union([literal('a'), literal('b')]) }),
        required(
          record({
            k: optional(
              union([literal('a'), literal('b')], {
                defaultType: recursion('Later', () => Later),
              }),
              { forceUndefinedDefault: true },
            ),
          }),
        ),
      ]);

      const Later: Type<'a' | 'b'> = enumType(['b', 'a']);

      // The first of the values every member accepts: no `enumType` or
      // `literal` among the members gives one of its own.
      assert.deepStrictEqual(Merged.defaultValue, { k: 'a' });

      assert.deepStrictEqual(Merged.fill({ k: 'z' }), { k: 'a' });

      assert.isFalse(Merged.is({}));
    });

    test('a recursion member is not resolved when the merge is built', () => {
      type Node = Readonly<{ id: number; next?: Node }>;

      // `Node` is not initialized yet while the merge is built, and reading the
      // second member's default would resolve it.
      const Node: Type<Node> = mergeRecords([
        record({
          id: number(),
          next: optional(
            recursion('Node', () => Node),
            { forceUndefinedDefault: true },
          ),
        }),
        record({ next: optional(recursion('Node', () => Node)) }),
      ]);

      assert.isTrue(Node.is({ id: 0, next: { id: 1 } }));

      assert.isFalse(Node.is({ id: 0, next: { id: 'x' } }));

      // The first member's forced `undefined` ends the recursion that reading
      // the second member's default would start.
      assert.deepStrictEqual(Node.defaultValue, { id: 0, next: undefined });
    });

    test('an optional key whose members default to undefined', () => {
      type Node = Readonly<{ id: number; next?: Node }>;

      const Node: Type<Node> = mergeRecords([
        record({
          id: number(),
          next: optional(
            recursion('Node', () => Node),
            { forceUndefinedDefault: true },
          ),
        }),
        record({
          next: optional(
            recursion('Node', () => Node),
            { forceUndefinedDefault: true },
          ),
        }),
      ]);

      assert.deepStrictEqual(Node.defaultValue, { id: 0, next: undefined });

      assert.isTrue(Node.is(Node.defaultValue));
    });
  });
});
