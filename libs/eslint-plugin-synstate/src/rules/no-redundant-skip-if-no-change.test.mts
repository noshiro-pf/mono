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
    {
      name: 'after `mapTo`, which emits on every source value',
      code: dedent`
        import { mapTo, skipIfNoChange } from 'synstate';
        const x$ = click$.pipe(mapTo(1)).pipe(skipIfNoChange());
      `,
    },
    {
      name: 'after a `skipIfNoChange` with a comparison of its own',
      code: dedent`
        import { skipIfNoChange } from 'synstate';
        const x$ = a$.pipe(skipIfNoChange(() => false)).pipe(skipIfNoChange());
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
      name: 'after the operators built on `map`',
      code: dedent`
        import {
          getKey,
          mapOptional,
          mapResultErr,
          mapResultOk,
          pluck,
          skipIfNoChange,
          unwrapOptional,
          unwrapResultErr,
          unwrapResultOk,
        } from 'synstate';
        const a = x$.pipe(pluck('mode')).pipe(skipIfNoChange());
        const b = x$.pipe(getKey('mode')).pipe(skipIfNoChange());
        const c = x$.pipe(mapOptional(f)).pipe(skipIfNoChange());
        const d = x$.pipe(mapResultOk(f)).pipe(skipIfNoChange());
        const e = x$.pipe(mapResultErr(f)).pipe(skipIfNoChange());
        const g = x$.pipe(unwrapOptional()).pipe(skipIfNoChange());
        const h = x$.pipe(unwrapResultOk()).pipe(skipIfNoChange());
        const i = x$.pipe(unwrapResultErr()).pipe(skipIfNoChange());
      `,
      errors: [
        { messageId: 'redundantSkipIfNoChange', data: { operator: 'pluck' } },
        { messageId: 'redundantSkipIfNoChange', data: { operator: 'getKey' } },
        {
          messageId: 'redundantSkipIfNoChange',
          data: { operator: 'mapOptional' },
        },
        {
          messageId: 'redundantSkipIfNoChange',
          data: { operator: 'mapResultOk' },
        },
        {
          messageId: 'redundantSkipIfNoChange',
          data: { operator: 'mapResultErr' },
        },
        {
          messageId: 'redundantSkipIfNoChange',
          data: { operator: 'unwrapOptional' },
        },
        {
          messageId: 'redundantSkipIfNoChange',
          data: { operator: 'unwrapResultOk' },
        },
        {
          messageId: 'redundantSkipIfNoChange',
          data: { operator: 'unwrapResultErr' },
        },
      ],
      output: dedent`
        import {
          getKey,
          mapOptional,
          mapResultErr,
          mapResultOk,
          pluck,
          skipIfNoChange,
          unwrapOptional,
          unwrapResultErr,
          unwrapResultOk,
        } from 'synstate';
        const a = x$.pipe(pluck('mode'));
        const b = x$.pipe(getKey('mode'));
        const c = x$.pipe(mapOptional(f));
        const d = x$.pipe(mapResultOk(f));
        const e = x$.pipe(mapResultErr(f));
        const g = x$.pipe(unwrapOptional());
        const h = x$.pipe(unwrapResultOk());
        const i = x$.pipe(unwrapResultErr());
      `,
    },
    {
      name: 'after a `skipIfNoChange` that compares with `Object.is`',
      code: dedent`
        import { distinctUntilChanged, skipIfNoChange } from 'synstate';
        const a = x$.pipe(skipIfNoChange()).pipe(skipIfNoChange());
        const b = x$.pipe(distinctUntilChanged(Object.is)).pipe(skipIfNoChange());
      `,
      errors: [
        {
          messageId: 'redundantSkipIfNoChange',
          data: { operator: 'skipIfNoChange' },
        },
        {
          messageId: 'redundantSkipIfNoChange',
          data: { operator: 'distinctUntilChanged' },
        },
      ],
      output: dedent`
        import { distinctUntilChanged, skipIfNoChange } from 'synstate';
        const a = x$.pipe(skipIfNoChange());
        const b = x$.pipe(distinctUntilChanged(Object.is));
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
