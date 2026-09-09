import dedent from 'dedent';
import { noMutationWithoutMutPrefix } from '../src/index.mjs';
import { testRule } from './rule-tester.mjs';

describe(noMutationWithoutMutPrefix.ruleId, () => {
  testRule(noMutationWithoutMutPrefix, {
    valid: [
      {
        name: 'a `mut_` binding may be mutated',
        code: dedent`
          const mut_xs: number[] = [];
          mut_xs.push(1);
          mut_xs[0] = 2;
          export const mutated = mut_xs;
        `,
      },
      {
        name: 'a `mut_` property may be mutated',
        code: dedent`
          const state: { mut_seen: Record<string, number> } = { mut_seen: {} };
          state.mut_seen['a'] = 1;
          delete state.mut_seen['a'];
          export const seen = state.mut_seen;
        `,
      },
      {
        name: 'a copying method is not a mutation',
        code: dedent`
          const xsCopying: readonly number[] = [3, 1, 2];
          export const sortedCopying = xsCopying.toSorted((a, b) => a - b);
        `,
      },
      {
        name: 'a value made on the spot may be mutated',
        code: dedent`
          export const sortedFresh = [3, 1, 2].sort((a, b) => a - b);
          export const merged = Object.assign({}, { a: 1 });
          export const fromSlice = [3, 1, 2].slice().sort((a, b) => a - b);
        `,
      },
      {
        name: 'a method of one’s own that shares a mutator name',
        code: dedent`
          const reportOwn = { sort: (): number => 1, push: (): number => 2 };
          export const own = reportOwn.sort() + reportOwn.push();
        `,
      },
      {
        name: 'rebinding a variable is `functional/no-let`’s business',
        code: dedent`
          let mut_count = 0;
          mut_count = 1;
          export const count = mut_count;
        `,
      },
    ],
    invalid: [
      {
        name: 'assigning to a property',
        code: dedent`
          const target: { a: number } = { a: 1 };
          target.a = 2;
          export const assigned = target;
        `,
        errors: [{ messageId: 'assignment', line: 2 }],
      },
      {
        name: 'assigning to an element, and compound assignment',
        code: dedent`
          const rowElement: number[] = [0];
          rowElement[0] = 1;
          rowElement[0] += 1;
          export const row = rowElement;
        `,
        errors: [
          { messageId: 'assignment', line: 2 },
          { messageId: 'assignment', line: 3 },
        ],
      },
      {
        name: 'deleting a property',
        code: dedent`
          const bag: Record<string, number> = { a: 1 };
          delete bag['a'];
          export const kept = bag;
        `,
        errors: [{ messageId: 'deletion', line: 2 }],
      },
      {
        name: 'an array mutator on a plain binding',
        code: dedent`
          const xsPlain: number[] = [];
          xsPlain.push(1);
          xsPlain.sort((a, b) => a - b);
          export const plain = xsPlain;
        `,
        errors: [
          { messageId: 'mutatingCall', line: 2 },
          { messageId: 'mutatingCall', line: 3 },
        ],
      },
      {
        name: 'a Map and a Set mutator',
        code: dedent`
          const byName = new Map<string, number>();
          const seenNames = new Set<string>();
          const heldMap = byName;
          const heldSet = seenNames;
          heldMap.set('a', 1);
          heldSet.add('a');
          export const held = [heldMap, heldSet] as const;
        `,
        errors: [
          { messageId: 'mutatingCall', line: 5 },
          { messageId: 'mutatingCall', line: 6 },
        ],
      },
      {
        name: '`Object.assign` reports its first argument',
        code: dedent`
          const assignTarget: { a: number } = { a: 1 };
          Object.assign(assignTarget, { a: 2 });
          export const assignResult = assignTarget;
        `,
        errors: [{ messageId: 'mutatingCall', line: 2 }],
      },
      {
        name: 'a `mut_` index does not make the path mutable',
        code: dedent`
          const cells: number[] = [0];
          const mut_i = 0;
          cells[mut_i] = 1;
          export const cellsOut = cells;
        `,
        errors: [{ messageId: 'assignment', line: 3 }],
      },
    ],
  });
});
