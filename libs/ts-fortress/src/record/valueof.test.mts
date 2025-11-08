import { expectType, Result } from 'ts-data-forge';
import { number, string, undefinedType } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import { record } from './record.mjs';
import { valueof } from './valueof.mjs';

describe(valueof, () => {
  test('empty record -> undefinedType', () => {
    const R = record({});
    const V = valueof(R);
    expectType<typeof V, Type<undefined>>('=');

    expect(V.defaultValue).toBe(undefinedType.defaultValue);
    expect(Result.isOk(V.validate(undefined))).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(V.fill('anything')).toBeUndefined();
  });

  test('single field returns that type', () => {
    const R = record({ a: string() });
    const V = valueof(R);
    type T = TypeOf<typeof V>;
    expectType<T, string>('=');

    expect(Result.isOk(V.validate('x'))).toBe(true);
    expect(Result.isErr(V.validate(1))).toBe(true);
  });

  test('multiple fields returns union type', () => {
    const R = record({ a: number(), b: string() });
    const V = valueof(R);
    type T = TypeOf<typeof V>;
    expectType<T, number | string>('=');

    expect(V.is(1)).toBe(true);
    expect(V.is('s')).toBe(true);
    expect(V.is(false)).toBe(false);
  });
});
