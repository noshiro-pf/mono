import { expectType } from '../expect-type.mjs';
import { pipe } from '../functional/index.mjs';
import { mapNullable } from './map-nullable.mjs';

describe(mapNullable, () => {
  describe('regular usage', () => {
    test('should apply function to non-null value', () => {
      const result = mapNullable('hello', (s) => s.toUpperCase());

      expect(result).toBe('HELLO');

      expectType<typeof result, string | undefined>('=');
    });

    test('should apply function to non-undefined value', () => {
      const result = mapNullable(42, (n) => n * 2);

      expect(result).toBe(84);

      expectType<typeof result, number | undefined>('=');
    });

    test('should return undefined for null input', () => {
      const result = mapNullable(null, (s: string) => s.toUpperCase());

      expect(result).toBeUndefined();

      expectType<typeof result, string | undefined>('=');
    });

    test('should return undefined for undefined input', () => {
      const result = mapNullable(undefined, (s: string) => s.toUpperCase());

      expect(result).toBeUndefined();

      expectType<typeof result, string | undefined>('=');
    });

    test('should work with complex transformations', () => {
      const user = { name: 'Alice', age: 30 };
      const result = mapNullable(
        user,
        (u) => `${u.name} is ${u.age} years old`,
      );

      expect(result).toBe('Alice is 30 years old');
    });

    test('should work with nullable object properties', () => {
      const user: { name?: string } = { name: 'Bob' };
      const result = mapNullable(user.name, (name) => name.toUpperCase());

      expect(result).toBe('BOB');

      const userWithoutName: { name?: string } = {};
      const resultEmpty = mapNullable(userWithoutName.name, (name) =>
        name.toUpperCase(),
      );

      expect(resultEmpty).toBeUndefined();
    });
  });

  describe('curried usage', () => {
    test('should support curried form with string transformation', () => {
      const toUpperCase = mapNullable((s: string) => s.toUpperCase());

      const result1 = toUpperCase('hello');

      expect(result1).toBe('HELLO');

      const result2 = toUpperCase(null);

      expect(result2).toBeUndefined();

      const result3 = toUpperCase(undefined);

      expect(result3).toBeUndefined();
    });

    test('should support curried form with number transformation', () => {
      const double = mapNullable((n: number) => n * 2);

      const result1 = double(21);

      expect(result1).toBe(42);

      const result2 = double(null);

      expect(result2).toBeUndefined();

      const result3 = double(undefined);

      expect(result3).toBeUndefined();
    });

    test('should support curried form with object transformation', () => {
      const getName = mapNullable(
        (u: Readonly<{ name: string; age: number }>) => u.name,
      );

      const user = { name: 'Charlie', age: 25 };
      const result1 = getName(user);

      expect(result1).toBe('Charlie');

      const result2 = getName(null);

      expect(result2).toBeUndefined();
    });

    test('should work with pipe composition', () => {
      const toUpperCase = mapNullable((s: string) => s.toUpperCase());
      const addGreeting = mapNullable((s: string) => `Hello, ${s}!`);

      const result = pipe('world').map(toUpperCase).map(addGreeting).value;

      expect(result).toBe('Hello, WORLD!');
    });

    test('should handle null values in pipe composition', () => {
      const toUpperCase = mapNullable((s: string) => s.toUpperCase());
      const addGreeting = mapNullable((s: string) => `Hello, ${s}!`);

      const result = pipe(null as string | null)
        .map(toUpperCase)
        .map(addGreeting).value;

      expect(result).toBeUndefined();
    });

    test('should work with multiple transformations in pipe', () => {
      const toStr = mapNullable((n: number) => n.toString());
      const addPrefix = mapNullable((s: string) => `Number: ${s}`);
      const toUpperCase = mapNullable((s: string) => s.toUpperCase());

      const result = pipe(42 as number | null)
        .map(toStr)
        .map(addPrefix)
        .map(toUpperCase).value;

      expect(result).toBe('NUMBER: 42');
    });
  });

  describe('edge cases and type safety', () => {
    test('should preserve type information', () => {
      expectTypeOf(mapNullable('test', (s) => s.length)).toEqualTypeOf<
        number | undefined
      >();

      expectTypeOf(mapNullable(42, (n) => n.toString())).toEqualTypeOf<
        string | undefined
      >();

      expectTypeOf(mapNullable(true, (b) => !b)).toEqualTypeOf<
        boolean | undefined
      >();
    });

    test('should work with zero values', () => {
      const result = mapNullable(0, (n) => n + 1);

      expect(result).toBe(1);
    });

    test('should work with empty string', () => {
      const result = mapNullable('', (s) => s.length);

      expect(result).toBe(0);
    });

    test('should work with false boolean', () => {
      const result = mapNullable(false, (b) => !b);

      expect(result).toBe(true);
    });

    test('should work with arrays', () => {
      const result = mapNullable([1, 2, 3], (arr) => arr.length);

      expect(result).toBe(3);

      const nullResult = mapNullable(
        null as number[] | null,
        (arr) => arr.length,
      );

      expect(nullResult).toBeUndefined();
    });

    test('should work with nested objects', () => {
      const data = {
        user: { profile: { name: 'Alice' } },
        settings: { theme: 'dark' },
      };

      const result = mapNullable(data, (d) => d.user.profile.name);

      expect(result).toBe('Alice');
    });
  });

  describe('chaining operations', () => {
    test('should chain multiple mapNullable operations', () => {
      const getValue = (): string | null => 'hello';

      const step1 = mapNullable(getValue(), (s) => s.toUpperCase());
      const step2 = mapNullable(step1, (s) => s.length);
      const step3 = mapNullable(step2, (n) => n * 2);

      expect(step3).toBe(10); // 'HELLO'.length * 2 = 5 * 2 = 10
    });

    test('should short-circuit on null in chain', () => {
      const getValue = (): string | null => null;

      const step1 = mapNullable(getValue(), (s) => s.toUpperCase());
      const step2 = mapNullable(step1, (s) => s.length);
      const step3 = mapNullable(step2, (n) => n * 2);

      expect(step1).toBeUndefined();
      expect(step2).toBeUndefined();
      expect(step3).toBeUndefined();
    });

    test('should work with curried functions in chain', () => {
      const toUpperCase = mapNullable((s: string) => s.toUpperCase());
      const getLength = mapNullable((s: string) => s.length);
      const double = mapNullable((n: number) => n * 2);

      const input1 = 'hello';
      const result1 = double(getLength(toUpperCase(input1)));

      expect(result1).toBe(10);

      const input2: string | null = null;
      const result2 = double(getLength(toUpperCase(input2)));

      expect(result2).toBeUndefined();
    });
  });

  describe('practical use cases', () => {
    test('should work with API response handling', () => {
      type ApiResponse = DeepReadonly<{
        data?: {
          user?: {
            name?: string;
            email?: string;
          };
        };
      }>;

      const response: ApiResponse = {
        data: {
          user: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
      };

      const extractUserName = mapNullable(
        (r: ApiResponse) => r.data?.user?.name,
      );
      const formatName = mapNullable((name: string) => `Mr. ${name}`);

      const userName = extractUserName(response);
      const formattedName = formatName(userName);

      expect(formattedName).toBe('Mr. John Doe');
    });

    test('should work with form data processing', () => {
      type FormDataType = Readonly<{
        email?: string;
        age?: string;
      }>;

      const formData: FormDataType = {
        email: 'test@example.com',
        age: '25',
      };

      const extractAge = mapNullable((data: FormDataType) => data.age);
      const parseAge = mapNullable((ageStr: string) =>
        Number.parseInt(ageStr, 10),
      );
      const validateAge = mapNullable((age: number) =>
        age >= 18 ? age : null,
      );

      const extractedAge = extractAge(formData);
      const parsedAge = parseAge(extractedAge);
      const validAge = validateAge(parsedAge);

      expect(validAge).toBe(25);
    });

    test('should handle missing data gracefully', () => {
      type FormDataType = Readonly<{
        email?: string;
        age?: string;
      }>;

      const incompleteFormData: FormDataType = {
        email: 'test@example.com',
        // age is missing
      };

      const extractAge = mapNullable((data: FormDataType) => data.age);
      const parseAge = mapNullable((ageStr: string) =>
        Number.parseInt(ageStr, 10),
      );

      const extractedAge = extractAge(incompleteFormData);
      const parsedAge = parseAge(extractedAge);

      expect(extractedAge).toBeUndefined();
      expect(parsedAge).toBeUndefined();
    });
  });
});
