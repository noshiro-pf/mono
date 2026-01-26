/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-class-inheritance */
/* eslint-disable unicorn/error-message */
import { isError as isErrorBySindreSorhus } from '@sindresorhus/is';
import { expectType } from '../expect-type.mjs';

describe('isError from @sindresorhus/is', () => {
  test('should return true for native Error instances', () => {
    assert.isTrue(isErrorBySindreSorhus(new Error()));

    assert.isTrue(isErrorBySindreSorhus(new Error('test message')));
  });

  test('should return true for native Error subclasses', () => {
    assert.isTrue(isErrorBySindreSorhus(new TypeError()));

    assert.isTrue(isErrorBySindreSorhus(new RangeError()));

    assert.isTrue(isErrorBySindreSorhus(new ReferenceError()));

    assert.isTrue(isErrorBySindreSorhus(new SyntaxError()));

    assert.isTrue(isErrorBySindreSorhus(new EvalError()));

    assert.isTrue(isErrorBySindreSorhus(new URIError()));
  });

  test('should return true for custom Error subclasses', () => {
    class CustomError extends Error {
      constructor(message?: string) {
        super(message);

        this.name = 'CustomError';
      }
    }

    assert.isTrue(isErrorBySindreSorhus(new CustomError()));

    assert.isTrue(
      isErrorBySindreSorhus(new CustomError('custom error message')),
    );
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

    assert.isTrue(
      isErrorBySindreSorhus(new ExtendedError('error with code', 404)),
    );
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

    assert.isTrue(isErrorBySindreSorhus(new DerivedCustomError()));
  });

  test('should return false for Error-like objects', () => {
    const errorLikeObject = {
      name: 'Error',
      message: 'This is not a real error',
      stack: 'fake stack trace',
    };

    assert.isFalse(isErrorBySindreSorhus(errorLikeObject));
  });

  test('should return false for non-Error values', () => {
    assert.isFalse(isErrorBySindreSorhus(null));

    assert.isFalse(isErrorBySindreSorhus(undefined));

    assert.isFalse(isErrorBySindreSorhus(0));

    assert.isFalse(isErrorBySindreSorhus(''));

    assert.isFalse(isErrorBySindreSorhus('Error'));

    assert.isFalse(isErrorBySindreSorhus(true));

    assert.isFalse(isErrorBySindreSorhus({}));

    assert.isFalse(isErrorBySindreSorhus([]));

    assert.isFalse(isErrorBySindreSorhus(() => {}));
  });

  test('should act as a type guard', () => {
    const value: Error | string = new Error('test');

    if (isErrorBySindreSorhus(value)) {
      expectType<typeof value, Error>('=');

      expect(value.message).toBe('test');
    }
  });

  test('should work with AggregateError', () => {
    const aggregateError = new AggregateError(
      [new Error('error 1'), new Error('error 2')],
      'Multiple errors occurred',
    );

    assert.isTrue(isErrorBySindreSorhus(aggregateError));
  });

  test('should return false for errors created with Object.create', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const protoError = Object.create(Error.prototype);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    protoError.message = 'proto error';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    protoError.name = 'ProtoError';

    assert.isFalse(isErrorBySindreSorhus(protoError));
  });
});
