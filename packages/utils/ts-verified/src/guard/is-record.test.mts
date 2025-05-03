import { expectType } from '../expect-type.mjs';
import { isRecord } from './is-record.mjs';

describe('isRecord', () => {
  test('{ x: 1 } is a record', () => {
    const obj = { x: 1 } as const;
    const unk: unknown = obj;
    const res = isRecord(unk);

    expectType<typeof obj, UnknownRecord>('<=');
    expectType<typeof res, boolean>('=');

    if (res) {
      expectType<typeof unk, UnknownRecord>('=');
    }

    expect(res).toBe(true);
  });

  test('{} is a record', () => {
    const obj = {} as const;
    const unk: unknown = obj;
    const res = isRecord(unk);

    expectType<typeof obj, UnknownRecord>('<=');
    expectType<typeof res, boolean>('=');

    if (res) {
      expectType<typeof unk, UnknownRecord>('=');
    }

    expect(res).toBe(true);
  });

  test('[] is not a record', () => {
    const obj: readonly never[] = [] as const;
    const unk: unknown = obj;
    const res = isRecord(unk);

    expectType<typeof obj, UnknownRecord>('!=');
    expectType<typeof res, boolean>('=');

    expect(res).toBe(false);
  });

  test('null is not a record', () => {
    const obj = null;
    const unk: unknown = obj;
    const res = isRecord(unk);

    expectType<typeof obj, UnknownRecord>('!=');
    expectType<typeof res, boolean>('=');

    expect(res).toBe(false);
  });

  test('undefined is not a record', () => {
    const obj = undefined;
    const unk: unknown = obj;
    const res = isRecord(unk);

    expectType<typeof obj, UnknownRecord>('!=');
    expectType<typeof res, boolean>('=');

    expect(res).toBe(false);
  });

  test('3 is not a record', () => {
    const obj = 3;
    const unk: unknown = obj;
    const res = isRecord(unk);

    expectType<typeof obj, UnknownRecord>('!=');
    expectType<typeof res, boolean>('=');

    expect(res).toBe(false);
  });

  test('"str" is not a record', () => {
    const obj = 'str';
    const unk: unknown = obj;
    const res = isRecord(unk);

    expectType<typeof obj, UnknownRecord>('!=');
    expectType<typeof res, boolean>('=');

    expect(res).toBe(false);
  });

  test('Map is not a record', () => {
    const obj = new Map();
    const unk: unknown = obj;
    const res = isRecord(unk);

    expectType<typeof obj, UnknownRecord>('!=');
    expectType<typeof res, boolean>('=');

    expect(res).toBe(false);
  });

  test('Set is not a record', () => {
    const obj = new Set();
    const unk: unknown = obj;
    const res = isRecord(unk);

    expectType<typeof obj, UnknownRecord>('!=');
    expectType<typeof res, boolean>('=');

    expect(res).toBe(false);
  });
});
