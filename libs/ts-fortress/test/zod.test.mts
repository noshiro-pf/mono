import { expectType } from 'ts-data-forge';
import { test } from 'vitest';
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

  expect(JsonValueZod.safeParse({ a: 1, b: [1, 2, 3] }).success).toBe(true);
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
  ).toThrow(
    new TypeError("Cannot read properties of undefined (reading 'traits')"),
  );
});
