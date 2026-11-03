import * as vm from 'node:vm';
import { isDate, isError, isMap, isRegExp, isSet } from './built-in-tag.mjs';

describe('built-in-tag guards', () => {
  test('recognize their own built-in', () => {
    assert.isTrue(isError(new TypeError('x')));

    assert.isTrue(isDate(new Date(0)));

    assert.isTrue(isRegExp(/a/u));

    assert.isTrue(isMap(new Map<number, number>()));

    assert.isTrue(isSet(new Set<number>()));
  });

  test('reject imitations and the other built-ins', () => {
    assert.isFalse(isError({ name: 'Error', message: 'm' }));

    assert.isFalse(isDate('1970-01-01'));

    assert.isFalse(isRegExp('/a/u'));

    assert.isFalse(isMap(new WeakMap<object, unknown>()));

    assert.isFalse(isSet(new Map<unknown, unknown>()));

    assert.isFalse(isError(null));

    assert.isFalse(isMap(undefined));
  });

  // What `instanceof` would get wrong: each value below is built by another
  // realm's constructors, so this realm's prototypes are not in its chain.
  test('recognize values from another realm', () => {
    const foreign: unknown = vm.runInNewContext(
      '[new Error("x"), new Date(0), /a/u, new Map(), new Set()]',
    );

    assert.isTrue(Array.isArray(foreign));

    const [error, date, regExp, map, set] = foreign;

    // The `instanceof` these guards avoid, shown failing on this value.
    // eslint-disable-next-line unicorn/no-instanceof-builtins
    assert.isFalse(error instanceof Error);

    assert.isTrue(isError(error));

    assert.isTrue(isDate(date));

    assert.isTrue(isRegExp(regExp));

    assert.isTrue(isMap(map));

    assert.isTrue(isSet(set));
  });
});
