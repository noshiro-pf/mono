/**
 * Investigation script to examine io-ts readonly type error messages
 *
 * This script demonstrates how io-ts readonly types produce verbose error messages
 * that include unnecessary type wrapper information, making them harder to read
 * and debug in production environments.
 *
 * Key findings:
 * 1. Simple readonly types add "Readonly<...>" wrapper to error messages
 * 2. Nested readonly types create exponentially verbose error messages
 * 3. Each level of nesting adds another "Readonly<...>" wrapper
 * 4. This makes production debugging significantly harder
 *
 * Example error type names:
 * - Mutable: "{ id: number, name: string, email: string }"
 * - Readonly: "Readonly<{ id: number, name: string, email: string }>"
 * - Nested readonly: "Readonly<{ user: Readonly<{ profile: Readonly<{ age: number }> }> }>"
 *
 * Run with DEBUG=1 to see full error output:
 * DEBUG=1 npm test -- test/io-ts-readonly-error-investigation.mts
 */

import * as ioTs from 'io-ts';
import { expectType } from 'ts-data-forge';
import * as z from 'zod';
// eslint-disable-next-line import-x/no-internal-modules
import { PathReporter } from 'io-ts/PathReporter';
// eslint-disable-next-line import-x/no-internal-modules
import * as tf from '../src/entry-point.mjs';

