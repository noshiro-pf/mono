import dedent from 'dedent';
import {
  appendAsConstTransformer,
  convertInterfaceToTypeTransformer,
  convertToReadonlyTransformer,
  replaceAnyWithUnknownTransformer,
  replaceRecordWithUnknownRecordTransformer,
  transformSourceCode,
} from 'ts-codemod-lib';

const originalCode = dedent`
  export interface A {
    name?: string;
    point: [x: number, y: number, z?: number];
    meta: {
      description?: string;
      tags: string[];
      attributes: Record<string, unknown>;
      data?: any;
    };
  }

  export const obj = {
    point: [1, 2],
    meta: {
      tags: ['example', 'test'],
      attributes: {
        key1: 'value1',
        key2: 42,
      },
    },
  } satisfies A;

  export const arr = ['a', {}, 0];
`;

const isTsx = false;

// Apply transformations to source code
const transformedCode = transformSourceCode(originalCode, isTsx, [
  convertInterfaceToTypeTransformer(),
  replaceRecordWithUnknownRecordTransformer(),
  convertToReadonlyTransformer(),
  appendAsConstTransformer(),
  replaceAnyWithUnknownTransformer(),
]);

const expected = dedent`
  export type A = Readonly< {
    name?: string;
    point: (readonly  [x: number, y: number, z?: number]);
    meta: Readonly< {
        description?: string;
        tags: (readonly  string[]);
        attributes: UnknownRecord;
        data?: unknown;
      }>;
  }>;

  export const obj = {
    point: [1, 2],
    meta: {
      tags: ['example', 'test'],
      attributes: {
        key1: 'value1',
        key2: 42,
      },
    },
  } as const satisfies A;

  export const arr = ['a', {}, 0] as const;
`;

if (import.meta.vitest !== undefined) {
  test('transformSourceCode', () => {
    assert.isTrue(transformedCode === expected);
  });
}
