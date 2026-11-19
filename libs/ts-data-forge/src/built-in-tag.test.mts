import { isMap, isRegExp, isSet, isTypedArray } from './built-in-tag.mjs';

describe(isMap, () => {
  test('should return true for a Map only', () => {
    assert.isTrue(isMap(new Map<number, number>([[1, 2]])));

    assert.isFalse(isMap(new WeakMap<object, unknown>()));

    assert.isFalse(isMap(new Set<unknown>()));

    assert.isFalse(isMap({ size: 0 }));
  });
});

describe(isSet, () => {
  test('should return true for a Set only', () => {
    assert.isTrue(isSet(new Set<number>([1])));

    assert.isFalse(isSet(new WeakSet<object>()));

    assert.isFalse(isSet(new Map<unknown, unknown>()));

    assert.isFalse(isSet([1]));
  });
});

describe(isRegExp, () => {
  test('should return true for a RegExp only', () => {
    assert.isTrue(isRegExp(/a/u));

    assert.isFalse(isRegExp('/a/u'));

    assert.isFalse(isRegExp({ source: 'a', flags: 'u' }));
  });
});

describe(isTypedArray, () => {
  test('should return true for every typed array', () => {
    assert.isTrue(isTypedArray(new Int8Array(1)));

    assert.isTrue(isTypedArray(new Uint8Array(1)));

    assert.isTrue(isTypedArray(new Uint8ClampedArray(1)));

    assert.isTrue(isTypedArray(new Int16Array(1)));

    assert.isTrue(isTypedArray(new Uint16Array(1)));

    assert.isTrue(isTypedArray(new Int32Array(1)));

    assert.isTrue(isTypedArray(new Uint32Array(1)));

    assert.isTrue(isTypedArray(new Float32Array(1)));

    assert.isTrue(isTypedArray(new Float64Array(1)));

    assert.isTrue(isTypedArray(new BigInt64Array(1)));

    assert.isTrue(isTypedArray(new BigUint64Array(1)));
  });

  test('should return false for other binary views and arrays', () => {
    assert.isFalse(isTypedArray(new DataView(new ArrayBuffer(1))));

    assert.isFalse(isTypedArray(new ArrayBuffer(1)));

    assert.isFalse(isTypedArray([1, 2]));
  });
});
