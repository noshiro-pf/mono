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

    assert.isTrue(Result.isOk(V.validate(undefined)));

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(V.fill('anything')).toBeUndefined();
  });

  test('single field returns that type', () => {
    const R = record({ a: string() });

    const V = valueof(R);

    type T = TypeOf<typeof V>;

    expectType<T, string>('=');

    assert.isTrue(Result.isOk(V.validate('x')));

    assert.isTrue(Result.isErr(V.validate(1)));
  });

  test('multiple fields returns union type', () => {
    const R = record({ a: number(), b: string() });

    const V = valueof(R);

    type T = TypeOf<typeof V>;

    expectType<T, number | string>('=');

    assert.isTrue(V.is(1));

    assert.isTrue(V.is('s'));

    assert.isFalse(V.is(false));
  });
});
