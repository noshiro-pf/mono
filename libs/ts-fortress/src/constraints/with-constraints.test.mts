import { expectType, hasKey, isRecord } from 'ts-data-forge';
import { brand } from '../brand/index.mjs';
import { recursion, refine } from '../other-types/index.mjs';
import { int, nonEmptyString, uint } from '../predefined/index.mjs';
import { bigint, number, string } from '../primitives/index.mjs';
import { at, optional, record, strictRecord } from '../record/index.mjs';
import { attachConstraints, type ConstraintsOf } from './with-constraints.mjs';

describe('constraints carried by number', () => {
  const Age = number(0, { int: true, min: 0, max: 120 });

  test('a specified constraint is read without `?.`, at its literal type', () => {
    expectType<typeof Age.constraints.min, 0>('=');

    expectType<typeof Age.constraints.max, 120>('=');

    expectType<typeof Age.constraints.int, true>('=');

    assert.strictEqual(Age.constraints.min, 0);

    assert.strictEqual(Age.constraints.max, 120);

    assert.strictEqual(Age.constraints.int, true);
  });

  test('an unspecified constraint is fixed to `undefined`', () => {
    expectType<typeof Age.constraints.step, undefined>('=');

    expectType<typeof Age.constraints.multipleOf, undefined>('=');

    assert.strictEqual(Age.constraints.step, undefined);
  });

  test('a type created without constraints carries them all as `undefined`', () => {
    const plain = number();

    expectType<typeof plain.constraints.min, undefined>('=');

    expectType<typeof plain.constraints.max, undefined>('=');

    assert.strictEqual(plain.constraints.max, undefined);
  });

  test('every constraint key is present on the record', () => {
    assert.deepStrictEqual(Object.keys(number().constraints).toSorted(), [
      'finite',
      'gt',
      'gte',
      'int',
      'lt',
      'lte',
      'max',
      'min',
      'multipleOf',
      'negative',
      'nonNegative',
      'nonPositive',
      'nonZero',
      'positive',
      'safeInteger',
      'step',
    ]);
  });

  test('the carried values are the ones the type validates against', () => {
    assert.isTrue(Age.is(Age.constraints.max));

    assert.isFalse(Age.is(Age.constraints.max + 1));
  });

  test('`ConstraintsOf` reads the constraint record off a type', () => {
    expectType<ConstraintsOf<typeof Age>['max'], 120>('=');

    expectType<ConstraintsOf<typeof Age>['step'], undefined>('=');

    const constraints: ConstraintsOf<typeof Age> = Age.constraints;

    assert.strictEqual(constraints.max, 120);
  });
});

describe('constraints carried by string', () => {
  const Name = string('a', { minLength: 1, maxLength: 32 });

  test('specified and unspecified constraints', () => {
    expectType<typeof Name.constraints.minLength, 1>('=');

    expectType<typeof Name.constraints.maxLength, 32>('=');

    expectType<typeof Name.constraints.regex, undefined>('=');

    assert.strictEqual(Name.constraints.maxLength, 32);

    assert.strictEqual(Name.constraints.regex, undefined);
  });

  test('a regex constraint is carried as the RegExp itself', () => {
    const Digits = string('1', { regex: /^\d+$/u });

    expectType<typeof Digits.constraints.regex, RegExp>('=');

    assert.isTrue(Digits.constraints.regex.test('123'));
  });
});

describe('constraints carried by bigint', () => {
  const Amount = bigint(0n, { min: 0n, max: 100n });

  test('specified and unspecified constraints', () => {
    expectType<typeof Amount.constraints.min, 0n>('=');

    expectType<typeof Amount.constraints.max, 100n>('=');

    expectType<typeof Amount.constraints.step, undefined>('=');

    assert.strictEqual(Amount.constraints.max, 100n);
  });
});

