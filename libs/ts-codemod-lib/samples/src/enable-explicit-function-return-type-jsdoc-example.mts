import dedent from 'dedent';
import {
  enableExplicitFunctionReturnTypeTransformer,
  transformSourceCode,
} from 'ts-codemod-lib';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const before = dedent`
      export const double = (x: number) => x * 2;

      export function isString(x: unknown) {
        return typeof x === 'string';
      }

      export const handlers = [1, 2].map((x) => x + 1);
    `;

    const after = transformSourceCode(before, false, [
      enableExplicitFunctionReturnTypeTransformer({ allowExpressions: true }),
    ]);

    assert.strictEqual(
      after.trim(),
      dedent`
        export const double = (x: number): number => x * 2;

        export function isString(x: unknown): x is string {
          return typeof x === 'string';
        }

        export const handlers = [1, 2].map((x) => x + 1);
      `,
    );

    // embed-sample-code-ignore-below
  });
}
