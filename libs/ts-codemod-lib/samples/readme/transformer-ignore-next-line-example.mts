/* eslint-disable vitest/expect-expect */
import { expectType } from 'ts-data-forge';

// embed-sample-code-ignore-above
// Before
/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line
type Config = {
  apiKey: string;
  // transformer-ignore-next-line
  mutableOptions: string[]; // This line will not be made Readonly
  settings: { timeout: number };
};

// After applying convertToReadonlyTransformer
type Config2 = Readonly<{
  apiKey: string;
  // transformer-ignore-next-line
  mutableOptions: string[]; // Not made Readonly because it was skipped
  settings: Readonly<{ timeout: number }>;
}>;

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('transformer-ignore-next-line-example', () => {
    expectType<
      Config,
      /* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line
      {
        apiKey: string;
        mutableOptions: string[];
        settings: { timeout: number };
      }
    >('=');

    expectType<
      Config2,
      Readonly<{
        apiKey: string;
        /* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line
        mutableOptions: string[];
        settings: Readonly<{ timeout: number }>;
      }>
    >('=');
  });
}
