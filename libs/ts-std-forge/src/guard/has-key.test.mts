import type { ReadonlyRecord, UnknownRecord } from 'ts-type-forge';
import { expectType } from '../expect-type.mjs';
import { hasKey, type HasKeyReturnType } from './has-key.mjs';

type WithX = Readonly<{ x: number }>;

type WithOptionalA = Readonly<{ a?: number }>;

type WithA = Readonly<{ a: 0 }>;

type WithB = Readonly<{ b: 1 }>;

test('HasKeyReturnType adds the key to each member', () => {
  expectType<HasKeyReturnType<WithX, 'y'>, WithX & Readonly<{ y: unknown }>>(
    '=',
  );

  expectType<
    HasKeyReturnType<WithOptionalA, 'a'>,
    WithOptionalA & Readonly<{ a: number | undefined }>
  >('=');

  expectType<
    HasKeyReturnType<ReadonlyRecord<string, number>, 'a'>,
    ReadonlyRecord<string, number> & Readonly<{ a: number }>
  >('=');

  expectType<
    HasKeyReturnType<WithA | WithB, 'c'>,
    (WithA & Readonly<{ c: unknown }>) | (WithB & Readonly<{ c: unknown }>)
  >('=');

  assert.isTrue(true);
});

test('hasKey narrows where it returns true', () => {
  const xy = { x: 1, y: 2 } as const;

  // A value may have properties its type does not name.
  const withX: WithX = xy;

  if (hasKey(withX, 'y')) {
    expectType<typeof withX, WithX & Readonly<{ y: unknown }>>('=');

    assert.isTrue(withX.y === 2);
  } else {
    expectType<typeof withX, WithX>('=');

    assert.fail();
  }

  const dict: ReadonlyRecord<string, number> = { a: 1 } as const;

  if (hasKey(dict, 'a')) {
    expectType<typeof dict.a, number>('=');

    assert.isTrue(dict.a === 1);
  } else {
    assert.fail();
  }

  const record: UnknownRecord = { a: 'a', b: 'b' } as const;

  if (hasKey(record, 'a') && hasKey(record, 'b')) {
    expectType<typeof record.a, unknown>('=');

    expectType<typeof record.b, unknown>('=');

    assert.isTrue(record.a === 'a' && record.b === 'b');
  } else {
    assert.fail();
  }
});

test('hasKey removes nothing where it returns false', () => {
  // `{}` is a `WithOptionalA` with no own `a`.
  const withOptionalA: WithOptionalA = {} as const;

  if (hasKey(withOptionalA, 'a')) {
    expectType<typeof withOptionalA.a, number | undefined>('=');

    assert.fail();
  } else {
    expectType<typeof withOptionalA, WithOptionalA>('=');

    assert.isTrue(withOptionalA.a === undefined);
  }
});

test('hasKey narrows nothing for a key some member requires', () => {
  const xy = { x: 1, y: 2 } as const;

  const withX: WithX = xy;

  if (hasKey(withX, 'x')) {
    expectType<typeof withX, WithX>('=');
  } else {
    expectType<typeof withX, WithX>('=');

    assert.fail();
  }

  // Tell such a union apart by a discriminant property, or with a type guard
  // written for the union.
  const withAOrBs: readonly (WithA | WithB)[] = [{ b: 1 }] as const;

  for (const withAOrB of withAOrBs) {
    if (hasKey(withAOrB, 'a')) {
      expectType<typeof withAOrB, WithA | WithB>('=');

      assert.fail();
    } else {
      expectType<typeof withAOrB, WithA | WithB>('=');
    }
  }
});

test('hasKey narrows nothing for a key that is not one literal', () => {
  const xy = { x: 1, y: 2 } as const;

  const withX: WithX = xy;

  const keys: readonly string[] = ['y'] as const;

  for (const key of keys) {
    if (hasKey(withX, key)) {
      expectType<typeof withX, WithX>('=');
    } else {
      expectType<typeof withX, WithX>('=');

      assert.fail();
    }
  }

  const xOrY = keys.includes('y') ? 'y' : 'x';

  if (hasKey(withX, xOrY)) {
    expectType<typeof withX, WithX>('=');
  } else {
    expectType<typeof withX, WithX>('=');

    assert.fail();
  }
});
