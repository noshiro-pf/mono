import { expectType } from '../expect-type.mjs';
import { Optional } from './optional/index.mjs';
import { TernaryResult } from './ternary-result/index.mjs';

describe('TernaryResult test', () => {
  test('constructors and guards', () => {
    const ok = TernaryResult.ok(1);

    const warn = TernaryResult.warn(1, 'caution');

    const err = TernaryResult.err(new Error('boom'));

    expect(TernaryResult.isOk(ok)).toBe(true);

    expect(TernaryResult.isWarn(warn)).toBe(true);

    expect(TernaryResult.isErr(err)).toBe(true);

    expect(TernaryResult.isTernaryResult(ok)).toBe(true);

    expect(TernaryResult.isTernaryResult({})).toBe(false);

    expectType<typeof ok, TernaryResult<number, never, never>>('<=');

    expectType<typeof warn, TernaryResult<number, never, string>>('<=');

    expectType<typeof err, TernaryResult<never, Error, never>>('<=');
  });

  test('map transforms Ok and Warn success values', () => {
    const ok = TernaryResult.ok(2);

    const warn = TernaryResult.warn(2, 'check');

    const err = TernaryResult.err('fail');

    const double = TernaryResult.map((value: number) => value * 2);

    expect(TernaryResult.unwrapOk(double(ok))).toBe(4);

    expect(TernaryResult.unwrapOk(double(warn))).toBe(4);

    expect(TernaryResult.unwrapWarn(double(warn))).toBe('check');

    expect(TernaryResult.unwrapErr(double(err))).toBe('fail');
  });

  test('mapWarn and mapErr leave other variants untouched', () => {
    const warn = TernaryResult.warn(2, 'slow');

    const err = TernaryResult.err('err');

    const warnMessage = TernaryResult.mapWarn(
      (warning: string) => `${warning}!`,
    );

    const errUpper = TernaryResult.mapErr((value: string) =>
      value.toUpperCase(),
    );

    expect(TernaryResult.unwrapWarn(warnMessage(warn))).toBe('slow!');

    expect(TernaryResult.unwrapOk(warnMessage(warn))).toBe(2);

    expect(TernaryResult.unwrapWarn(errUpper(warn))).toBe('slow');

    expect(TernaryResult.unwrapErr(errUpper(err))).toBe('ERR');
  });

  test('flatMap propagates Warn and Err while keeping warnings', () => {
    const parse = (value: string): TernaryResult<number, string, never> =>
      Number.isNaN(Number(value))
        ? TernaryResult.err('NaN')
        : TernaryResult.ok(Number(value));

    const warn = TernaryResult.warn('3', 'slow');

    const err = TernaryResult.err('bad');

    const okResult = TernaryResult.flatMap(TernaryResult.ok('3'), parse);

    const warnResult = TernaryResult.flatMap(warn, parse);

    const errResult = TernaryResult.flatMap(err, parse);

    expect(TernaryResult.unwrapOk(okResult)).toBe(3);

    expect(TernaryResult.isWarn(warnResult)).toBe(true);

    if (TernaryResult.isWarn(warnResult)) {
      expect(warnResult.value).toBe(3);

      expect(warnResult.warning).toBe('slow');
    }

    expect(TernaryResult.unwrapErr(errResult)).toBe('bad');
  });

  test('fold maps each variant independently', () => {
    const value = TernaryResult.fold(
      TernaryResult.ok(1),
      (o: number) => o + 1,
      (w: string) => ({ warning: w }),
      (e: string) => ({ message: e }),
    );

    const warn = TernaryResult.fold(
      TernaryResult.warn(2, 'heads up'),
      (x) => x * 2,
      (w: string) => ({ warning: w }),
      (e: string) => ({ message: e }),
    );

    const err = TernaryResult.fold(
      TernaryResult.err('boom'),
      (x) => x,
      (w: string) => ({ warning: w }),
      (e: string) => ({ message: e }),
    );

    expect(TernaryResult.unwrapOk(value)).toBe(2);

    expect(TernaryResult.unwrapOk(warn)).toBe(4);

    assert.deepStrictEqual(TernaryResult.unwrapWarn(warn), {
      warning: 'heads up',
    });

    assert.deepStrictEqual(TernaryResult.unwrapErr(err), { message: 'boom' });
  });

  test('orElse keeps Ok and Warn variants', () => {
    const fallback = TernaryResult.ok('fallback');

    assert.deepStrictEqual(
      TernaryResult.orElse(TernaryResult.ok('value'), fallback),
      TernaryResult.ok('value'),
    );

    assert.deepStrictEqual(
      TernaryResult.orElse(TernaryResult.warn('value', 'warn'), fallback),
      TernaryResult.warn('value', 'warn'),
    );

    assert.deepStrictEqual(
      TernaryResult.orElse(TernaryResult.err('err'), fallback),
      fallback,
    );
  });

  test('unwrap helpers', () => {
    const warn = TernaryResult.warn('value', 'careful');

    const err = TernaryResult.err('broken');

    expect(TernaryResult.unwrapOk(TernaryResult.ok(3))).toBe(3);

    expect(TernaryResult.unwrapOk(warn)).toBe('value');

    expect(TernaryResult.unwrapWarn(warn)).toBe('careful');

    expect(TernaryResult.unwrapErr(err)).toBe('broken');

    expect(TernaryResult.unwrapOkOr(err, 0)).toBe(0);

    expect(TernaryResult.unwrapWarnOr(err, 'default')).toBe('default');

    expect(TernaryResult.unwrapErrOr(warn, 'default')).toBe('default');
  });

  test('throwing unwrap variants provide descriptive errors', () => {
    expect(() =>
      TernaryResult.unwrapThrow(TernaryResult.warn('notice', 'warned')),
    ).toThrow(/Warn/u);

    expect(() =>
      TernaryResult.unwrapWarnThrow(TernaryResult.err('no warn')),
    ).toThrow(/Err/u);

    expect(() =>
      TernaryResult.unwrapErrThrow(TernaryResult.ok('no err')),
    ).toThrow(/Ok/u);
  });

  test('expectToBe unwraps Ok values', () => {
    expect(TernaryResult.expectToBe(TernaryResult.ok('v'), 'msg')).toBe('v');

    expect(() =>
      TernaryResult.expectToBe(TernaryResult.err('x'), 'missing'),
    ).toThrow(/missing/u);
  });

  test('zip prefers Err over Warn or Ok.', () => {
    const ok = TernaryResult.ok('x');

    const warn = TernaryResult.warn('warn', 'warned');

    const err = TernaryResult.err('err');

    assert.deepStrictEqual(
      TernaryResult.zip(ok, TernaryResult.ok(1)),
      TernaryResult.ok(['x', 1] as const),
    );

    assert.deepStrictEqual(
      TernaryResult.zip(ok, warn),
      TernaryResult.warn(['x', 'warn'] as const, 'warned'),
    );

    assert.deepStrictEqual(
      TernaryResult.zip(warn, ok),
      TernaryResult.warn(['warn', 'x'] as const, 'warned'),
    );

    assert.deepStrictEqual(TernaryResult.zip(ok, err), err);

    assert.deepStrictEqual(TernaryResult.zip(err, warn), err);
  });

  test('toOptional keeps only Ok values', () => {
    assert.deepStrictEqual(
      TernaryResult.toOptional(TernaryResult.ok(1)),
      Optional.some(1),
    );

    assert.deepStrictEqual(
      TernaryResult.toOptional(TernaryResult.warn(1, 'warn')),
      Optional.some(1),
    );

    expect(TernaryResult.toOptional(TernaryResult.err('err'))).toBe(
      Optional.none,
    );
  });

  test('fromPromise resolves into TernaryResult', async () => {
    await expect(
      TernaryResult.fromPromise(Promise.resolve('ok')),
    ).resolves.toStrictEqual(TernaryResult.ok('ok'));

    const rejected = await TernaryResult.fromPromise(
      Promise.reject(new Error('bad')),
    );

    expect(TernaryResult.isErr(rejected)).toBe(true);
  });

  test('fromThrowable converts thrown values', () => {
    assert.deepStrictEqual(
      TernaryResult.fromThrowable(() => 5),
      TernaryResult.ok(5),
    );

    const errorResult = TernaryResult.fromThrowable(() => {
      throw new Error('boom');
    });

    expect(TernaryResult.isErr(errorResult)).toBe(true);
  });

  test('unwrapOkOr curried version', () => {
    const unwrap = TernaryResult.unwrapOkOr(999);

    expect(unwrap(TernaryResult.ok(42))).toBe(42);

    expect(unwrap(TernaryResult.warn(10, 'notice'))).toBe(10);

    expect(unwrap(TernaryResult.err('error'))).toBe(999);
  });

  test('unwrapWarnOr curried version', () => {
    const unwrap = TernaryResult.unwrapWarnOr('default');

    expect(unwrap(TernaryResult.warn(1, 'alert'))).toBe('alert');

    expect(unwrap(TernaryResult.ok(5))).toBe('default');

    expect(unwrap(TernaryResult.err('fail'))).toBe('default');
  });

  test('unwrapErrOr curried version', () => {
    const unwrap = TernaryResult.unwrapErrOr('fallback');

    expect(unwrap(TernaryResult.err('bad'))).toBe('bad');

    expect(unwrap(TernaryResult.ok(3))).toBe('fallback');

    expect(unwrap(TernaryResult.warn(1, 'note'))).toBe('fallback');
  });

  test('orElse curried version', () => {
    const fallback = TernaryResult.ok('backup');

    const useBackup = TernaryResult.orElse(fallback);

    assert.deepStrictEqual(useBackup(TernaryResult.ok(1)), TernaryResult.ok(1));

    assert.deepStrictEqual(
      useBackup(TernaryResult.warn(2, 'w')),
      TernaryResult.warn(2, 'w'),
    );

    assert.deepStrictEqual(useBackup(TernaryResult.err('e')), fallback);
  });
});
