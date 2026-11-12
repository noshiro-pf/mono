import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noExportTypeSideEffects } from './no-export-type-side-effects.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

describe('no-export-type-side-effects', () => {
  tester.run('no-export-type-side-effects', noExportTypeSideEffects, {
    valid: [
      {
        name: 'a top-level type re-export is erased whole',
        code: "export type { A, B } from 'm';",
      },
      {
        name: 'a re-export mixing a value and an inline type keeps the value',
        code: "export { a, type B } from 'm';",
      },
      {
        name: 'a value re-export',
        code: "export { a } from 'm';",
      },
      {
        name: 'an explicit side-effect re-export is left as written',
        code: "export {} from 'm';",
      },
      {
        name: 'a local inline-type export loads no module',
        code: dedent`
          type A = number;
          export { type A };
        `,
      },
      {
        name: 'a specifier named `type` is a value',
        code: "export { type } from 'm';",
      },
      {
        name: 'a specifier renamed from `type` is a value',
        code: "export { type as kind } from 'm';",
      },
      {
        name: 'export star',
        code: "export * from 'm';",
      },
      {
        name: 'a declaration file emits nothing',
        filename: 'types.d.mts',
        code: "export { type A } from 'm';",
      },
      {
        name: 'a `declare module` block emits nothing',
        code: dedent`
          declare module 'x' {
            export { type A } from 'm';
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'a single inline type',
        code: "export { type A } from 'm';",
        output: "export type { A } from 'm';",
        errors: [{ messageId: 'useTopLevelQualifier' }],
      },
      {
        name: 'several inline types, one renamed',
        code: "export { type A, type B as C } from 'm';",
        output: "export type { A, B as C } from 'm';",
        errors: [{ messageId: 'useTopLevelQualifier' }],
      },
      {
        name: 'a type named `type`',
        code: "export { type type } from 'm';",
        output: "export type { type } from 'm';",
        errors: [{ messageId: 'useTopLevelQualifier' }],
      },
      {
        name: 'an inline type renamed to `default`',
        code: "export { type A as default } from 'm';",
        output: "export type { A as default } from 'm';",
        errors: [{ messageId: 'useTopLevelQualifier' }],
      },
      {
        name: 'a string-named specifier',
        code: "export { type 'a-b' as AB } from 'm';",
        output: "export type { 'a-b' as AB } from 'm';",
        errors: [{ messageId: 'useTopLevelQualifier' }],
      },
      {
        name: 'a comment after the qualifier stays',
        code: "export { type /* kept */ A } from 'm';",
        output: "export type { /* kept */ A } from 'm';",
        errors: [{ messageId: 'useTopLevelQualifier' }],
      },
      {
        name: 'a multi-line re-export',
        code: dedent`
          export {
            type A,
            type B,
          } from 'm';
        `,
        output: dedent`
          export type {
            A,
            B,
          } from 'm';
        `,
        errors: [{ messageId: 'useTopLevelQualifier' }],
      },
      {
        name: 'import attributes: its own message, with no fix, since a type-only re-export takes none',
        code: "export { type A } from './a.json' with { type: 'json' };",
        output: null,
        errors: [{ messageId: 'importFromDeclaration' }],
      },
    ],
  });
});
