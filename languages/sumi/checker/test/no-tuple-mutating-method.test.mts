import dedent from 'dedent';
import { noTupleMutatingMethod } from '../src/index.mjs';
import { testRule } from './rule-tester.mjs';

describe(noTupleMutatingMethod.ruleId, () => {
  testRule(noTupleMutatingMethod, {
    valid: [
      {
        name: 'assigning to an element is checked against that slot',
        code: dedent`
          const mut_slot: [number, string] = [1, 'a'];

          mut_slot[0] = 9;
          mut_slot[1] = 'b';

          export const slot = mut_slot;
        `,
      },
      {
        name: 'the copying forms return an array and are untouched',
        code: dedent`
          const mut_copying: [number, number] = [2, 1];

          export const sorted = mut_copying.toSorted((a, b) => a - b);
          export const reversed = mut_copying.toReversed();
          export const replaced = mut_copying.with(0, 5);
        `,
      },
      {
        name: 'an array states neither a length nor a type per position',
        code: dedent`
          const mut_xs: number[] = [1, 2];

          mut_xs.push(3);
          mut_xs.sort((a, b) => a - b);
          mut_xs.reverse();
          mut_xs.fill(0);

          export const xs = mut_xs;
        `,
      },
      {
        name: 'a method of one’s own that shares the name',
        code: dedent`
          const ownPush = { push: (): number => 1, sort: (): number => 2 };

          export const own = ownPush.push() + ownPush.sort();
        `,
      },
      {
        name: 'an array narrowed by a non-emptiness guard is still an array',
        code: dedent`
          const isNonEmptyQueue = <E,>(
            xs: readonly E[],
          ): xs is readonly [E, ...(readonly E[])] => xs.length > 0;

          export const drain = (queue: readonly number[]): number => {
            const mut_queue = Array.from(queue);
            let mut_total = 0;

            while (isNonEmptyQueue(mut_queue)) {
              mut_total += mut_queue.pop() ?? 0;
              mut_queue.push(0);
              mut_queue.pop();
            }

            return mut_total;
          };
        `,
      },
    ],
    invalid: [
      {
        name: 'a branded tuple, and a type parameter constrained to a tuple',
        code: dedent`
          type BrandedPair = [number, string] & Readonly<{ brand: 'pair' }>;

          export const pushBranded = (mut_branded: BrandedPair): void => {
            mut_branded.push(1);
          };

          export const reverseGeneric = <T extends [number, string]>(mut_generic: T): T => {
            mut_generic.reverse();
            return mut_generic;
          };
        `,
        errors: [
          { messageId: 'lengthChanged', line: 4 },
          { messageId: 'positionsRewritten', line: 8 },
        ],
      },
      {
        name: 'a tuple with a rest element, whose push accepts the prefix type too',
        code: dedent`
          const mut_rest: [number, ...string[]] = [1, 'a'];

          mut_rest.push(2);

          export const rest = mut_rest;
        `,
        errors: [{ messageId: 'lengthChanged', line: 3 }],
      },
      {
        name: 'the length-changing five',
        code: dedent`
          const mut_len: [number, string] = [1, 'a'];

          mut_len.push('b');
          mut_len.pop();
          mut_len.shift();
          mut_len.unshift(0);
          mut_len.splice(0, 1);

          export const len = mut_len;
        `,
        errors: [
          { messageId: 'lengthChanged', line: 3 },
          { messageId: 'lengthChanged', line: 4 },
          { messageId: 'lengthChanged', line: 5 },
          { messageId: 'lengthChanged', line: 6 },
          { messageId: 'lengthChanged', line: 7 },
        ],
      },
      {
        name: 'the position-rewriting four, which break a heterogeneous tuple',
        code: dedent`
          const mut_pos: [number, string] = [1, 'a'];

          mut_pos.reverse();
          mut_pos.sort();
          mut_pos.fill(0);
          mut_pos.copyWithin(0, 1);

          export const pos = mut_pos;
        `,
        errors: [
          { messageId: 'positionsRewritten', line: 3 },
          { messageId: 'positionsRewritten', line: 4 },
          { messageId: 'positionsRewritten', line: 5 },
          { messageId: 'positionsRewritten', line: 6 },
        ],
      },
      {
        name: 'a homogeneous tuple is reported too — the rule is about tuples',
        code: dedent`
          const mut_same: [number, number] = [2, 1];

          mut_same.reverse();

          export const same = mut_same;
        `,
        errors: [{ messageId: 'positionsRewritten', line: 3 }],
      },
      {
        name: 'a union in which one member is a tuple',
        code: dedent`
          declare const mut_maybeTuple: [number, number] | number[];

          mut_maybeTuple.sort((a, b) => a - b);

          export const maybeTuple = mut_maybeTuple;
        `,
        errors: [{ messageId: 'positionsRewritten', line: 3 }],
      },
    ],
  });
});
