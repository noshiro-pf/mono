import { expectType, hasKey, Result } from 'ts-data-forge';
import type { TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { enumType } from './enum.mjs';

describe(enumType, () => {
  const targetType = enumType([3, '2', 'a'], {
    defaultValue: 3,
  });

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, '2' | 'a' | 3>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: number | string = Math.random() >= 0 ? 3 : '0'; // the value is always 1

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, number | string>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: number | string = Math.random() >= 0 ? 5 : '0'; // the value is always 5

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, number | string>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(3);

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(3);
    });

    test('falsy case', () => {
      const result = targetType.validate(5);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: 5,
        expectedType: 'enum',
        typeName: 'enum',
        details: {
          kind: 'enum',
          values: [3, '2', 'a'] as const,
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected one of { 3, 2, a } but `5` was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 'a';

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: number = (() => 3)();

      expect(targetType.fill(x)).toBe(3);
    });

    test('fill with the default value', () => {
      const x: number = (() => 5)();

      expect(targetType.fill(x)).toBe(3);
    });
  });
});

describe('enumType with allowAnyString', () => {
  const color = enumType(['red', 'green', 'blue'], {
    allowAnyString: true,
    defaultValue: '',
  });

  type Color = TypeOf<typeof color>;

  // Autocomplete is preserved for the listed members via the open-union idiom,
  // while any other string is still part of the type.
  expectType<Color, 'red' | 'green' | 'blue' | (string & {})>('=');

  expectType<typeof color.defaultValue, Color>('=');

  describe('is', () => {
    test('accepts a listed member', () => {
      assert.isTrue(color.is('red'));
    });

    test('accepts any other string at runtime (behaves like string())', () => {
      assert.isTrue(color.is('purple'));
    });

    test('rejects non-string values', () => {
      assert.isFalse(color.is(42));
    });
  });

  describe('validate', () => {
    test('returns an unlisted string as-is', () => {
      const result = color.validate('purple');

      assert.isTrue(Result.isOk(result));

      expect(Result.unwrapThrow(result)).toBe('purple');
    });

    test('rejects non-string values with a string-type error', () => {
      const result = color.validate(42);

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(
        validationErrorsToMessages(Result.unwrapErrThrow(result)),
        [
          'Error: expected <string> type but <number> type value `42` was passed.',
        ],
      );
    });
  });

  describe('default value and fill', () => {
    test('uses the configured default value', () => {
      expect(color.defaultValue).toBe('');
    });

    test('keeps any string', () => {
      const x: unknown = 'anything';

      expect(color.fill(x)).toBe('anything');
    });

    test('non-string falls back to the default value', () => {
      const x: unknown = 123;

      expect(color.fill(x)).toBe('');
    });
  });
});

describe('enumType with allowAnyString and no default value', () => {
  const color = enumType(['red', 'green'], { allowAnyString: true });

  expectType<TypeOf<typeof color>, 'red' | 'green' | (string & {})>('=');

  test('accepts any string', () => {
    assert.isTrue(color.is('red'));

    assert.isTrue(color.is('blue'));

    assert.isTrue(Result.isOk(color.validate('blue')));
  });

  test('rejects non-string values', () => {
    assert.isFalse(color.is(1));
  });

  test('rejects non-string values with a string-type error', () => {
    const result = color.validate(1);

    assert.isTrue(Result.isErr(result));

    const errors = Result.unwrapErrThrow(result);

    assert.deepStrictEqual(validationErrorsToMessages(errors), [
      'Error: expected <string> type but <number> type value `1` was passed.',
    ]);

    assert.deepStrictEqual(
      errors.map((e) => e.details),
      [undefined],
    );
  });

  test('defaults to the first member', () => {
    expect(color.defaultValue).toBe('red');
  });

  test('fill keeps any string and replaces anything else', () => {
    const unlisted: unknown = 'blue';

    const notString: unknown = 1;

    expect(color.fill(unlisted)).toBe('blue');

    expect(color.fill(notString)).toBe('red');
  });

  test('is named string and described as a string', () => {
    expect(color.typeName).toBe('string');

    assert.deepStrictEqual(color.structure, { kind: 'string' });
  });
});

describe('enumType with allowAnyString and a default that is not a string', () => {
  const color = enumType(['red', 'green'], {
    allowAnyString: true,
    // @ts-expect-error 5 is not a string
    defaultValue: 5,
  });

  test('still accepts any string and is described as a string', () => {
    assert.isTrue(color.is('blue'));

    expect(color.typeName).toBe('string');

    assert.deepStrictEqual(color.structure, { kind: 'string' });
  });

  test('defaults to the first member, in fill too', () => {
    expect(color.defaultValue).toBe('red');

    const notString: unknown = 1;

    expect(color.fill(notString)).toBe('red');
  });
});

describe('enumType with allowAnyString and an explicit undefined default', () => {
  test('defaults to the first member', () => {
    const color = enumType(['red', 'green'], {
      allowAnyString: true,
      defaultValue: undefined,
    });

    expect(color.defaultValue).toBe('red');
  });
});

