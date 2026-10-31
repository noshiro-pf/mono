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

describe('use-memo-hooks-style through type wrappers', () => {
  tester.run(ruleName, useMemoHooksStyleRule, {
    valid: [
      {
        name: '`!` and `satisfies` alone are allowed',
        code: dedent`
          import * as React from 'react';

          declare const x: number | undefined;

          const a = React.useMemo(() => x, [])!;
          const b = React.useMemo(() => x, [])! satisfies number;
          const c = React.useMemo(() => x, []) satisfies number | undefined;
        `,
      },
      {
        name: '`satisfies` and `as const` around the factory are allowed',
        code: dedent`
          import * as React from 'react';

          declare const x: number;

          const a = React.useMemo((() => x) satisfies () => number, []);
          const b = React.useMemo((() => ({ x }) as const) satisfies () => unknown, []);
        `,
      },
    ],
    invalid: [
      {
        name: 'type assertion on the factory',
        code: dedent`
          import * as React from 'react';

          declare const x: number;

          const a = React.useMemo((() => x) as () => number, []);
          const b = React.useMemo((() => x)! as () => number, []);
        `,
        errors: [
          { messageId: 'disallowUseMemoTypeAnnotation' },
          { messageId: 'disallowUseMemoTypeAnnotation' },
        ],
      },
      {
        name: 'return type annotation and inner assertion of a wrapped factory',
        code: dedent`
          import * as React from 'react';

          declare const x: number;

          const a = React.useMemo(((): number => x) satisfies () => number, []);
          const b = React.useMemo((() => x as number) satisfies () => number, []);
        `,
        errors: [
          { messageId: 'disallowUseMemoTypeAnnotation' },
          { messageId: 'disallowUseMemoTypeAnnotation' },
        ],
      },
      {
        name: 'type assertion after `!`',
        code: dedent`
          import * as React from 'react';

          declare const x: number | undefined;

          const v = React.useMemo(() => x, [])! as number;
        `,
        errors: [{ messageId: 'disallowUseMemoTypeAnnotation' }],
      },
      {
        name: 'type assertion after `satisfies`',
        code: dedent`
          import * as React from 'react';

          declare const x: number;

          const v = React.useMemo(() => x, []) satisfies number as number;
        `,
        errors: [{ messageId: 'disallowUseMemoTypeAnnotation' }],
      },
      {
        name: 'type assertion on a call whose callee is wrapped',
        code: dedent`
          import * as React from 'react';

          declare const x: number;

          const v = (React.useMemo as typeof React.useMemo)(() => x, []) as number;
        `,
        errors: [{ messageId: 'disallowUseMemoTypeAnnotation' }],
      },
    ],
  });
});

