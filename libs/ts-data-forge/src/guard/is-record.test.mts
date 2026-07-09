import { type UnknownRecord } from 'ts-type-forge';
import { expectType } from '../expect-type.mjs';
import { hasKey } from './has-key.mjs';
import { isRecord } from './is-record.mjs';

describe(isRecord, () => {
  describe('plain objects are records', () => {
    test('{ x: 1 } is a record', () => {
      const unk: unknown = { x: 1 } as const;

      if (isRecord(unk)) {
        expectType<typeof unk, UnknownRecord>('=');
      } else {
        assert.fail();
      }
    });

    test('{} is a record', () => {
      const unk: unknown = {} as const;

      assert.isTrue(isRecord(unk));
    });

    test('Object.create(null) is a record', () => {
      const unk: unknown = Object.create(null);

      assert.isTrue(isRecord(unk));
    });
  });

  describe('arrays are not records', () => {
    test('type-level: arrays are not assignable to UnknownRecord', () => {
      // Arrays have a number index signature but no string index signature,
      // so they are assignable to `Record<number, unknown>` but not to
      // `UnknownRecord` (= `ReadonlyRecord<string, unknown>`).
      expectType<readonly number[], Record<number, unknown>>('<=');

      expectType<readonly number[], UnknownRecord>('!<=');

      expectType<readonly string[], Record<number, unknown>>('<=');

      expectType<readonly string[], UnknownRecord>('!<=');

      expectType<readonly [], UnknownRecord>('!<=');
    });

    test('[1, 2, 3] is not a record', () => {
      const unk: unknown = [1, 2, 3] as const;

      assert.isFalse(isRecord(unk));
    });

    test('["1", "2", "3"] is not a record', () => {
      const unk: unknown = ['1', '2', '3'] as const;

      assert.isFalse(isRecord(unk));
    });

    test('[] is not a record', () => {
      const unk: unknown = [] as const;

      assert.isFalse(isRecord(unk));
    });
  });

  describe('other non-null objects are records', () => {
    // These are not statically assignable to `UnknownRecord` either, but the
    // guard intentionally admits them: every property read through
    // `UnknownRecord` is typed `unknown`, so the narrowing is type-safe, and
    // it keeps `isRecord(u) && hasKey(u, k)` usable for probing instances
    // such as caught `Error` objects.
    test('Date is a record', () => {
      expectType<Date, UnknownRecord>('!<=');

      const unk: unknown = new Date('2020-01-01');

      assert.isTrue(isRecord(unk));
    });

    test('RegExp is a record', () => {
      const unk: unknown = /test/u;

      assert.isTrue(isRecord(unk));
    });

    test('Map is a record (but its entries are not own properties)', () => {
      expectType<ReadonlyMap<string, number>, UnknownRecord>('!<=');

      const unk: unknown = new Map([['a', 1]]);

      if (isRecord(unk)) {
        // Map entries are not own properties, so hasKey correctly rejects them.
        assert.isFalse(hasKey(unk, 'a'));
      } else {
        assert.fail();
      }
    });

    test('Set is a record', () => {
      expectType<ReadonlySet<number>, UnknownRecord>('!<=');

      const unk: unknown = new Set([1, 2, 3]);

      assert.isTrue(isRecord(unk));
    });

    test('Error is a record and its own properties can be probed', () => {
      const unk: unknown = Object.assign(new Error('failure'), {
        code: 'ENOENT',
      });

      if (isRecord(unk) && hasKey(unk, 'code')) {
        expectType<(typeof unk)['code'], unknown>('=');

        assert.strictEqual(unk.code, 'ENOENT');
      } else {
        assert.fail();
      }
    });

    test('class instance is a record', () => {
      class Foo {
        readonly x = 1;
      }

      const unk: unknown = new Foo();

      assert.isTrue(isRecord(unk));
    });
  });

  describe('functions are not records', () => {
    test('arrow function is not a record', () => {
      const unk: unknown = () => 0;

      assert.isFalse(isRecord(unk));
    });
  });

  describe('primitives are not records', () => {
    test('null is not a record', () => {
      const unk: unknown = null;

      assert.isFalse(isRecord(unk));
    });

    test('undefined is not a record', () => {
      const unk: unknown = undefined;

      assert.isFalse(isRecord(unk));
    });

    test('3 is not a record', () => {
      const unk: unknown = 3;

      assert.isFalse(isRecord(unk));
    });

    test('"str" is not a record', () => {
      const unk: unknown = 'str';

      assert.isFalse(isRecord(unk));
    });

    test('true is not a record', () => {
      const unk: unknown = true;

      assert.isFalse(isRecord(unk));
    });

    test('symbol is not a record', () => {
      const unk: unknown = Symbol('sym');

      assert.isFalse(isRecord(unk));
    });

    test('bigint is not a record', () => {
      const unk: unknown = 1n;

      assert.isFalse(isRecord(unk));
    });
  });

  test('combined with hasKey', () => {
    const unk: unknown = { 'some-key': 42 } as const;

    if (isRecord(unk) && hasKey(unk, 'some-key')) {
      expectType<(typeof unk)['some-key'], unknown>('=');

      assert.strictEqual(unk['some-key'], 42);
    } else {
      assert.fail();
    }
  });
});