describe('constraints propagated through wrappers', () => {
  const Age = number(0, { min: 0, max: 120 });

  test('refine carries the base type constraints over', () => {
    const Even = refine({
      baseType: Age,
      defaultValue: 0,
      is: (a): a is number => a % 2 === 0,
      typeName: 'EvenAge',
    });

    expectType<typeof Even.constraints.max, 120>('=');

    assert.strictEqual(Even.constraints.max, 120);

    assert.isTrue(Even.is(120));

    assert.isFalse(Even.is(121));
  });

  test('brand carries the base type constraints over', () => {
    const Branded = brand({
      baseType: Age,
      defaultValue: 0,
      brandKeys: ['MyAge'],
    });

    expectType<typeof Branded.constraints.max, 120>('=');

    assert.strictEqual(Branded.constraints.min, 0);
  });

  test('a predefined branded number carries its range constraints', () => {
    const Score = int(0, { min: 0, max: 100 });

    expectType<typeof Score.constraints.max, 100>('=');

    expectType<typeof Score.constraints.int, undefined>('=');

    assert.strictEqual(Score.constraints.max, 100);

    assert.isTrue(Score.is(100));

    assert.isFalse(Score.is(101));

    assert.isFalse(Score.is(1.5));
  });

  test('a predefined branded number created without constraints carries none', () => {
    const Count = uint();

    expectType<typeof Count.constraints.max, undefined>('=');

    assert.strictEqual(Count.constraints.max, undefined);
  });

  test('nonEmptyString carries `nonempty` plus what it was given', () => {
    const Label = nonEmptyString('a', { maxLength: 8 });

    expectType<typeof Label.constraints.nonempty, true>('=');

    expectType<typeof Label.constraints.maxLength, 8>('=');

    assert.strictEqual(Label.constraints.nonempty, true);

    assert.strictEqual(Label.constraints.maxLength, 8);
  });
});

describe('constraints reached through a record', () => {
  const User = record({
    age: int(0, { min: 0, max: 120 }),
    name: string('a', { minLength: 1, maxLength: 32 }),
    nickname: optional(string('', { maxLength: 16 })),
  });

  test('the record type exposes the shape it was built from', () => {
    expectType<typeof User.shape.age.constraints.max, 120>('=');

    assert.strictEqual(User.shape.age.constraints.max, 120);

    assert.strictEqual(User.shape.name.constraints.maxLength, 32);
  });

  test('at() returns the member type, constraints and all', () => {
    const age = at(User, 'age');

    expectType<typeof age.constraints.max, 120>('=');

    expectType<typeof age.constraints.step, undefined>('=');

    assert.strictEqual(age.constraints.max, 120);

    assert.isTrue(age.is(120));

    assert.isFalse(age.is(121));
  });

  test('an optional member keeps its constraints alongside `undefined`', () => {
    const nickname = at(User, 'nickname');

    expectType<typeof nickname.constraints.maxLength, 16>('=');

    assert.strictEqual(nickname.constraints.maxLength, 16);

    assert.isTrue(nickname.is(undefined));

    assert.isTrue(nickname.is('abc'));

    assert.isFalse(nickname.is('0123456789abcdefg'));
  });

  test('strictRecord exposes its shape the same way', () => {
    const Strict = strictRecord({ age: number(0, { max: 10 }) });

    expectType<typeof Strict.shape.age.constraints.max, 10>('=');

    assert.strictEqual(at(Strict, 'age').constraints.max, 10);
  });
});

describe(attachConstraints, () => {
  test('keeps a lazy `defaultValue` lazy', () => {
    const Point = record({ x: number(1), y: number(2) });

    const attached = attachConstraints(Point, { min: 0 } as const);

    const descriptor: unknown = Object.getOwnPropertyDescriptor(
      attached,
      'defaultValue',
    );

    // An accessor descriptor owns `get`; the data descriptor a spread would
    // have produced owns `value` instead, holding the evaluated default. The
    // key is tested rather than the function so that reading it does not
    // itself call the getter.
    assert.isTrue(isRecord(descriptor) && hasKey(descriptor, 'get'));

    assert.deepStrictEqual(attached.defaultValue, { x: 1, y: 2 });

    assert.strictEqual(attached.constraints.min, 0);
  });

  test('does not evaluate a recursive type default value', () => {
    type Tree = Readonly<{ value: number; child?: Tree }>;

    const Tree: ReturnType<typeof recursion<Tree>> = recursion('Tree', () =>
      record({
        value: number(0),
        child: optional(Tree, { forceUndefinedDefault: true }),
      }),
    );

    const attached = attachConstraints(Tree, { min: 0 } as const);

    assert.strictEqual(attached.constraints.min, 0);

    assert.isTrue(attached.is({ value: 1, child: { value: 2 } }));
  });
});
