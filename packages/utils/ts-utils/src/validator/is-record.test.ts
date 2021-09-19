import { assertNotType, assertType } from '../types';
import { isRecord } from './is-record';

describe('isRecord', () => {
  test('{ x: 1 } is record', () => {
    const obj = { x: 1 } as const;
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    if (res) {
      assertType<TypeEq<typeof unk, Record<string, unknown>>>();
    }

    expect(res).toBeTruthy();
  });

  test('{} is record', () => {
    const obj = {} as const;
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    if (res) {
      assertType<TypeEq<typeof unk, Record<string, unknown>>>();
    }

    expect(res).toBeTruthy();
  });

  test('[] is not record', () => {
    const obj = [] as const;
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    expect(res).toBeFalsy();
  });

  test('null is not record', () => {
    const obj = null;
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    expect(res).toBeFalsy();
  });

  test('undefined is not record', () => {
    const obj = undefined;
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    expect(res).toBeFalsy();
  });

  test('3 is not record', () => {
    const obj = 3;
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    expect(res).toBeFalsy();
  });

  test('"str" is not record', () => {
    const obj = 'str';
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    expect(res).toBeFalsy();
  });

  test('Map is not record', () => {
    const obj = new Map();
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    expect(res).toBeFalsy();
  });

  test('Set is not record', () => {
    const obj = new Set();
    const unk: unknown = obj;
    const res = isRecord(unk);

    assertNotType<TypeExtends<typeof obj, Record<string, unknown>>>();
    assertType<TypeEq<typeof res, boolean>>();

    expect(res).toBeFalsy();
  });
});
