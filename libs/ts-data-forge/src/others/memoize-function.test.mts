import { memoizeFunction } from './memoize-function.mjs';

describe(memoizeFunction, () => {
  test('should cache results for the same arguments', () => {
    const mockFn = vi.fn((x: number) => x * 2);

    const memoized = memoizeFunction(mockFn, (x) => x);

    // First call
    expect(memoized(5)).toBe(10);

    expect(mockFn).toHaveBeenCalledOnce();

    // Second call with same argument - should use cache
    expect(memoized(5)).toBe(10);

    expect(mockFn).toHaveBeenCalledOnce();

    // Call with different argument
    expect(memoized(3)).toBe(6);

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  test('should work with multiple arguments', () => {
    const mockFn = vi.fn((a: number, b: number) => a + b);

    const memoized = memoizeFunction(mockFn, (a, b) => `${a},${b}`);

    expect(memoized(2, 3)).toBe(5);

    expect(mockFn).toHaveBeenCalledOnce();

    expect(memoized(2, 3)).toBe(5);

    expect(mockFn).toHaveBeenCalledOnce();

    expect(memoized(3, 2)).toBe(5);

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  test('should handle functions that return undefined', () => {
    const mockFn = vi.fn((_x: number) => undefined);

    const memoized = memoizeFunction(mockFn, (x) => x);

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(memoized(5)).toBeUndefined();

    expect(mockFn).toHaveBeenCalledOnce();

    // Should use cache even for undefined
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(memoized(5)).toBeUndefined();

    expect(mockFn).toHaveBeenCalledOnce();
  });

  test('should work with object arguments using primitive cache keys', () => {
    type User = Readonly<{ id: number; name: string }>;

    const mockFn = vi.fn((user: User) => `Hello ${user.name}`);

    const memoized = memoizeFunction(mockFn, (user) => user.id);

    const user1 = { id: 1, name: 'Alice' };

    const user2 = { id: 1, name: 'Bob' }; // Same id, different name

    const user3 = { id: 2, name: 'Charlie' };

    expect(memoized(user1)).toBe('Hello Alice');

    expect(mockFn).toHaveBeenCalledOnce();

    // Same id, should use cache (even though name is different)
    expect(memoized(user2)).toBe('Hello Alice');

    expect(mockFn).toHaveBeenCalledOnce();

    // Different id, should call function
    expect(memoized(user3)).toBe('Hello Charlie');

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  test('should work with different cache key types', () => {
    // Number key
    const withNumber = memoizeFunction(
      (x: string) => x.length,
      (x) => x.length,
    );

    expect(withNumber('hello')).toBe(5);

    expect(withNumber('world')).toBe(5); // Same length, uses cache

    // Boolean key
    const withBoolean = memoizeFunction(
      (x: number) => x * 2,
      (x) => x > 0,
    );

    expect(withBoolean(5)).toBe(10);

    expect(withBoolean(3)).toBe(10); // Both positive, uses cache

    expect(withBoolean(-2)).toBe(-4); // Negative, new cache entry

    // Symbol key
    const sym1 = Symbol('test');

    const sym2 = Symbol('test');

    const withSymbol = memoizeFunction(
      (_s: symbol) => Math.random(),
      (s) => s,
    );

    const result1 = withSymbol(sym1);

    expect(withSymbol(sym1)).toBe(result1); // Same symbol, uses cache

    expect(withSymbol(sym2)).not.toBe(result1); // Different symbol
  });

  test('should handle null and undefined cache keys', () => {
    const mockFn = vi.fn((x: string | null | undefined) => x ?? 'default');

    const memoized = memoizeFunction(mockFn, (x) => x);

    expect(memoized(null)).toBe('default');

    expect(mockFn).toHaveBeenCalledOnce();

    expect(memoized(null)).toBe('default');

    expect(mockFn).toHaveBeenCalledOnce();

    expect(memoized(undefined)).toBe('default');

    expect(mockFn).toHaveBeenCalledTimes(2);

    expect(memoized(undefined)).toBe('default');

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  test('should maintain separate caches for different memoized functions', () => {
    const fn1 = vi.fn((x: number) => x * 2);

    const fn2 = vi.fn((x: number) => x * 3);

    const memoized1 = memoizeFunction(fn1, (x) => x);

    const memoized2 = memoizeFunction(fn2, (x) => x);

    expect(memoized1(5)).toBe(10);

    expect(memoized2(5)).toBe(15);

    expect(fn1).toHaveBeenCalledOnce();

    expect(fn2).toHaveBeenCalledOnce();

    // Each has its own cache
    expect(memoized1(5)).toBe(10);

    expect(memoized2(5)).toBe(15);

    expect(fn1).toHaveBeenCalledOnce();

    expect(fn2).toHaveBeenCalledOnce();
  });

  test('should work with complex cache key generation', () => {
    type Args = Readonly<{
      category: string;
      subcategory: string;
      id: number;
    }>;

    const mockFn = vi.fn(
      (args: Args) => `${args.category}/${args.subcategory}/${args.id}`,
    );

    const memoized = memoizeFunction(
      mockFn,
      (args) => `${args.category}:${args.subcategory}:${args.id}`,
    );

    const args1 = { category: 'books', subcategory: 'fiction', id: 123 };

    const args2 = { category: 'books', subcategory: 'fiction', id: 123 };

    const args3 = { category: 'books', subcategory: 'fiction', id: 124 };

    expect(memoized(args1)).toBe('books/fiction/123');

    expect(mockFn).toHaveBeenCalledOnce();

    // Same cache key, should use cache
    expect(memoized(args2)).toBe('books/fiction/123');

    expect(mockFn).toHaveBeenCalledOnce();

    // Different id, different cache key
    expect(memoized(args3)).toBe('books/fiction/124');

    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
