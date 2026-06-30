import { expectType, Result } from 'ts-data-forge';
import { array } from '../array/index.mjs';
import { intersection, union } from '../compose/index.mjs';
import { literal, recursion } from '../other-types/index.mjs';
import { boolean, number, string } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { mergeRecords } from './merge-records.mjs';
import { record, strictRecord } from './record.mjs';

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
});
