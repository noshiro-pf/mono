import dedent from 'dedent';
import { noTupleLengthChange } from '../src/index.mjs';
import { testRule } from './rule-tester.mjs';

describe(noTupleLengthChange.ruleId, () => {
  testRule(noTupleLengthChange, {
    valid: [
      {
        name: 'rewriting an element leaves the length alone',
        code: dedent`
          const mut_pair: [number, number] = [1, 2];

          mut_pair[0] = 9;

          export const pair = mut_pair;
        `,
      },
      {
        name: 'the mutators that keep the length',
        code: dedent`
          const mut_keeps: [number, number] = [1, 2];

          mut_keeps.sort((a, b) => a - b);
          mut_keeps.reverse();
          mut_keeps.fill(0);
          mut_keeps.copyWithin(0, 1);

          export const keeps = mut_keeps;
        `,
      },
      {
        name: 'an array may change length — only a tuple states one',
        code: dedent`
          const mut_xs: number[] = [1, 2];

          mut_xs.push(3);
          mut_xs.pop();
          mut_xs.splice(0, 1);

          export const xs = mut_xs;
        `,
      },
      {
        name: 'a method of one’s own that shares the name',
        code: dedent`
          const ownPush = { push: (): number => 1 };

          export const own = ownPush.push();
        `,
      },
    ],
    invalid: [
      {
        name: 'push on a tuple',
        code: dedent`
          const mut_grow: [number, number] = [1, 2];

          mut_grow.push(3);

          export const grow = mut_grow;
        `,
        errors: [{ messageId: 'lengthChanged', line: 3 }],
      },
      {
        name: 'the other four, including through a readonly-typed binding’s alias',
        code: dedent`
          const mut_all: [number, string] = [1, 'a'];

          mut_all.pop();
          mut_all.shift();
          mut_all.unshift(0);
          mut_all.splice(0, 1);

          export const all = mut_all;
        `,
        errors: [
          { messageId: 'lengthChanged', line: 3 },
          { messageId: 'lengthChanged', line: 4 },
          { messageId: 'lengthChanged', line: 5 },
          { messageId: 'lengthChanged', line: 6 },
        ],
      },
      {
        name: 'a union in which one member is a tuple',
        code: dedent`
          declare const mut_maybeTuple: [number, number] | number[];

          mut_maybeTuple.push(3);

          export const maybeTuple = mut_maybeTuple;
        `,
        errors: [{ messageId: 'lengthChanged', line: 3 }],
      },
      {
        name: 'the `mut_` prefix does not excuse it',
        code: dedent`
          const mut_named: [number] = [1];

          mut_named.push(2);

          export const named = mut_named;
        `,
        errors: [{ messageId: 'lengthChanged', line: 3 }],
      },
    ],
  });
});
