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
        name: 'a fresh typed array, a fresh `Date`, and a declared loop variable',
        code: dedent`
          const bytesFresh: Readonly<Uint8Array> = new Uint8Array([3, 1, 2]);
          export const sortedBytes = bytesFresh.slice().sort();
          export const midnight = new Date().setHours(0);
          for (const _item of [1, 2]) {
            // a declaration binds a new name each time
          }
          export const read = Reflect.get({ a: 1 }, 'a');
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
        name: '`Map.getOrInsert` and `getOrInsertComputed`',
        code: dedent`
          const cacheMap = new Map<string, number>();
          const heldCache = cacheMap;
          heldCache.getOrInsert('a', 1);
          heldCache.getOrInsertComputed('b', () => 2);
          export const cache = heldCache;
        `,
        errors: [
          { messageId: 'mutatingCall', line: 3 },
          { messageId: 'mutatingCall', line: 4 },
        ],
      },
      {
        name: 'a `Date` setter and the typed-array mutators',
        code: dedent`
          const heldDate: Readonly<Date> = new Date(0);
          const heldBytes: Readonly<Uint8Array> = new Uint8Array(2);
          heldDate.setFullYear(2000);
          heldBytes.set([1], 0);
          heldBytes.sort();
          export const dated = [heldDate, heldBytes] as const;
        `,
        errors: [
          { messageId: 'mutatingCall', line: 3 },
          { messageId: 'mutatingCall', line: 4 },
          { messageId: 'mutatingCall', line: 5 },
        ],
      },
      {
        name: '`Reflect` mutators report their first argument',
        code: dedent`
          const reflected: Record<string, number> = { a: 1 };
          Reflect.set(reflected, 'a', 2);
          Reflect.deleteProperty(reflected, 'a');
          export const reflectedOut = reflected;
        `,
        errors: [
          { messageId: 'mutatingCall', line: 2 },
          { messageId: 'mutatingCall', line: 3 },
        ],
      },
      {
        name: 'a parenthesized or asserted target, and a delete through parentheses',
        code: dedent`
          const wrapped: { a: number } = { a: 1 };
          (wrapped.a) = 2;
          (wrapped.a as number) = 3;
          delete (wrapped as Partial<{ a: number }>).a;
          export const wrappedOut = wrapped;
        `,
        errors: [
          { messageId: 'assignment', line: 2 },
          { messageId: 'assignment', line: 3 },
          { messageId: 'deletion', line: 4 },
        ],
      },
      {
        name: 'a member access as a loop target',
        code: dedent`
          const cursor: { current: number; key: string } = { current: 0, key: '' };
          for (cursor.current of [1, 2]) {
            // each iteration assigns cursor.current
          }
          for (cursor.key in { a: 1 }) {
            // each iteration assigns cursor.key
          }
          export const cursorOut = cursor;
        `,
        errors: [
          { messageId: 'assignment', line: 2 },
          { messageId: 'assignment', line: 5 },
        ],
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
