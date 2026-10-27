import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noThrowInOperator } from './no-throw-in-operator.mjs';

const ruleTester = new RuleTester();

ruleTester.run('no-throw-in-operator', noThrowInOperator, {
  valid: [
    {
      name: 'a projection that returns a Result',
      code: dedent`
        import { map } from 'synstate';
        import { Result } from 'ts-data-forge';
        const parsed$ = text$.pipe(
          map((text) => (text === '' ? Result.err('empty') : Result.ok(text))),
        );
      `,
    },
    {
      name: 'a throw outside any operator',
      code: dedent`
        import { map } from 'synstate';
        const parse = (text: string) => {
          if (text === '') throw new Error('empty');
          return text;
        };
        parse(input);
      `,
    },
    {
      name: 'a throw caught in the projection',
      code: dedent`
        import { map } from 'synstate';
        const parsed$ = text$.pipe(
          map((text) => {
            try {
              if (text === '') throw new Error('empty');
              return text;
            } catch {
              return '';
            }
          }),
        );
      `,
    },
    {
      name: 'a call to a throwing helper caught in the projection',
      code: dedent`
        import { map } from 'synstate';
        const parse = (text: string) => {
          if (text === '') throw new Error('empty');
          return text;
        };
        const parsed$ = text$.pipe(
          map((text) => {
            try {
              return parse(text);
            } catch {
              return '';
            }
          }),
        );
      `,
    },
    {
      name: 'a throw in a function the projection only defines',
      code: dedent`
        import { switchMap, fromPromise } from 'synstate';
        const user$ = id$.pipe(
          switchMap((id) =>
            fromPromise(
              fetch(id).then((res) => {
                if (!res.ok) throw new Error('failed');
                return res.json();
              }),
            ),
          ),
        );
      `,
    },
    {
      name: 'an async projection, whose throw rejects a promise',
      code: dedent`
        import { map } from 'synstate';
        const loaded$ = id$.pipe(
          map(async (id) => {
            throw new Error(id);
          }),
        );
      `,
    },
    {
      name: 'an operator that is not synstate’s',
      code: dedent`
        import { map } from 'rxjs';
        const parsed$ = text$.pipe(
          map((text) => {
            throw new Error(text);
          }),
        );
      `,
    },
    {
      name: 'a synstate operator not passed to pipe',
      code: dedent`
        import { createReducer } from 'synstate';
        const [state$, dispatch] = createReducer((state: number, action: string) => {
          throw new Error(action);
        }, 0);
      `,
    },
    {
      name: 'a local map shadowing the import',
      code: dedent`
        import { map } from 'synstate';
        const f = (map: (fn: () => never) => unknown) =>
          x$.pipe(
            map(() => {
              throw new Error('x');
            }),
          );
      `,
    },
    {
      name: 'a helper declared again with let, which may be reassigned',
      code: dedent`
        import { map } from 'synstate';
        let parse = (text: string): string => {
          throw new Error(text);
        };
        parse = (text) => text;
        const parsed$ = text$.pipe(map((text) => parse(text)));
      `,
    },
    {
      name: 'an async helper, whose throw rejects a promise',
      code: dedent`
        import { map } from 'synstate';
        const load = async (id: string) => {
          throw new Error(id);
        };
        const loaded$ = id$.pipe(map((id) => load(id)));
      `,
    },
  ],

  invalid: [
    {
      name: 'a throw in a map projection',
      code: dedent`
        import { map } from 'synstate';
        const parsed$ = text$.pipe(
          map((text) => {
            if (text === '') throw new Error('empty');
            return text;
          }),
        );
      `,
      errors: [{ messageId: 'throwInOperator', line: 4 }],
    },
    {
      name: 'a throw in each operator that takes a function',
      code: dedent`
        import {
          filter,
          mergeMap,
          scan,
          skipIfNoChange,
          skipWhile,
          switchMap,
          takeWhile,
        } from 'synstate';
        const a$ = x$.pipe(filter(() => { throw new Error('a'); }));
        const b$ = x$.pipe(scan(() => { throw new Error('b'); }, 0));
        const c$ = x$.pipe(skipWhile(() => { throw new Error('c'); }));
        const d$ = x$.pipe(takeWhile(() => { throw new Error('d'); }));
        const e$ = x$.pipe(switchMap(() => { throw new Error('e'); }));
        const f$ = x$.pipe(mergeMap(() => { throw new Error('f'); }));
        const g$ = x$.pipe(skipIfNoChange(() => { throw new Error('g'); }));
      `,
      errors: [
        { messageId: 'throwInOperator', line: 10 },
        { messageId: 'throwInOperator', line: 11 },
        { messageId: 'throwInOperator', line: 12 },
        { messageId: 'throwInOperator', line: 13 },
        { messageId: 'throwInOperator', line: 14 },
        { messageId: 'throwInOperator', line: 15 },
        { messageId: 'throwInOperator', line: 16 },
      ],
    },
    {
      name: 'a throw in the equals option of map',
      code: dedent`
        import { map } from 'synstate';
        const y$ = x$.pipe(
          map((x) => x, {
            equals: (a, b) => {
              throw new Error('no');
            },
          }),
        );
      `,
      errors: [{ messageId: 'throwInOperator', line: 5 }],
    },
    {
      name: 'a throw in a catch clause, which nothing catches',
      code: dedent`
        import { map } from 'synstate';
        const parsed$ = text$.pipe(
          map((text) => {
            try {
              return JSON.parse(text);
            } catch (error) {
              throw new Error('invalid', { cause: error });
            }
          }),
        );
      `,
      errors: [{ messageId: 'throwInOperator', line: 7 }],
    },
    {
      name: 'a throw in a try block with only finally',
      code: dedent`
        import { map } from 'synstate';
        const parsed$ = text$.pipe(
          map((text) => {
            try {
              throw new Error(text);
            } finally {
              console.log(text);
            }
          }),
        );
      `,
      errors: [{ messageId: 'throwInOperator', line: 5 }],
    },
    {
      name: 'a projection passed by name, defined with const',
      code: dedent`
        import { map } from 'synstate';
        const parse = (text: string) => {
          if (text === '') throw new Error('empty');
          return text;
        };
        const parsed$ = text$.pipe(map(parse));
      `,
      errors: [{ messageId: 'throwInOperator', line: 3 }],
    },
    {
      name: 'a projection passed by name, a function declaration',
      code: dedent`
        import { map } from 'synstate';
        function parse(text: string) {
          if (text === '') throw new Error('empty');
          return text;
        }
        const parsed$ = text$.pipe(map(parse));
      `,
      errors: [{ messageId: 'throwInOperator', line: 3 }],
    },
    {
      name: 'a helper the projection calls, reported at the call',
      code: dedent`
        import { map } from 'synstate';
        const parse = (text: string) => {
          if (text === '') throw new Error('empty');
          return text;
        };
        const parsed$ = text$.pipe(map((text) => parse(text).trim()));
      `,
      errors: [
        {
          messageId: 'throwThroughCall',
          data: { name: 'parse' },
          line: 6,
        },
      ],
    },
    {
      name: 'a helper two calls away',
      code: dedent`
        import { map } from 'synstate';
        function check(text: string) {
          if (text === '') throw new Error('empty');
        }
        const parse = (text: string) => {
          check(text);
          return text;
        };
        const parsed$ = text$.pipe(map((text) => parse(text)));
      `,
      errors: [
        {
          messageId: 'throwThroughCall',
          data: { name: 'parse' },
          line: 9,
        },
      ],
    },
    {
      name: 'recursive helpers',
      code: dedent`
        import { map } from 'synstate';
        function even(n: number): boolean {
          if (n < 0) throw new Error('negative');
          return n === 0 || odd(n - 1);
        }
        function odd(n: number): boolean {
          return n !== 0 && even(n - 1);
        }
        const isOdd$ = n$.pipe(map((n) => odd(n)));
      `,
      errors: [
        {
          messageId: 'throwThroughCall',
          data: { name: 'odd' },
          line: 9,
        },
      ],
    },
    {
      name: 'map under an alias and through a namespace',
      code: dedent`
        import { map as mapS } from 'synstate';
        import * as S from 'synstate';
        const a$ = x$.pipe(mapS(() => { throw new Error('a'); }));
        const b$ = x$.pipe(S.filter(() => { throw new Error('b'); }));
      `,
      errors: [
        { messageId: 'throwInOperator', line: 3 },
        { messageId: 'throwInOperator', line: 4 },
      ],
    },
    {
      name: 'the predefined operators built on map',
      code: dedent`
        import { mapOptional, mapResultErr, mapResultOk } from 'synstate';
        const a$ = x$.pipe(mapOptional(() => { throw new Error('a'); }));
        const b$ = x$.pipe(mapResultOk(() => { throw new Error('b'); }));
        const c$ = x$.pipe(mapResultErr(() => { throw new Error('c'); }));
      `,
      errors: [
        { messageId: 'throwInOperator', line: 2 },
        { messageId: 'throwInOperator', line: 3 },
        { messageId: 'throwInOperator', line: 4 },
      ],
    },
  ],
});

