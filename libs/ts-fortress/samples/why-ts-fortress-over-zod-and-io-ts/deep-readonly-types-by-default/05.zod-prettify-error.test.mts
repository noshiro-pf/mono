/* eslint-disable import-x/first */

const invalidData = {
  user: {
    profile: {
      age: 'not-a-number', // should be number
    },
  },
};

// embed-sample-code-ignore-above

import * as z from 'zod';

// Zod nested readonly equivalent
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

// Get Zod error messages using prettifyError
const zodResult = ZodNestedType.safeParse(invalidData);

const zodErrorMessages = zodResult.success
  ? ''
  : z.prettifyError(zodResult.error);

assert.strictEqual(
  zodErrorMessages,
  '✖ Invalid input: expected number, received string\n  → at user.profile.age',
);
