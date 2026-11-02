/* eslint-disable functional/no-class-inheritance */
/* eslint-disable unicorn/error-message */
import {
  isError,
  isMap,
  isRegExp,
  isSet,
  isTypedArray,
} from './built-in-tag.mjs';
import { expectType } from './expect-type.mjs';

describe(isError, () => {
  test('should return true for native Error instances', () => {
    assert.isTrue(isError(new Error()));

    assert.isTrue(isError(new Error('test message')));
  });

  test('should return true for native Error subclasses', () => {
    assert.isTrue(isError(new TypeError()));

    assert.isTrue(isError(new RangeError()));

    assert.isTrue(isError(new ReferenceError()));

    assert.isTrue(isError(new SyntaxError()));

    assert.isTrue(isError(new EvalError()));

    assert.isTrue(isError(new URIError()));
  });

  test('should return true for custom Error subclasses', () => {
    class CustomError extends Error {
      constructor(message?: string) {
        super(message);

        this.name = 'CustomError';
      }
    }

    assert.isTrue(isError(new CustomError()));

    assert.isTrue(isError(new CustomError('custom error message')));
  });

  test('should return true for Error subclass with additional properties', () => {
    class ExtendedError extends Error {
      readonly code: number;

      constructor(message: string, code: number) {
        super(message);

        this.name = 'ExtendedError';

        this.code = code;
      }
    }

    assert.isTrue(isError(new ExtendedError('error with code', 404)));
  });

  test('should return true for deeply nested Error subclass', () => {
    class BaseCustomError extends Error {
      constructor(message?: string) {
        super(message);

        this.name = 'BaseCustomError';
      }
    }

    class DerivedCustomError extends BaseCustomError {
      constructor(message?: string) {
        super(message);

        this.name = 'DerivedCustomError';
      }
    }

    assert.isTrue(isError(new DerivedCustomError()));
  });

  test('should return false for Error-like objects', () => {
    const errorLikeObject = {
      name: 'Error',
      message: 'This is not a real error',
      stack: 'fake stack trace',
    } as const;

    assert.isFalse(isError(errorLikeObject));
  });

  test('should return false for non-Error values', () => {
    assert.isFalse(isError(null));

    assert.isFalse(isError(undefined));

    assert.isFalse(isError(0));

    assert.isFalse(isError(''));

    assert.isFalse(isError('Error'));

    assert.isFalse(isError(true));

    assert.isFalse(isError({}));

    assert.isFalse(isError([]));

    assert.isFalse(isError(() => {}));
  });

  test('should act as a type guard', () => {
    const value: Error | string = new Error('test');

    if (!isError(value)) {
      return;
    }

    expectType<typeof value, Error>('=');

    expect(value.message).toBe('test');
  });

  test('should work with AggregateError', () => {
    const aggregateError = new AggregateError(
      [new Error('error 1'), new Error('error 2')],
      'Multiple errors occurred',
    );

    assert.isTrue(isError(aggregateError));
  });

  test('should return false for errors created with Object.create', () => {
    // Built and then re-pointed rather than `Object.create(Error.prototype)`,
    // which the strict standard library types as `unknown` — correctly, since
    // it knows nothing about the resulting shape. The object under test is the
    // same: Error.prototype in its chain, never constructed as an Error.
    const mut_protoError = { message: 'proto error', name: 'ProtoError' };

    Object.setPrototypeOf(mut_protoError, Error.prototype);

    const protoError = mut_protoError;

    assert.isFalse(isError(protoError));
  });
});

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
