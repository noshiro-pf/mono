import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferIsRecordAndHasKey } from './prefer-is-record-and-has-key.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../..`,
    },
  },
});

describe('prefer-is-record-and-has-key', () => {
  tester.run('prefer-is-record-and-has-key', preferIsRecordAndHasKey, {
    valid: [
      {
        name: 'ignores other Object methods',
        code: dedent`
          const obj = { a: 1 };
          const keys = Object.keys(obj);
        `,
      },
      {
        name: 'ignores hasOwn with wrong number of arguments',
        code: dedent`
          const obj = { a: 1 };
          const ok = Object.hasOwn(obj);
        `,
      },
    ],
    invalid: [
      {
        name: 'drops isRecord when the object already has a string index signature',
        code: dedent`
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = hasKey(obj, 'a');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'drops isRecord for `key in obj` on a record-typed object',
        code: dedent`
          declare const obj: Record<string, number>;
          const ok = 'a' in obj;
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';
          declare const obj: Record<string, number>;
          const ok = hasKey(obj, 'a');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'keeps isRecord when only part of a union is a record',
        code: dedent`
          declare const obj: Record<string, unknown> | readonly unknown[];
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          declare const obj: Record<string, unknown> | readonly unknown[];
          const ok = (isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'keeps isRecord for an index-signature-carrying callable',
        code: dedent`
          type Callable = { (): void; [key: string]: unknown };
          declare const obj: Callable;
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          type Callable = { (): void; [key: string]: unknown };
          declare const obj: Callable;
          const ok = (isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'imports isRecord once when both forms appear in a file',
        code: dedent`
          declare const rec: Record<string, unknown>;
          declare const unk: unknown;
          const a = Object.hasOwn(rec, 'a');
          const b = Object.hasOwn(unk, 'b');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          declare const rec: Record<string, unknown>;
          declare const unk: unknown;
          const a = hasKey(rec, 'a');
          const b = (isRecord(unk) && hasKey(unk, 'b'));
        `,
        errors: [
          { messageId: 'useHasKey' },
          { messageId: 'useIsRecordAndHasKey' },
        ],
      },
      {
        name: 'replaces Object.hasOwn(obj, key) with isRecord && hasKey',
        code: dedent`
          const obj = { a: 1 };
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const obj = { a: 1 };
          const ok = (isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'replaces key in obj with isRecord && hasKey',
        code: dedent`
          const obj = { a: 1 };
          const ok = 'a' in obj;
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const obj = { a: 1 };
          const ok = (isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'works with variable key',
        code: dedent`
          const obj = { a: 1 };
          const key = 'a';
          const ok = Object.hasOwn(obj, key);
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const obj = { a: 1 };
          const key = 'a';
          const ok = (isRecord(obj) && hasKey(obj, key));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'works with in and variable key',
        code: dedent`
          const obj = { a: 1 };
          const key = 'a';
          const ok = key in obj;
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const obj = { a: 1 };
          const key = 'a';
          const ok = (isRecord(obj) && hasKey(obj, key));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'keeps existing isRecord import',
        code: dedent`
          import { isRecord } from 'ts-data-forge';

          const obj = { a: 1 };
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';
          import { isRecord } from 'ts-data-forge';

          const obj = { a: 1 };
          const ok = (isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'keeps existing hasKey import',
        code: dedent`
          import { hasKey } from 'ts-data-forge';

          const obj = { a: 1 };
          const ok = 'a' in obj;
        `,
        output: dedent`
          import { isRecord } from 'ts-data-forge';
          import { hasKey } from 'ts-data-forge';

          const obj = { a: 1 };
          const ok = (isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'keeps both existing imports',
        code: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';

          const obj = { a: 1 };
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';

          const obj = { a: 1 };
          const ok = (isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'replaces multiple checks',
        code: dedent`
          const obj = { a: 1 };
          const ok1 = Object.hasOwn(obj, 'a');
          const ok2 = 'b' in obj;
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const obj = { a: 1 };
          const ok1 = (isRecord(obj) && hasKey(obj, 'a'));
          const ok2 = (isRecord(obj) && hasKey(obj, 'b'));
        `,
        errors: [
          { messageId: 'useIsRecordAndHasKey' },
          { messageId: 'useIsRecordAndHasKey' },
        ],
      },
      {
        name: 'works with complex object expressions',
        code: dedent`
          const data = { nested: { value: 1 } };
          const ok = Object.hasOwn(data.nested, 'value');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const data = { nested: { value: 1 } };
          const ok = (isRecord(data.nested) && hasKey(data.nested, 'value'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'works with in and complex object expressions',
        code: dedent`
          const data = { nested: { value: 1 } };
          const ok = 'value' in data.nested;
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const data = { nested: { value: 1 } };
          const ok = (isRecord(data.nested) && hasKey(data.nested, 'value'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'correctly wraps negated Object.hasOwn with parentheses',
        code: dedent`
          const obj = { a: 1 };
          const ok = !Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const obj = { a: 1 };
          const ok = !(isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'correctly wraps negated key in obj with parentheses',
        code: dedent`
          const obj = { a: 1 };
          const ok = !('a' in obj);
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const obj = { a: 1 };
          const ok = !((isRecord(obj) && hasKey(obj, 'a')));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
    ],
  });
}, 20000);
