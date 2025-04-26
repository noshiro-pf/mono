/* eslint-disable
  @typescript-eslint/consistent-type-definitions,
  @typescript-eslint/no-useless-empty-export,
  arrow-body-style,
  @typescript-eslint/prefer-readonly,
  @typescript-eslint/parameter-properties,
  no-restricted-globals,
  @typescript-eslint/no-restricted-types,
  @typescript-eslint/explicit-function-return-type,
  @typescript-eslint/method-signature-style,
  functional/prefer-property-signatures,
  @typescript-eslint/prefer-readonly-parameter-types,
  @typescript-eslint/no-explicit-any
 */
// Example code combining features from various tests

import { castMutable } from '@noshiro/ts-utils';

namespace TestCode {
  export type SimpleAny = unknown;

  export type ReadonlyAnyArray = readonly unknown[];

  export const fnWithAnyArgs = (...args: readonly unknown[]): unknown => {
    return args;
  };

  export type TupleWithAnyRest = readonly [number, rest: readonly unknown[]];

  export const simpleArray = [1, 2, 3] as const;

  export const simpleObject = { a: 'hello', b: true } as const;

  export const nestedLiteral = {
    data: [10, 20],
    config: { enabled: false },
  } as const;

  export const alreadyAsConst = [1, 2] as const;

  export const nestedAsConst = [
    [1, 2],
    [3, 4],
  ] as const;

  export const primitiveAsConst = [1, 'b', true] as const;

  export const mixedAsConst = {
    items: [1, { value: 'v' }],
  } as const;

  export type BasicArray = readonly string[];

  export type BasicObject = Readonly<{
    name: string;
    items: readonly number[];
  }>;

  export interface MyInterface {
    readonly prop: readonly boolean[];
    method(data: readonly object[]): readonly string[];
  }

  export class MyClass {
    constructor(
      private readonly config: Readonly<{
        settings: readonly string[];
      }>,
    ) {}
    getConfig(): Readonly<{
      settings: readonly string[];
    }> {
      return this.config;
    }
  }

  export const arrowFn = (
    _input: readonly Date[],
  ): ReadonlyMap<string, readonly number[]> => new Map();

  // ignorePrefixes examples

  export function mut_processData(_data: string[]): number[] {
    return [] as const;
  }

  export const mut_variable: {
    items: unknown[];
  } = { items: [] };

  export const [mut_arr]: readonly [readonly string[]] = [['a']] as const;

  export const {
    mut_obj,
  }: Readonly<{
    mut_obj: unknown[];
  }> = { mut_obj: [] } as const;

  export class IgnoredParams {
    constructor(mut_config: unknown[]) {
      console.log(mut_config);
    }
    update(mut_data: object[]): void {
      console.log(this, mut_data);
    }
  }

  export type TypeWithIgnoredMethod = Readonly<{
    process(mut_param: unknown[]): void;
  }>;

  export const handler = (
    mut_event: Event[],
    event: readonly ComplexData[],
  ) => {
    console.log(mut_event, event);
  };

  // transformer-ignore examples
  // transformer-ignore-next-line replaceAnyWithUnknownTransformer
  export type IgnoredAny = any;

  export type RegularAny = unknown; // Should become unknown

  /* transformer-ignore convertToReadonlyTypeTransformer */
  type MutableType = Readonly<{
    data: readonly string[];
  }>;

  export const createMutable = (): MutableType => ({ data: ['a'] }) as const;

  export type ShouldBeReadonly = Readonly<{
    values: readonly number[];
  }>;

  // Combined example
  type ComplexData = Readonly<{
    id: number;
    values: readonly unknown[]; // any -> unknown, array -> readonly
    settings: Readonly<{
      enabled: boolean;
      thresholds: readonly number[]; // array -> readonly
    }>;
  }>;

  export const initialData: readonly ComplexData[] = [
    // array -> readonly
    {
      id: 1,
      values: [10, 'any', true], // any -> unknown, primitive as const removed
      settings: { enabled: true, thresholds: [0.5, 0.8] },
    },
  ] as const; // append as const to outer array

  export function processComplexData(
    data: readonly ComplexData[],
    mut_options: unknown,
  ): readonly ComplexData[] {
    // mut_options should remain any due to prefix
    // data and return type should become readonly
    const processed = data.map((d) => ({ ...d, processed: true }));
    console.log(mut_options);
    return castMutable(processed);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
TestCode.IgnoredParams;

export {};
