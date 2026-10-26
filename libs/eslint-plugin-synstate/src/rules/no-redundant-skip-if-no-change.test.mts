import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noRedundantSkipIfNoChange } from './no-redundant-skip-if-no-change.mjs';

const ruleTester = new RuleTester();

ruleTester.run('no-redundant-skip-if-no-change', noRedundantSkipIfNoChange, {
  valid: [
    {
      name: 'a comparison of its own',
      code: dedent`
        import { map, skipIfNoChange } from 'synstate';
        const id$ = a$.pipe(map((x) => x.id)).pipe(skipIfNoChange((p, q) => p === q));
      `,
    },
    {
      name: 'a `map` given `equals`, which may pass equal results on',
      code: dedent`
        import { map, skipIfNoChange } from 'synstate';
        const one$ = a$.pipe(map(() => 1, { equals: () => false })).pipe(skipIfNoChange());
      `,
    },
    {
      name: 'something between the two',
      code: dedent`
        import { map, skipIfNoChange, withInitialValue } from 'synstate';
        const x$ = a$.pipe(map(f)).pipe(withInitialValue(0)).pipe(skipIfNoChange());
      `,
    },
    {
      name: 'after an operator that is not `map`',
      code: dedent`
        import { filter, skipIfNoChange } from 'synstate';
        const x$ = a$.pipe(filter(isEven)).pipe(skipIfNoChange());
      `,
    },
    {
      name: 'after a `map` that is not synstate’s',
      code: dedent`
        import { skipIfNoChange } from 'synstate';
        import { map } from 'other';
        const x$ = a$.pipe(map(f)).pipe(skipIfNoChange());
      `,
    },
    {
      name: 'a `skipIfNoChange` that is not synstate’s',
      code: dedent`
        import { map } from 'synstate';
        import { skipIfNoChange } from 'other';
        const x$ = a$.pipe(map(f)).pipe(skipIfNoChange());
      `,
    },
    {
      name: 'a named observable, whose source the rule does not follow',
      code: dedent`
        import { map, skipIfNoChange } from 'synstate';
        const mapped$ = a$.pipe(map(f));
        const x$ = mapped$.pipe(skipIfNoChange());
      `,
    },
  ],
  invalid: [
    {
      name: 'directly after `map`',
      code: dedent`
        import { map, skipIfNoChange } from 'synstate';
        const mode$ = layout$.pipe(map((l) => l.mode)).pipe(skipIfNoChange());
      `,
      errors: [{ messageId: 'redundantSkipIfNoChange' }],
      output: dedent`
        import { map, skipIfNoChange } from 'synstate';
        const mode$ = layout$.pipe(map((l) => l.mode));
      `,
    },
    {
      name: 'on the next line',
      code: dedent`
        import { map, skipIfNoChange } from 'synstate';
        const count$ = nodes$
          .pipe(map((nodes) => nodes.length))
          .pipe(skipIfNoChange());
      `,
      errors: [{ messageId: 'redundantSkipIfNoChange' }],
      output: dedent`
        import { map, skipIfNoChange } from 'synstate';
        const count$ = nodes$
          .pipe(map((nodes) => nodes.length));
      `,
    },
    {
      name: '`distinctUntilChanged`, and `Object.is` given',
      code: dedent`
        import { distinctUntilChanged, map, skipIfNoChange } from 'synstate';
        const a = x$.pipe(map(f)).pipe(distinctUntilChanged());
        const b = x$.pipe(map(f)).pipe(skipIfNoChange(Object.is));
      `,
      errors: [
        { messageId: 'redundantSkipIfNoChange' },
        { messageId: 'redundantSkipIfNoChange' },
      ],
      output: dedent`
        import { distinctUntilChanged, map, skipIfNoChange } from 'synstate';
        const a = x$.pipe(map(f));
        const b = x$.pipe(map(f));
      `,
    },
    {
      name: 'aliased and namespace imports',
      code: dedent`
        import * as S from 'synstate';
        import { map as project, skipIfNoChange as distinct } from 'synstate';
        const a = x$.pipe(S.map(f)).pipe(S.skipIfNoChange());
        const b = x$.pipe(project(f)).pipe(distinct());
      `,
      errors: [
        { messageId: 'redundantSkipIfNoChange' },
        { messageId: 'redundantSkipIfNoChange' },
      ],
      output: dedent`
        import * as S from 'synstate';
        import { map as project, skipIfNoChange as distinct } from 'synstate';
        const a = x$.pipe(S.map(f));
        const b = x$.pipe(project(f));
      `,
    },
    {
      name: 'a comment in between: reported, not fixed',
      code: dedent`
        import { map, skipIfNoChange } from 'synstate';
        const x$ = a$.pipe(map(f)) // the mode alone
          .pipe(skipIfNoChange());
      `,
      errors: [{ messageId: 'redundantSkipIfNoChange' }],
      output: null,
    },
  ],
});

describe('no-redundant-skip-if-no-change through type wrappers', () => {
  ruleTester.run('no-redundant-skip-if-no-change', noRedundantSkipIfNoChange, {
    valid: [],
    invalid: [
      {
        name: 'the mapped observable in `as`, the wrapper kept',
        code: dedent`
          import { map, skipIfNoChange, type Observable } from 'synstate';
          const x$ = (a$.pipe(map(f)) as Observable<number>).pipe(skipIfNoChange());
        `,
        errors: [{ messageId: 'redundantSkipIfNoChange' }],
        output: dedent`
          import { map, skipIfNoChange, type Observable } from 'synstate';
          const x$ = (a$.pipe(map(f)) as Observable<number>);
        `,
      },
      {
        name: 'the operator in `satisfies` and `!`',
        code: dedent`
          import { map, skipIfNoChange } from 'synstate';
          const x$ = a$.pipe(map(f)!).pipe(skipIfNoChange() satisfies unknown);
        `,
        errors: [{ messageId: 'redundantSkipIfNoChange' }],
        output: dedent`
          import { map, skipIfNoChange } from 'synstate';
          const x$ = a$.pipe(map(f)!);
        `,
      },
      {
        name: '`Object.is` in `as`',
        code: dedent`
          import { map, skipIfNoChange } from 'synstate';
          const x$ = a$.pipe(map(f)).pipe(skipIfNoChange(Object.is as (a: number, b: number) => boolean));
        `,
        errors: [{ messageId: 'redundantSkipIfNoChange' }],
        output: dedent`
          import { map, skipIfNoChange } from 'synstate';
          const x$ = a$.pipe(map(f));
        `,
      },
    ],
  });
});
