import { Arr, expectType, type Result } from 'ts-data-forge';
import { array, nonEmptyArray, tuple } from './array/index.mjs';
import { intersection, union } from './compose/index.mjs';
import { enumType } from './enum/index.mjs';
import { annotate, MapType, SetType } from './other-types/index.mjs';
import { boolean, number, string, undefinedType } from './primitives/index.mjs';
import {
  at,
  keyValueRecord,
  mergeRecords,
  omit,
  optional,
  partial,
  pick,
  record,
  required,
} from './record/index.mjs';
import type {
  Type,
  TypeAnnotations,
  TypeOf,
  TypeStructure,
  UnknownType,
} from './type.mjs';
import type { ValidationError } from './utils/index.mjs';

/**
 * `Type<A>` as declaration emit writes the inferred type of a codec const:
 * member by member, with the alias gone. Written by hand because that is what
 * makes it the emitted form — a type mapped from `Type<A>` still relates to
 * `Type<unknown>` the way the alias does.
 */
type Emitted<A> = Readonly<{
  typeName: string;
  defaultValue: A;
  is: (a: unknown) => a is A;
  assertIs: (a: unknown) => asserts a is A;
  cast: (a: unknown) => A;
  fill: (a: unknown) => A;
  prune: <B extends A>(a: B) => A;
  validate: (a: unknown) => Result<A, readonly ValidationError[]>;
  structure?: TypeStructure;
  annotations?: TypeAnnotations;
  optional?: true;
}>;

type Point = Readonly<{ x: number; y: number }>;

/** What `record` returns, emitted: the codec and its shape, both structural. */
type EmittedPoint = Emitted<Point> &
  Readonly<{ shape: Readonly<{ x: Emitted<number>; y: Emitted<number> }> }>;

/**
 * A record codec emitted with a member that carries constraints, which only the
 * shape holds: `Type<number>`, what `at` falls back to, has none.
 */
type EmittedBounded = Emitted<Readonly<{ x: number }>> &
  Readonly<{
    shape: Readonly<{
      x: Emitted<number> & Readonly<{ constraints: Readonly<{ max: 10 }> }>;
    }>;
  }>;

describe('the bound UnknownType', () => {
  test('`Emitted` has the members of `Type`', () => {
    // A member added to `Type` has to be added to `Emitted`, or the tests below
    // stop saying anything about what is emitted.
    expectType<keyof Emitted<unknown>, keyof Type<unknown>>('=');

    assert.isTrue(true); // The assertion is the type above.
  });

  test('accepts a codec type written out structurally, which `Type<unknown>` does not', () => {
    expectType<Emitted<Point> extends UnknownType ? true : false, true>('=');

    expectType<Emitted<string> extends UnknownType ? true : false, true>('=');

    expectType<EmittedPoint extends UnknownType ? true : false, true>('=');

    // The trap the bound exists for: without the alias the two `prune`
    // signatures are compared as generic functions, and do not relate.
    expectType<Emitted<Point> extends Type<unknown> ? true : false, false>('=');

    expectType<Type<Point> extends UnknownType ? true : false, true>('=');

    expectType<Type<Point> extends Type<unknown> ? true : false, true>('=');

    // The cost of the bound: a value typed by it is not a `Type<unknown>`.
    expectType<UnknownType extends Type<unknown> ? true : false, false>('=');

    assert.isTrue(true); // The assertions are the types above.
  });
});

describe('the combinators', () => {
  const PointType = record({ x: number(), y: number() });

  // What a consumer gets when it imports `PointType` from another package's
  // `.d.mts`.
  const emitted: EmittedPoint = PointType;

  const emittedKey: Emitted<string> = string();

  const emittedBounded: EmittedBounded = record({ x: number(0, { max: 10 }) });

  test('take a codec whose type was written out structurally', () => {
    const memberAtX = at(emittedBounded, 'x');

    const types = [
      array(emitted),
      nonEmptyArray(emitted),
      tuple([emitted, emitted]),
      union([emitted, undefinedType]),
      intersection(
        [emitted, record({ z: number() })],
        record({ x: number(), y: number(), z: number() }),
      ),
      MapType(emittedKey, emitted),
      SetType(emitted),
      keyValueRecord(string(), emitted),
      record({ nested: emitted, maybe: optional(emitted) }),
      partial(emitted),
      required(emitted),
      pick(emitted, ['x']),
      omit(emitted, ['x']),
      memberAtX,
      annotate(emitted, { title: 'Point' }),
    ] as const;

    expectType<TypeOf<typeof emitted>, Point>('=');

    // `at` reads the member off the shape, constraints included, not
    // `Type<number>` off the value type, which is what it falls back to when
    // the shape overload rejects.
    expectType<typeof memberAtX.constraints.max, 10>('=');

    for (const type of types) {
      assert.isString(type.typeName);
    }
  });

  test('except where the bound is a `Type` of something narrower than `unknown`', () => {
    // A known limit: these two bounds are `Type<UnknownRecord>` and
    // `Type<string>`, which the structural form of a record codec, and of a key
    // codec narrower than `string`, do not satisfy. When one of them starts to,
    // its directive fails and the call moves to the test above.
    const merged = mergeRecords([
      // @ts-expect-error the bound of `mergeRecords` is `Type<UnknownRecord>`
      emitted,
      record({ z: number() }),
    ]);

    const emittedEnumKey: Emitted<'x' | 'y'> = enumType(['x', 'y']);

    // @ts-expect-error the key bound of `keyValueRecord` is `Type<string>`
    const keyed = keyValueRecord(emittedEnumKey, number());

    assert.isString(merged.typeName);

    assert.isString(keyed.typeName);
  });
});

describe('TypeStructure', () => {
  /** The types `structure` names, one level down. */
  const membersOf = (structure: TypeStructure): readonly Type<unknown>[] =>
    structure.kind === 'record'
      ? Object.values(structure.shape)
      : structure.kind === 'tuple'
        ? structure.elementTypes
        : structure.kind === 'union' || structure.kind === 'intersection'
          ? structure.memberTypes
          : structure.kind === 'array' || structure.kind === 'set'
            ? ([structure.elementType] as const)
            : structure.kind === 'map' || structure.kind === 'keyValueRecord'
              ? ([structure.keyType, structure.valueType] as const)
              : ([] as const);

  /** The number of types `type` is built from, itself included. */
  const count = (type: Type<unknown>): number =>
    type.structure === undefined
      ? 1
      : 1 + Arr.sum(membersOf(type.structure).map(count));

  test('its members are codecs a walker can pass on as `Type<unknown>`', () => {
    const Doc = record({
      id: string(),
      tags: SetType(string()),
      pair: tuple([number(), union([string(), undefinedType])]),
      byName: MapType(string(), array(number())),
      extra: keyValueRecord(string(), boolean()),
    });

    // Doc, id, Set + string, tuple + number + union + string + undefined,
    // Map + string + array + number, keyValueRecord + string + boolean.
    assert.strictEqual(count(Doc), 16);
  });

  test('`prune` can be called on a member', () => {
    const { structure } = tuple([record({ a: number() })]);

    assert.isTrue(structure?.kind === 'tuple');

    const [member] = structure.elementTypes;

    assert.deepStrictEqual(member?.prune({ a: 1, b: 2 }), { a: 1 });
  });
});