describe('no-throw-in-operator through type wrappers', () => {
  ruleTester.run('no-throw-in-operator', noThrowInOperator, {
    valid: [],
    invalid: [
      {
        name: 'the operator, the callback and the pipe argument wrapped',
        code: dedent`
          import { map } from 'synstate';
          const a$ = x$.pipe(
            (map as typeof map)((() => {
              throw new Error('a');
            }) satisfies (x: number) => number),
          );
          const b$ = x$.pipe(
            map((x: number) => {
              throw new Error('b');
            }) satisfies unknown,
          );
          const c$ = x$.pipe(map(parse!));
          function parse(x: number): number {
            throw new Error('c');
          }
        `,
        errors: [
          { messageId: 'throwInOperator', line: 4 },
          { messageId: 'throwInOperator', line: 9 },
          { messageId: 'throwInOperator', line: 14 },
        ],
      },
      {
        name: 'a helper called through a wrapper',
        code: dedent`
          import { map } from 'synstate';
          const parse = ((text: string): string => {
            throw new Error(text);
          }) satisfies (text: string) => string;
          const parsed$ = text$.pipe(map((text) => (parse as typeof parse)(text)));
        `,
        errors: [
          {
            messageId: 'throwThroughCall',
            data: { name: 'parse' },
            line: 5,
          },
        ],
      },
    ],
  });
});