describe('Error message comparison: io-ts vs zod vs ts-fortress', () => {
  test('Simple structure: io-ts verbose Readonly wrapper vs zod vs ts-fortress', () => {
    // io-ts simple readonly structure
    const IoTsSimpleReadonly = ioTs.readonly(
      ioTs.type({
        name: ioTs.string,
        age: ioTs.number,
      }),
    );

    type IoTsSimpleReadonly = ioTs.TypeOf<typeof IoTsSimpleReadonly>;

    // zod readonly equivalent
    const ZodSimpleType = z
      .object({
        name: z.string(),
        age: z.number(),
      })
      .readonly();

    type ZodSimpleType = z.infer<typeof ZodSimpleType>;

    // ts-fortress equivalent
    const TsFortressSimpleType = tf.record({
      name: tf.string(),
      age: tf.number(),
    });

    type TsFortressSimpleType = tf.TypeOf<typeof TsFortressSimpleType>;

    expectType<IoTsSimpleReadonly, ZodSimpleType>('=');

    expectType<ZodSimpleType, TsFortressSimpleType>('=');

    const invalidData = {
      name: 'John',
      age: 'twenty-five', // should be number
    };

    // Get io-ts error messages
    const ioTsResult = IoTsSimpleReadonly.decode(invalidData);

    const ioTsErrorMessages = PathReporter.report(ioTsResult);

    // Get zod error messages using prettifyError
    const zodResult = ZodSimpleType.safeParse(invalidData);

    const zodErrorMessages = zodResult.success
      ? ''
      : z.prettifyError(zodResult.error);

    // Get ts-fortress error messages
    const tsFortressResult = TsFortressSimpleType.validate(invalidData);

    const tsFortressErrorMessages = tf.Result.isErr(tsFortressResult)
      ? tf.validationErrorsToMessages(tsFortressResult.value)
      : [];

    // io-ts adds unnecessary "Readonly<...>" wrapper

    assert.deepStrictEqual(ioTsErrorMessages, [
      'Invalid value "twenty-five" supplied to : Readonly<{ name: string, age: number }>/age: number',
    ]);

    // zod produces clear path-based error message with visual formatting

    expect(zodErrorMessages).toBe(
      '✖ Invalid input: expected number, received string\n  → at age',
    );

    // ts-fortress produces clean, focused error message

    assert.deepStrictEqual(tsFortressErrorMessages, [
      'Error at age: expected <number> value but <string> type value "twenty-five" was passed.',
    ]);
  });

  test('Nested structures: io-ts exponentially verbose vs zod vs ts-fortress', () => {
    // io-ts nested readonly version with multiple Readonly wrappers
    const IoTsNestedReadonly = ioTs.readonly(
      ioTs.type({
        user: ioTs.readonly(
          ioTs.type({
            profile: ioTs.readonly(
              ioTs.type({
                age: ioTs.number,
              }),
            ),
          }),
        ),
      }),
    );

    type IoTsNestedReadonly = ioTs.TypeOf<typeof IoTsNestedReadonly>;

    // zod nested readonly equivalent
    const ZodNestedType = z
      .object({
        user: z
          .object({
            profile: z
              .object({
                age: z.number(),
              })
              .readonly(),
          })
          .readonly(),
      })
      .readonly();

    type ZodNestedType = z.infer<typeof ZodNestedType>;

    // ts-fortress equivalent clean structure
    const TsFortressNestedType = tf.record({
      user: tf.record({
        profile: tf.record({
          age: tf.number(),
        }),
      }),
    });

    type TsFortressNestedType = tf.TypeOf<typeof TsFortressNestedType>;

    expectType<IoTsNestedReadonly, ZodNestedType>('=');

    expectType<ZodNestedType, TsFortressNestedType>('=');

    const invalidData = {
      user: {
        profile: {
          age: 'not-a-number', // should be number
        },
      },
    };

    // Get io-ts error messages
    const ioTsResult = IoTsNestedReadonly.decode(invalidData);

    const ioTsErrorMessages = PathReporter.report(ioTsResult);

    // Get zod error messages using prettifyError
    const zodResult = ZodNestedType.safeParse(invalidData);

    const zodErrorMessages = zodResult.success
      ? ''
      : z.prettifyError(zodResult.error);

    // Get ts-fortress error messages
    const tsFortressResult = TsFortressNestedType.validate(invalidData);

    const tsFortressErrorMessages = tf.Result.isErr(tsFortressResult)
      ? tf.validationErrorsToMessages(tsFortressResult.value)
      : [];

    // io-ts produces extremely verbose error with triple nested Readonly wrappers

    assert.deepStrictEqual(ioTsErrorMessages, [
      'Invalid value "not-a-number" supplied to : Readonly<{ user: Readonly<{ profile: Readonly<{ age: number }> }> }>/user: Readonly<{ profile: Readonly<{ age: number }> }>/profile: Readonly<{ age: number }>/age: number',
    ]);

    // zod produces clear nested path error message with visual formatting

    expect(zodErrorMessages).toBe(
      '✖ Invalid input: expected number, received string\n  → at user.profile.age',
    );

    // ts-fortress produces clean, actionable error message

    assert.deepStrictEqual(tsFortressErrorMessages, [
      'Error at user.profile.age: expected <number> value but <string> type value "not-a-number" was passed.',
    ]);
  });

  test('Multiple validation errors: io-ts compounds verbosity vs zod vs ts-fortress', () => {
    // io-ts complex nested readonly structure
    const IoTsComplexReadonly = ioTs.readonly(
      ioTs.type({
        user: ioTs.readonly(
          ioTs.type({
            id: ioTs.number,
            profile: ioTs.readonly(
              ioTs.type({
                age: ioTs.number,
                score: ioTs.number,
              }),
            ),
          }),
        ),
      }),
    );

    type IoTsComplexReadonly = ioTs.TypeOf<typeof IoTsComplexReadonly>;

    // zod complex readonly equivalent
    const ZodComplexType = z
      .object({
        user: z
          .object({
            id: z.number(),
            profile: z
              .object({
                age: z.number(),
                score: z.number(),
              })
              .readonly(),
          })
          .readonly(),
      })
      .readonly();

    type ZodComplexType = z.infer<typeof ZodComplexType>;

    // ts-fortress equivalent structure
    const TsFortressComplexType = tf.record({
      user: tf.record({
        id: tf.number(),
        profile: tf.record({
          age: tf.number(),
          score: tf.number(),
        }),
      }),
    });

    type TsFortressComplexType = tf.TypeOf<typeof TsFortressComplexType>;

    expectType<IoTsComplexReadonly, ZodComplexType>('=');

    expectType<ZodComplexType, TsFortressComplexType>('=');

    const invalidData = {
      user: {
        id: 'invalid', // error 1
        profile: {
          age: 'not-a-number', // error 2
          score: false, // error 3
        },
      },
    };

    // Get io-ts error messages
    const ioTsResult = IoTsComplexReadonly.decode(invalidData);

    const ioTsErrorMessages = PathReporter.report(ioTsResult);

    // Get zod error messages using prettifyError
    const zodResult = ZodComplexType.safeParse(invalidData);

    const zodErrorMessages = zodResult.success
      ? ''
      : z.prettifyError(zodResult.error);

    // Get ts-fortress error messages
    const tsFortressResult = TsFortressComplexType.validate(invalidData);

    const tsFortressErrorMessages = tf.Result.isErr(tsFortressResult)
      ? tf.validationErrorsToMessages(tsFortressResult.value)
      : [];

    // io-ts produces multiple extremely verbose error messages

    assert.deepStrictEqual(ioTsErrorMessages, [
      'Invalid value "invalid" supplied to : Readonly<{ user: Readonly<{ id: number, profile: Readonly<{ age: number, score: number }> }> }>/user: Readonly<{ id: number, profile: Readonly<{ age: number, score: number }> }>/id: number',
      'Invalid value "not-a-number" supplied to : Readonly<{ user: Readonly<{ id: number, profile: Readonly<{ age: number, score: number }> }> }>/user: Readonly<{ id: number, profile: Readonly<{ age: number, score: number }> }>/profile: Readonly<{ age: number, score: number }>/age: number',
      'Invalid value false supplied to : Readonly<{ user: Readonly<{ id: number, profile: Readonly<{ age: number, score: number }> }> }>/user: Readonly<{ id: number, profile: Readonly<{ age: number, score: number }> }>/profile: Readonly<{ age: number, score: number }>/score: number',
    ]);

    // zod produces organized path-based error messages with visual formatting

    expect(zodErrorMessages).toBe(
      '✖ Invalid input: expected number, received string\n  → at user.id\n✖ Invalid input: expected number, received string\n  → at user.profile.age\n✖ Invalid input: expected number, received boolean\n  → at user.profile.score',
    );

    // ts-fortress produces clean, specific error messages for each issue

    assert.deepStrictEqual(tsFortressErrorMessages, [
      'Error at user.id: expected <number> value but <string> type value "invalid" was passed.',
      'Error at user.profile.age: expected <number> value but <string> type value "not-a-number" was passed.',
      'Error at user.profile.score: expected <number> value but <boolean> type value `false` was passed.',
    ]);
  });
});
