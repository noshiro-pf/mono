import { assertNotType, assertType } from '../assert-type';
import { isRecord } from './is-record';

describe('isRecord', () => {
  test('{ x: 1 } is a record', () => {
    const obj = { x: 1 } as const;
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    if (res) {
      assertType<TypeEq<typeof unk, Record<string, unknown>>>();
    }

    expect(res).toBe(true);
  });

  test('{} is a record', () => {
    const obj = {} as const;
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    if (res) {
      assertType<TypeEq<typeof unk, Record<string, unknown>>>();
    }

    expect(res).toBe(true);
  });

  test('[] is not a record', () => {
    const obj = [] as const;
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    expect(res).toBe(false);
  });

  test('null is not a record', () => {
    // eslint-disable-next-line unicorn/no-null
    const obj = null;
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    expect(res).toBe(false);
  });

  test('undefined is not a record', () => {
    const obj = undefined;
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    expect(res).toBe(false);
  });

  test('3 is not a record', () => {
    const obj = 3;
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    expect(res).toBe(false);
  });

  test('"str" is not a record', () => {
    const obj = 'str';
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    expect(res).toBe(false);
  });

  // test('Map is not a record', () => {
  //   const obj = new MutableMap();
  //   const unk: unknown = obj;
  //   const res = isRecord(unk);

  //   assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
  //   assertType<TypeEq<typeof res, boolean>>();

  //   expect(res).toBe(false);
  // });

  // test('Set is not a record', () => {
  //   const obj = new MutableSet();
  //   const unk: unknown = obj;
  //   const res = isRecord(unk);

  //   assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
  //   assertType<TypeEq<typeof res, boolean>>();

  //   expect(res).toBe(false);
  // });
});
