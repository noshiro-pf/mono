import { expectType } from '../expect-type.mjs';
import { isRecord } from './is-record.mjs';

describe(isRecord, () => {
  describe('arrays are Records', () => {
    test('number[] is assignable to Record<number, unknown>', () => {
      const arr: Record<number, unknown> = [1, 2, 3];

      const unk: unknown = arr;

      assert.isTrue(isRecord(unk));

      expectType<typeof unk, UnknownRecord>('<=');
    });

    test('string[] is assignable to Record<number, unknown>', () => {
      const arr: Record<number, unknown> = ['1', '2', '3'];

      const unk: unknown = arr;

      assert.isTrue(isRecord(unk));

      expectType<typeof unk, UnknownRecord>('<=');
    });

    test('[] is a record', () => {
      const arr: unknown = [] as const;

      const unk: unknown = arr;

      assert.isTrue(isRecord(unk));

      expectType<typeof unk, UnknownRecord>('<=');
    });
  });

  describe('non-null objects are Records', () => {
    test('{ x: 1 } is a record', () => {
      const obj = { x: 1 } as const;

      const unk: unknown = obj;

      assert.isTrue(isRecord(unk));

      expectType<typeof unk, UnknownRecord>('<=');
    });

    test('{} is a record', () => {
      const obj = {} as const;

      const unk: unknown = obj;

      assert.isTrue(isRecord(unk));

      expectType<typeof unk, UnknownRecord>('<=');
    });
  });

  describe('primitives are not Records', () => {
    test('null is not a record', () => {
      const obj = null;

      const unk: unknown = obj;

      assert.isFalse(isRecord(unk));

      expectType<typeof unk, UnknownRecord>('!<=');
    });

    test('undefined is not a record', () => {
      const prm = undefined;

      const unk: unknown = prm;

      assert.isFalse(isRecord(unk));

      expectType<typeof unk, UnknownRecord>('!<=');
    });

    test('3 is not a record', () => {
      const prm = 3;

      const unk: unknown = prm;

      assert.isFalse(isRecord(unk));

      expectType<typeof unk, UnknownRecord>('!<=');
    });

    test('"str" is not a record', () => {
      const prm = 'str';

      const unk: unknown = prm;

      assert.isFalse(isRecord(unk));

      expectType<typeof unk, UnknownRecord>('!<=');
    });
  });

  // test('Map is not a record', () => {
  //   const obj = new MutableMap();
  //   const unk: unknown = obj;
  //   const res = isRecord(unk);

  //   assertNotType<typeof obj, UnknownRecord>("<=");
  //   expectType<typeof res, boolean>("=");

  //   expect(res).toBe(false);
  // });

  // test('Set is not a record', () => {
  //   const obj = new MutableSet();
  //   const unk: unknown = obj;
  //   const res = isRecord(unk);

  //   assertNotType<typeof obj, UnknownRecord>("<=");
  //   expectType<typeof res, boolean>("=");

  //   expect(res).toBe(false);
  // });
});
