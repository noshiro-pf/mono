import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferSchemaOverGuardChain } from './prefer-schema-over-guard-chain.mjs';

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

describe('prefer-schema-over-guard-chain', () => {
  tester.run('prefer-schema-over-guard-chain', preferSchemaOverGuardChain, {
    valid: [
      {
        name: 'ordinary narrowing, two guards',
        code: dedent`
          declare const x: unknown;
          const ok = isRecord(x) && hasKey(x, 'a');
        `,
      },
      {
        name: 'four guards, one below the default threshold',
        code: dedent`
          declare const x: unknown;
          const ok =
            isRecord(x) &&
            hasKey(x, 'a') &&
            isString(x.a) &&
            hasKey(x, 'b');
        `,
      },
      {
        name: 'guards on different values do not add up',
        code: dedent`
          declare const x: unknown;
          declare const y: unknown;
          const ok =
            isRecord(x) &&
            hasKey(x, 'a') &&
            isString(x.a) &&
            isRecord(y) &&
            hasKey(y, 'b') &&
            isString(y.b);
        `,
      },
      {
        name: 'calls that are not guards',
        code: dedent`
          declare const x: { readonly a: () => boolean };
          const ok = x.a() && x.a() && x.a() && x.a() && x.a() && x.a();
        `,
      },
      {
        name: 'a long chain raised above by the threshold option',
        options: [{ threshold: 7 }],
        code: dedent`
          declare const x: unknown;
          const ok =
            isRecord(x) &&
            hasKey(x, 'a') &&
            isString(x.a) &&
            hasKey(x, 'b') &&
            isString(x.b);
        `,
      },
    ],
    invalid: [
      {
        name: 'five guards on one value',
        code: dedent`
          declare const x: unknown;
          const ok =
            isRecord(x) &&
            hasKey(x, 'a') &&
            isString(x.a) &&
            hasKey(x, 'b') &&
            isString(x.b);
        `,
        errors: [
          { messageId: 'preferSchema', data: { name: 'x', count: '5' } },
        ],
      },
      {
        name: 'the negated early-return spelling, an || chain',
        code: dedent`
          declare const x: unknown;
          const bad =
            !isRecord(x) ||
            !hasKey(x, 'a') ||
            !isString(x.a) ||
            !hasKey(x, 'b') ||
            !isString(x.b);
        `,
        errors: [{ messageId: 'preferSchema' }],
      },
      {
        name: 'a member call counted under its property name',
        code: dedent`
          declare const x: unknown;
          const ok =
            isRecord(x) &&
            hasKey(x, 'items') &&
            Arr.isArray(x.items) &&
            hasKey(x, 'name') &&
            isString(x.name);
        `,
        errors: [{ messageId: 'preferSchema' }],
      },
      {
        name: 'a shorter chain reported by lowering the threshold',
        options: [{ threshold: 3 }],
        code: dedent`
          declare const x: unknown;
          const ok = isRecord(x) && hasKey(x, 'a') && isString(x.a);
        `,
        errors: [{ messageId: 'preferSchema' }],
      },
      {
        name: 'a custom guard list',
        options: [{ guards: ['isThing'] }],
        code: dedent`
          declare const x: unknown;
          const ok =
            isThing(x) &&
            isThing(x) &&
            isThing(x) &&
            isThing(x) &&
            isThing(x);
        `,
        errors: [{ messageId: 'preferSchema' }],
      },
    ],
  });
});
