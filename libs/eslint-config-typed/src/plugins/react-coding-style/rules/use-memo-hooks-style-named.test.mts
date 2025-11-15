import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { useMemoHooksStyleRule } from './use-memo-hooks-style.mjs';

const ruleName = 'use-memo-hook-style';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
      jsxPragma: null, // for @typescript/eslint-parser
    },
  },
});

describe('use-memo-hooks-style', () => {
  describe('named import (useMemo)', () => {
    tester.run(ruleName, useMemoHooksStyleRule, {
      valid: [
        {
          code: dedent`
            import { memo, useMemo } from 'react';

            type Props = Readonly<{
              readonly value: number;
            }>;

            const Component = memo<Props>((props) => {
              const memoized = useMemo<number>(() => props.value, [props.value]);
              const typed: number = useMemo(() => props.value, [props.value]);
              return <div />;
            });
          `,
        },
        {
          name: 'Should not trigger for non-React useMemo (locally defined)',
          code: dedent`
            const useMemo = <T,>(fn: () => T): T => fn();

            const value = useMemo(() => 42) as number;
          `,
        },
        {
          name: 'Should not trigger for non-React useMemo (imported from other-library)',
          code: dedent`
            import { useMemo } from 'other-library';

            const value = useMemo(() => 42) as number;
          `,
        },
      ],
      invalid: [
        {
          name: 'Disallow return type annotation',
          code: dedent`
            import { memo, useMemo } from 'react';

            type Props = Readonly<{
              readonly value: number;
            }>;

            const Component = memo<Props>((props) => {
              const value = useMemo((): number => props.value, [props.value]);
              return value;
            });
          `,
          errors: [
            {
              messageId: 'disallowUseMemoTypeAnnotation',
            },
          ],
        },
        {
          name: 'Disallow type assertion',
          code: dedent`
            import { memo, useMemo } from 'react';

            type Props = Readonly<{
              readonly value: number;
            }>;

            const Component = memo<Props>((props) => {
              const value = useMemo(() => props.value, [props.value]) as number;
              return value;
            });
          `,
          errors: [
            {
              messageId: 'disallowUseMemoTypeAnnotation',
            },
          ],
        },
        {
          name: 'Disallow type assertion (inner)',
          code: dedent`
            import { memo, useMemo } from 'react';

            type Props = Readonly<{
              readonly value: number;
            }>;

            const Component = memo<Props>((props) => {
              const value = useMemo(() => props.value as number, [props.value]) ;
              return value;
            });
          `,
          errors: [
            {
              messageId: 'disallowUseMemoTypeAnnotation',
            },
          ],
        },
        {
          name: 'Disallow satisfies expression',
          code: dedent`
            import { memo, useMemo } from 'react';

            type Props = Readonly<{
              readonly value: number;
            }>;

            const Component = memo<Props>((props) => {
              const value = useMemo(() => props.value, [props.value]) satisfies number;
              return value;
            });
          `,
          errors: [
            {
              messageId: 'disallowUseMemoTypeAnnotation',
            },
          ],
        },
        {
          name: 'Disallow satisfies expression (inner)',
          code: dedent`
            import { memo, useMemo } from 'react';

            type Props = Readonly<{
              readonly value: number;
            }>;

            const Component = memo<Props>((props) => {
              const value = useMemo(() => props.value satisfies number, [props.value]);
              return value;
            });
          `,
          errors: [
            {
              messageId: 'disallowUseMemoTypeAnnotation',
            },
          ],
        },
      ],
    });
  });
});
