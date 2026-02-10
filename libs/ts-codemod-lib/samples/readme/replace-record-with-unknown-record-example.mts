/* eslint-disable vitest/expect-expect */
import { expectType } from 'ts-data-forge';

// embed-sample-code-ignore-above
// Before
/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line replace-record-with-unknown-record, convert-to-readonly
type Config = Record<string, unknown>;

/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line replace-record-with-unknown-record, convert-to-readonly
type ReadonlyConfig = Readonly<Record<string, unknown>>;

/* embed-sample-code-ignore-this-line */ // transformer-ignore-next-line replace-record-with-unknown-record, convert-to-readonly
type Data = Record<string, unknown>;

// After
type Config2 = UnknownRecord;

type ReadonlyConfig2 = UnknownRecord;

type Data2 = UnknownRecord;

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('replace-record-with-unknown-record-example', () => {
    expectType<Config, Record<string, unknown>>('=');

    expectType<ReadonlyConfig, Readonly<Record<string, unknown>>>('=');

    expectType<Data, Record<string, unknown>>('=');

    expectType<Config2, UnknownRecord>('=');

    expectType<ReadonlyConfig2, UnknownRecord>('=');

    expectType<Data2, UnknownRecord>('=');
  });
}
