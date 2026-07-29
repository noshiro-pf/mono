import * as z from 'zod';

// ❌ This compiles but is incorrect!
const SomeObjectIncorrect = z.object({
  key1: 1, // Should be z.literal(1)
  key2: 'string', // Should be z.string()
});

type SomeObjectIncorrect = z.infer<typeof SomeObjectIncorrect>; // inferred as { key1: unknown, key2: unknown }

// embed-sample-code-ignore-below
export { SomeObjectIncorrect };

// eslint-disable-next-line import-x/first
import { expectType } from 'ts-data-forge';

expectType<
  SomeObjectIncorrect,
  // transformer-ignore-next-line
  {
    key1: unknown;
    key2: unknown;
  }
>('=');
