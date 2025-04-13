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
  export type SimpleAny = any;

  export type ReadonlyAnyArray = readonly any[];

  export const fnWithAnyArgs = (...args: any): any => {
    return args;
  };

  export type TupleWithAnyRest = [number, ...rest: any];

  export const simpleArray = [1, 2, 3];

  export const simpleObject = { a: 'hello', b: true };

  export const nestedLiteral = {
    data: [10, 20 as const],
    config: { enabled: false },
  };

  export const alreadyAsConst = [1, 2] as const;

  export const nestedAsConst = [[1, 2] as const, [3, 4]] as const;

  export const primitiveAsConst = [1 as const, 'b' as const, true as const];

  export const mixedAsConst = {
    items: [1 as const, { value: 'v' as const }],
  } as const;

  export type BasicArray = string[];

  export type BasicObject = { name: string; items: number[] };

  export interface MyInterface {
    prop: boolean[];
    method(data: object[]): string[];
  }

  export class MyClass {
    constructor(private config: { settings: string[] }) {}
    getConfig(): { settings: string[] } {
      return this.config;
    }
  }

  export const arrowFn = (_input: Date[]): Map<string, number[]> => new Map();

  // ignorePrefixes examples

  export function mut_processData(_data: string[]): number[] {
    return [];
  }

  export const mut_variable: { items: any[] } = { items: [] };

  export const [mut_arr]: [string[]] = [['a']];

  export const { mut_obj }: { mut_obj: any[] } = { mut_obj: [] };

  export class IgnoredParams {
    constructor(mut_config: any[]) {
      console.log(mut_config);
    }
    update(mut_data: object[]): void {
      console.log(this, mut_data);
    }
  }

  export type TypeWithIgnoredMethod = {
    process(mut_param: any[]): void;
  };

  export const handler = (mut_event: Event[], event: ComplexData[]) => {
    console.log(mut_event, event);
  };

  // transformer-ignore examples
  // transformer-ignore-next-line replaceAnyWithUnknownTransformer
  export type IgnoredAny = any;

  export type RegularAny = any; // Should become unknown

  /* transformer-ignore convertToReadonlyTypeTransformer */
  type MutableType = {
    data: string[];
  };

  export const createMutable = (): MutableType => ({ data: ['a'] });

  export type ShouldBeReadonly = {
    values: number[];
  };

  // Combined example
  type ComplexData = {
    id: number;
    values: any[]; // any -> unknown, array -> readonly
    settings: {
      enabled: boolean;
      thresholds: number[]; // array -> readonly
    };
  };

  export const initialData: ComplexData[] = [
    // array -> readonly
    {
      id: 1,
      values: [10, 'any', true as const], // any -> unknown, primitive as const removed
      settings: { enabled: true, thresholds: [0.5, 0.8] },
    },
  ]; // append as const to outer array

  export function processComplexData(
    data: ComplexData[],
    mut_options: any,
  ): ComplexData[] {
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
