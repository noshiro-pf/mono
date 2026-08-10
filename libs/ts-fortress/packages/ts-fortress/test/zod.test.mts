import { expectType } from 'ts-data-forge';
import * as z from 'zod';

test('JsonValueZod', () => {
  const JsonPrimitiveZod = z.union([
    z.boolean(),
    z.number(),
    z.string(),
    z.null(),
  ]);

  type JsonPrimitiveZod = z.infer<typeof JsonPrimitiveZod>;

  expectType<JsonPrimitiveZod, boolean | number | string | null>('=');

  type JsonValueZod =
    | JsonPrimitiveZod
    | Readonly<{ [k: string]: JsonValueZod }>
    | readonly JsonValueZod[];

  const JsonValueZod: z.ZodType<JsonValueZod> = z.lazy(() =>
    z.union([
      JsonPrimitiveZod,
      z.record(z.string(), JsonValueZod),
      z.array(JsonValueZod),
    ]),
  );

  assert.isTrue(JsonValueZod.safeParse({ a: 1, b: [1, 2, 3] }).success);
});

test('WrongSchema', () => {
  // ❌ This compiles but is incorrect!
  const WrongSchema = z.object({
    key1: 1, // Should be z.literal(1)
    key2: 'string', // Should be z.string()
  });

  type WrongSchema = z.infer<typeof WrongSchema>;

  expect(
    () => WrongSchema.safeParse({ key1: 1, key2: 'string' }).success,
  ).toThrow(new Error('Invalid element at key "key1": expected a Zod schema'));
});

describe('api check', () => {
  test('maxLength', () => {
    const s = z.string().check(z.maxLength(5));

    assert.isTrue(s.safeParse('12').success);

    assert.isTrue(s.safeParse('1234').success);

    assert.isFalse(s.safeParse('123456').success);
  });

  test('maxLength2', () => {
    const s = z.string().max(5);

    assert.isTrue(s.safeParse('12').success);

    assert.isTrue(s.safeParse('1234').success);

    assert.isFalse(s.safeParse('123456').success);
  });

  test('max and min', () => {
    const s = z.string().min(3).max(5);

    assert.isFalse(s.safeParse('12').success);

    assert.isTrue(s.safeParse('1234').success);

    assert.isFalse(s.safeParse('123456').success);
  });
});
