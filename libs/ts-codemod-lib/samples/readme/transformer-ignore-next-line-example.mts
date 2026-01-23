/* eslint-disable vitest/expect-expect */
import { expectType } from 'ts-data-forge';

// embed-sample-code-ignore-above
// Before
type Config = {
  apiKey: string;
  // transformer-ignore-next-line
  mutableOptions: string[]; // This line will not be made Readonly
  settings: { timeout: number };
};

// After applying convertToReadonlyTypeTransformer
type Config2 = Readonly<{
  apiKey: string;
  mutableOptions: string[]; // Not made Readonly because it was skipped
  settings: Readonly<{ timeout: number }>;
}>;

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('transformer-ignore-next-line-example', () => {
    expectType<
      Config,
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
        mutableOptions: string[];
        settings: Readonly<{ timeout: number }>;
      }>
    >('=');
  });
}
