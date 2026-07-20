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
