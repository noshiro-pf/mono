import * as vm from 'node:vm';
import { isDate, isError, isMap, isRegExp, isSet } from './built-in-tag.mjs';
import { expectType } from './expect-type.mjs';

describe('built-in-tag guards', () => {
  test('recognize their own built-in', () => {
    assert.isTrue(isError(new TypeError('x')));

    assert.isTrue(isDate(new Date(0)));

    assert.isTrue(isRegExp(/a/u));

    assert.isTrue(isMap(new Map<number, number>()));

    assert.isTrue(isSet(new Set<number>()));
  });

  test('isError recognizes a DOMException, and not its look-alike', () => {
    assert.isTrue(isError(new DOMException('m', 'AbortError')));

    assert.isFalse(isError({ name: 'AbortError', message: 'm' }));
  });

  test('isError recognizes a DOMException subclass with a tag of its own', () => {
    // eslint-disable-next-line functional/no-class-inheritance
    class TransportError extends DOMException {}

    // The shape `WebTransportError` has: a tag of its own on its prototype.
    // eslint-disable-next-line functional/immutable-data
    Object.defineProperty(TransportError.prototype, Symbol.toStringTag, {
      value: 'TransportError',
    });

    assert.isTrue(isError(new TransportError('m', 'NetworkError')));
  });

  test('isError answers false for an object whose prototype chain never ends', () => {
    const endless: object = new Proxy(
      {},
      {
        getPrototypeOf: () => endless,
      },
    );

    assert.isFalse(isError(endless));
  });

  test('isError answers false for an object re-pointed at DOMException.prototype', () => {
    assert.isFalse(isError(Object.setPrototypeOf({}, DOMException.prototype)));
  });

  test('isError answers false for a revoked Proxy', () => {
    const { proxy, revoke } = Proxy.revocable({}, {});

    revoke();

    assert.isFalse(isError(proxy));
  });

  test('isError answers false when message through the tagged prototype is not a string', () => {
    assert.isFalse(
      isError(
        Object.create({ [Symbol.toStringTag]: 'DOMException', message: 1 }),
      ),
    );
  });

  // The known limits the comment on `isError` describes.
  test('isError takes a hand-set Error tag at its word, as documented', () => {
    assert.isTrue(isError({ [Symbol.toStringTag]: 'Error' }));
  });

  test('isError takes a hand-made DOMException prototype at its word, as documented', () => {
    assert.isTrue(
      isError(
        Object.create({ [Symbol.toStringTag]: 'DOMException', message: 'm' }),
      ),
    );
  });

  test('isError answers false for an Error subclass with a tag of its own, as documented', () => {
    // eslint-disable-next-line functional/no-class-inheritance
    class HttpError extends Error {
      readonly [Symbol.toStringTag] = 'HttpError';
    }

    assert.isFalse(isError(new HttpError('m')));
  });

  test('isError answers false for a Proxy around an error, as documented', () => {
    assert.isFalse(isError(new Proxy(new Error('m'), {})));

    assert.isFalse(isError(new Proxy(new DOMException('m'), {})));
  });

  test('isError answers false for DOMException.prototype itself', () => {
    assert.isFalse(isError(DOMException.prototype));
  });

  test('isError answers false for a plain object that only sets a DOMException tag', () => {
    assert.isFalse(isError({ [Symbol.toStringTag]: 'DOMException' }));
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

/* eslint-disable functional/no-class-inheritance, unicorn/error-message -- the error subclasses and the message-less errors are what this suite checks */
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
    const value: unknown = new Error('test');

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
/* eslint-enable functional/no-class-inheritance, unicorn/error-message */
