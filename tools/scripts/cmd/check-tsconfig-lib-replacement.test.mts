import dedent from 'dedent';
import { findLibReplacementViolations } from './check-tsconfig-lib-replacement.mjs';

const file = (
  content: string,
): Readonly<{ relativePath: string; content: string }> =>
  ({ relativePath: 'libs/a/tsconfig.json', content }) as const;

describe(findLibReplacementViolations, () => {
  test('accepts `true`', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations([
        file(dedent`
          {
            "compilerOptions": { "libReplacement": true }
          }
        `),
      ]),
      [],
    );
  });

  test('accepts `false` with a comment above it', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations([
        file(dedent`
          {
            "compilerOptions": {
              // The strict library depends on this package.
              "libReplacement": false
            }
          }
        `),
      ]),
      [],
    );
  });

  test('accepts `false` with a comment on the same line', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations([
        file(dedent`
          {
            "compilerOptions": {
              "libReplacement": false // Runs under TypeScript 5.7.
            }
          }
        `),
      ]),
      [],
    );
  });

  test('reports a file without `compilerOptions`', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations([
        file(dedent`
          {
            "extends": "../../tools/configs/tsconfig/tsconfig.type-check.json",
            "include": ["./src"]
          }
        `),
      ]),
      [{ relativePath: 'libs/a/tsconfig.json', problem: 'undeclared' }],
    );
  });

  test('reports `compilerOptions` without `libReplacement`', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations([
        file(dedent`
          {
            "compilerOptions": { "jsx": "react-jsx" }
          }
        `),
      ]),
      [{ relativePath: 'libs/a/tsconfig.json', problem: 'undeclared' }],
    );
  });

  test('does not take a commented-out declaration for one', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations([
        file(dedent`
          {
            "compilerOptions": {
              // "libReplacement": true,
              "jsx": "react-jsx"
            }
          }
        `),
      ]),
      [{ relativePath: 'libs/a/tsconfig.json', problem: 'undeclared' }],
    );
  });

  test('reports `false` with no reason', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations([
        file(dedent`
          {
            "compilerOptions": {
              "jsx": "react-jsx",
              "libReplacement": false
            }
          }
        `),
      ]),
      [
        {
          relativePath: 'libs/a/tsconfig.json',
          problem: 'false-without-reason',
        },
      ],
    );
  });

  test('does not take a comment above an unrelated line for a reason', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations([
        file(dedent`
          {
            "compilerOptions": {
              // React, not Preact.
              "jsx": "react-jsx",
              "libReplacement": false
            }
          }
        `),
      ]),
      [
        {
          relativePath: 'libs/a/tsconfig.json',
          problem: 'false-without-reason',
        },
      ],
    );
  });

  test('reports a value that is not a boolean', () => {
    assert.deepStrictEqual(
      findLibReplacementViolations([
        file(dedent`
          {
            "compilerOptions": { "libReplacement": "true" }
          }
        `),
      ]),
      [{ relativePath: 'libs/a/tsconfig.json', problem: 'not-boolean' }],
    );
  });
});