describe('enumType with allowAnyString and an inherited default', () => {
  test('reads the default', () => {
    // `__proto__` in an object literal sets its prototype.
    const options = {
      __proto__: { defaultValue: 'green' },
      allowAnyString: true,
    } as const;

    assert.isFalse(hasKey(options, 'defaultValue'));

    const color = enumType(['red', 'green'], options);

    expect(color.defaultValue).toBe('green');
  });
});

describe('enumType with allowAnyString and typeName', () => {
  test.each([
    { name: 'without a default value', options: {} },
    { name: 'with a default value', options: { defaultValue: 'green' } },
  ] as const)('keeps the name $name', ({ options }) => {
    const color = enumType(['red', 'green'], {
      allowAnyString: true,
      typeName: 'Color',
      ...options,
    });

    expect(color.typeName).toBe('Color');

    assert.isTrue(color.is('blue'));

    const result = color.validate(1);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(
      validationErrorsToMessages(Result.unwrapErrThrow(result)),
      ['Error: expected <Color> type but <number> type value `1` was passed.'],
    );
  });
});

describe('enumType default value', () => {
  test('null can be the default of an enum that lists it', () => {
    // @sumi-expect-error null/no-null-literal
    expect(enumType([1, null], { defaultValue: null }).defaultValue).toBeNull();
  });

  test('undefined can be the default of an enum that lists it', () => {
    expect(
      enumType([1, undefined], { defaultValue: undefined }).defaultValue,
    ).toBeUndefined();
  });

  test('the first member is the default when none is given', () => {
    expect(enumType([1, undefined]).defaultValue).toBe(1);

    expect(enumType([1, undefined], {}).defaultValue).toBe(1);

    expect(enumType([1, 2], { typeName: 'OneOrTwo' }).defaultValue).toBe(1);
  });

  test('an explicit undefined the enum does not list gives way to the first member', () => {
    const oneOrTwo = enumType([1, 2], { defaultValue: undefined });

    expect(oneOrTwo.defaultValue).toBe(1);

    assert.isTrue(oneOrTwo.is(oneOrTwo.defaultValue));
  });

  test('a default the enum does not list gives way to the first member', () => {
    // @ts-expect-error 5 is not a member
    const oneOrTwo = enumType([1, 2], { defaultValue: 5 });

    expect(oneOrTwo.defaultValue).toBe(1);

    assert.isTrue(oneOrTwo.is(oneOrTwo.defaultValue));

    const x: unknown = 'x';

    expect(oneOrTwo.fill(x)).toBe(1);
  });

  test('a default the options object inherits is read', () => {
    // `__proto__` in an object literal sets its prototype.
    const options = {
      __proto__: { defaultValue: 2 },
      // Only so that the literal shares a property with the options type, as
      // TypeScript asks of a type whose properties are all optional.
      typeName: 'OneOrTwo',
    } as const;

    assert.isFalse(hasKey(options, 'defaultValue'));

    expect(enumType([1, 2], options).defaultValue).toBe(2);
  });

  test('null options, from JavaScript, give the first member', () => {
    // @ts-expect-error options are an object or undefined
    // @sumi-expect-error null/no-null-literal
    expect(enumType([1, 2], null).defaultValue).toBe(1);
  });

  test('fill uses a nullish default', () => {
    const x: unknown = 'x';

    // @sumi-expect-error null/no-null-literal
    expect(enumType([1, null], { defaultValue: null }).fill(x)).toBeNull();
  });
});

describe.each([
  {
    name: 'an enum',
    build: (getDefault: () => 'red' | 'green') =>
      enumType(['red', 'green'], {
        get defaultValue() {
          return getDefault();
        },
      }),
  },
  {
    name: 'an enum that allows any string',
    build: (getDefault: () => 'red' | 'green') =>
      enumType(['red', 'green'], {
        allowAnyString: true,
        get defaultValue() {
          return getDefault();
        },
      }),
  },
] as const)('the default of $name', ({ build }) => {
  test('is read once, when the type is built', () => {
    let mut_reads = 0;

    const color = build(() => {
      mut_reads += 1;

      return 'green';
    });

    expect(mut_reads).toBe(1);

    const notListed: unknown = 1;

    expect(color.fill(notListed)).toBe('green');

    expect(color.defaultValue).toBe('green');

    expect(mut_reads).toBe(1);
  });

  test('keeps the value read when the type was built', () => {
    let mut_current: 'red' | 'green' = 'green';

    const color = build(() => mut_current);

    mut_current = 'red';

    expect(color.defaultValue).toBe('green');
  });

  test('throws from enumType when its getter throws', () => {
    expect(() =>
      build(() => {
        // The throw is what the test is about.
        // @sumi-expect-error exceptions/no-throw
        throw new Error('no default');
      }),
    ).toThrow('no default');
  });
});
