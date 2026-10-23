import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noWriteDuringPropagation } from './no-write-during-propagation.mjs';

// With type information, a setter imported from another file is followed to
// the factory call that made it: `test/fixtures/store.mts`.
const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: `${import.meta.dirname}/../..`,
    },
  },
});

const filename =
  `${import.meta.dirname}/../../test/fixtures/consumer.mts` as const;

ruleTester.run(
  'no-write-during-propagation (typed)',
  noWriteDuringPropagation,
  {
    valid: [
      {
        name: 'an imported getter in a subscriber',
        filename,
        code: dedent`
          import { count$, getFlag } from './store.mjs';
          count$.subscribe(() => { getFlag(); });
        `,
      },
      {
        name: 'an imported setter outside any subscriber',
        filename,
        code: dedent`
          import { setCount } from './store.mjs';
          setCount(1);
        `,
      },
    ],
    invalid: [
      {
        name: 'an imported setter',
        filename,
        code: dedent`
          import { label$, setCount } from './store.mjs';
          label$.subscribe((label) => { setCount(label.length); });
        `,
        errors: [{ messageId: 'writeDuringPropagation' }],
      },
      {
        name: 'an imported utility, renamed where it is exported and imported',
        filename,
        code: dedent`
          import { label$, resetCount as reset } from './store.mjs';
          label$.subscribe(() => { reset(); });
        `,
        errors: [{ messageId: 'writeDuringPropagation' }],
      },
      {
        name: 'a setter made through a namespace import, and re-exported',
        filename,
        code: dedent`
          import { count$, reexportedSetCount, setLabel } from './store.mjs';
          count$.subscribe((count) => {
            setLabel(String(count));
            reexportedSetCount(0);
          });
        `,
        errors: [
          { messageId: 'writeDuringPropagation', line: 3 },
          { messageId: 'writeDuringPropagation', line: 4 },
        ],
      },
      {
        name: '`next` of an imported source',
        filename,
        code: dedent`
          import { count$, tick$ } from './store.mjs';
          count$.subscribe((count) => { tick$.next(count); });
        `,
        errors: [{ messageId: 'writeDuringPropagation' }],
      },
      {
        name: 'an imported setter in a helper the subscriber calls',
        filename,
        code: dedent`
          import { count$, setLabel } from './store.mjs';
          const show = (count: number) => { setLabel(String(count)); };
          count$.subscribe(show);
        `,
        errors: [{ messageId: 'writeDuringPropagation', line: 2 }],
      },
    ],
  },
);