describe('use-memo-hooks-style with a block-bodied factory', () => {
  tester.run(ruleName, useMemoHooksStyleRule, {
    valid: [
      {
        name: 'an assertion inside a nested function or on a non-returned value',
        code: dedent`
          import * as React from 'react';

          declare const x: unknown;

          const v = React.useMemo(() => {
            const n = x as number;
            const f = () => {
              return x as number;
            };
            return f() + n;
          }, []);
        `,
      },
      {
        name: 'a returned function, block- or expression-bodied',
        code: dedent`
          import * as React from 'react';

          declare const x: unknown;

          const f = React.useMemo(() => () => {
            return x as number;
          }, []);
          const g = React.useMemo(() => {
            return () => x as number;
          }, []);
          const h = React.useMemo(() => () => x as number, []);
        `,
      },
      {
        name: 'an assertion inside the returned value, which does not decide its type',
        code: dedent`
          import * as React from 'react';

          declare const x: unknown;
          declare const f: (n: number) => string;

          const a = React.useMemo(() => {
            return !(x as boolean);
          }, []);
          const b = React.useMemo(() => f(x as number), []);
          const c = React.useMemo(() => typeof (x as string), []);
        `,
      },
      {
        name: 'an assertion in a condition, an earlier sequence member, an assignment or a generator',
        code: dedent`
          import * as React from 'react';

          declare const x: unknown;
          declare const log: (n: number) => void;
          declare const ref: { current: number };

          const a = React.useMemo(() => ((x as boolean) ? 1 : 2), []);
          const b = React.useMemo(() => (log(x as number), 0), []);
          const d = React.useMemo(() => (x as boolean) && 1, []);
          const e = React.useMemo(() => (ref.current = x as number), []);
          const c = React.useMemo(function* () {
            yield 1;
            return x as number;
          }, []);
        `,
      },
      {
        name: '`as const` in a return',
        code: dedent`
          import * as React from 'react';

          const v = React.useMemo(() => {
            return [1, 2] as const;
          }, []);
        `,
      },
    ],
    invalid: [
      {
        name: 'an assertion in the return',
        code: dedent`
          import * as React from 'react';

          declare const x: unknown;

          const v = React.useMemo(() => {
            return x as number;
          }, []);
        `,
        errors: [{ messageId: 'disallowUseMemoTypeAnnotation', line: 6 }],
      },
      {
        name: 'assertions in every return, nested in statements',
        code: dedent`
          import * as React from 'react';

          declare const x: unknown;
          declare const k: number;

          const v = React.useMemo(() => {
            if (k > 0) {
              return x as number;
            }
            for (;;) {
              try {
                return x as number;
              } finally {
                break;
              }
            }
            switch (k) {
              case 0:
                return x! as number;
            }
            return (x satisfies unknown) as number;
          }, []);
        `,
        errors: [
          { messageId: 'disallowUseMemoTypeAnnotation', line: 8 },
          { messageId: 'disallowUseMemoTypeAnnotation', line: 12 },
          { messageId: 'disallowUseMemoTypeAnnotation', line: 19 },
          { messageId: 'disallowUseMemoTypeAnnotation', line: 21 },
        ],
      },
      {
        name: 'assertions in the other statements that hold a return',
        code: dedent`
          import * as React from 'react';

          declare const x: unknown;
          declare const k: number;
          declare const xs: readonly number[];

          const v = React.useMemo(() => {
            if (k > 0) {
              return 0;
            } else {
              return x as number;
            }
            try {
              return 0;
            } catch {
              return x as number;
            }
            while (k) return x as number;
            do {
              return x as number;
            } while (k);
            for (const _ of xs) return x as number;
            outer: {
              return x as number;
            }
          }, []);
        `,
        errors: [
          { messageId: 'disallowUseMemoTypeAnnotation', line: 11 },
          { messageId: 'disallowUseMemoTypeAnnotation', line: 16 },
          { messageId: 'disallowUseMemoTypeAnnotation', line: 18 },
          { messageId: 'disallowUseMemoTypeAnnotation', line: 20 },
          { messageId: 'disallowUseMemoTypeAnnotation', line: 22 },
          { messageId: 'disallowUseMemoTypeAnnotation', line: 24 },
        ],
      },
      {
        name: 'an assertion on a branch of the returned expression',
        code: dedent`
          import * as React from 'react';

          declare const x: unknown;
          declare const k: boolean;
          declare const log: (n: number) => void;

          const a = React.useMemo(() => {
            return k ? (x as number) : 0;
          }, []);
          const b = React.useMemo(() => (x as number | undefined) ?? 0, []);
          const c = React.useMemo(() => (log(0), x as number), []);
          const d = React.useMemo(async () => await (x as Promise<number>), []);
        `,
        errors: [
          { messageId: 'disallowUseMemoTypeAnnotation', line: 8 },
          { messageId: 'disallowUseMemoTypeAnnotation', line: 10 },
          { messageId: 'disallowUseMemoTypeAnnotation', line: 11 },
          { messageId: 'disallowUseMemoTypeAnnotation', line: 12 },
        ],
      },
      {
        name: 'a `function` factory: its return type and its returns',
        code: dedent`
          import * as React from 'react';

          declare const x: unknown;

          const a = React.useMemo(function () {
            return x as number;
          }, []);
          const b = React.useMemo(function (): number {
            return 0;
          }, []);
        `,
        errors: [
          { messageId: 'disallowUseMemoTypeAnnotation', line: 6 },
          { messageId: 'disallowUseMemoTypeAnnotation', line: 8 },
        ],
      },
    ],
  });
});
