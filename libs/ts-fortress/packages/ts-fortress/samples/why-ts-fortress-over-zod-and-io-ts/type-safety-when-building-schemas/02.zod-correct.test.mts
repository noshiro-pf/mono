import * as z from 'zod';

// embed-sample-code-ignore-above

// ✅ Correct Zod usage
const SomeObject = z.object({
  key1: z.literal(1),
  key2: z.string(),
});

// embed-sample-code-ignore-below
export { SomeObject };

// eslint-disable-next-line import-x/first
import { expectType } from 'ts-data-forge';

type SomeObject = z.infer<typeof SomeObject>;

expectType<
  SomeObject,
  // transformer-ignore-next-line convert-to-readonly
  {
    key1: 1;
    key2: string;
  }
>('=');
