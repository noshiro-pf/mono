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
  describe('namespace import (React.useMemo)', () => {
    tester.run(ruleName, useMemoHooksStyleRule, {
      valid: [
        {
          code: dedent`
            import * as React from 'react';

            type Props = Readonly<{
              value: number;
            }>;

            const Component = React.memo<Props>((props) => {
              const memoized = React.useMemo<number>(() => props.value, [props.value]);

              const typed: number = React.useMemo(() => props.value, [props.value]);

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
        {
          name: 'Allow satisfies expression',
          code: dedent`
            import * as React from 'react';

            type Props = Readonly<{
              value: number;
            }>;

            const Component = React.memo<Props>((props) => {
              const value = React.useMemo(() => props.value, [props.value]) satisfies number;

              const inner = React.useMemo(() => props.value satisfies number, [props.value]);

              return inner + value;
            });
          `,
        },
        {
          name: 'Allow const assertion',
          code: dedent`
            import * as React from 'react';

            type Props = Readonly<{
              value: number;
            }>;

            const Component = React.memo<Props>((props) => {
              const value = React.useMemo(() => ({ v: props.value }) as const, [props.value]);

              return value;
            });
          `,
        },
      ],
      invalid: [
        {
          name: 'Disallow return type annotation',
          code: dedent`
            import * as React from 'react';

            type Props = Readonly<{
              value: number;
            }>;

            const Component = React.memo<Props>((props) => {
              const value = React.useMemo((): number => props.value, [props.value]);
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
            import * as React from 'react';

            type Props = Readonly<{
              value: number;
            }>;

            const Component = React.memo<Props>((props) => {
              const value = React.useMemo(() => props.value, [props.value]) as number;
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
            import * as React from 'react';

            type Props = Readonly<{
              value: number;
            }>;

            const Component = React.memo<Props>((props) => {
              const value = React.useMemo(() => props.value as number, [props.value]);
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
          name: 'Disallow return type annotation even with satisfies',
          code: dedent`
            import * as React from 'react';

            type Props = Readonly<{
              value: number;
            }>;

            const Component = React.memo<Props>((props) => {
              const value = React.useMemo((): number => props.value, [props.value]) satisfies number;
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
          name: 'Disallow return type annotation even with const assertion',
          code: dedent`
            import * as React from 'react';

            type Props = Readonly<{
              value: number;
            }>;

            const Component = React.memo<Props>((props) => {
              const value = React.useMemo((): number => props.value, [props.value]) as const;
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
