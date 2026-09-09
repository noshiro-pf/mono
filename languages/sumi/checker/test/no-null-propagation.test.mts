import dedent from 'dedent';
import { noNullPropagation } from '../src/index.mjs';
import { testRule } from './rule-tester.mjs';

describe(noNullPropagation.ruleId, () => {
  testRule(noNullPropagation, {
    valid: [
      {
        name: 'the boundary normalized the null away',
        code: dedent`
          const findElement = (): string | null => null;

          export const element = findElement() ?? undefined;
        `,
      },
      {
        name: 'an annotated declaration is the syntactic rule’s business',
        code: dedent`
          const readMaybe = (): string | null => null;

          export const annotated: string | null = readMaybe();
        `,
      },
      {
        name: 'a declaration that never sees a null',
        code: dedent`
          export const plain = 'text';

          export const [head] = ['a', 'b'] as const;
        `,
      },
    ],
    invalid: [
      {
        name: 'a null arrives by inference from a boundary',
        code: dedent`
          const query = (): string | null => null;

          export const found = query();
        `,
        errors: [{ messageId: 'inferredNull', line: 3 }],
      },
      {
        name: 'a destructured binding takes the null',
        code: dedent`
          const pair = (): readonly [string | null] => [null];

          export const [first] = pair();
        `,
        errors: [{ messageId: 'inferredNull', line: 3 }],
      },
    ],
  });
});
