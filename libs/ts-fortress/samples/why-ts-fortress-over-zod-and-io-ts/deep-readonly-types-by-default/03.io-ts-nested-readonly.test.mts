import * as ioTs from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';

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

const invalidData = {
  user: {
    profile: {
      age: 'not-a-number', // should be number
    },
  },
} as const;

// Get io-ts error messages
const ioTsResult = IoTsNestedReadonly.decode(invalidData);
const ioTsErrorMessages = PathReporter.report(ioTsResult);

assert.equal(
  ioTsErrorMessages[0],
  `Invalid value "not-a-number" supplied to : Readonly<{ user: Readonly<{ profile: Readonly<{ age: number }> }> }>/user: Readonly<{ profile: Readonly<{ age: number }> }>/profile: Readonly<{ age: number }>/age: number`,
);
