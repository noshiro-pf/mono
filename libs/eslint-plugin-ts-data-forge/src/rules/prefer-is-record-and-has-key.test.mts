import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferIsRecordAndHasKey } from './prefer-is-record-and-has-key.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../..`,
    },
  },
});

describe('prefer-is-record-and-has-key', () => {
  tester.run('prefer-is-record-and-has-key', preferIsRecordAndHasKey, {
    valid: [
      {
        name: 'ignores other Object methods',
        code: dedent`
          const obj = { a: 1 };
          const keys = Object.keys(obj);
        `,
      },
      {
        name: 'ignores hasOwn with wrong number of arguments',
        code: dedent`
          const obj = { a: 1 };
          const ok = Object.hasOwn(obj);
        `,
      },
    ],
    invalid: [
      // #3267: `Object.hasOwn` answers for a function's own properties, and
      // `isRecord` rejects every function, so the rewrite is fixed only where
      // the object cannot be one.
      {
        name: 'suggests, not fixes, Object.hasOwn on a function',
        code: dedent`
          declare const fn: () => void;
          const ok = Object.hasOwn(fn, 'k');
        `,
        output: null,
        errors: [
          {
            messageId: 'hasOwnAcceptsFunctions',
            suggestions: [
              {
                messageId: 'suggestRecordCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  declare const fn: () => void;
                  const ok = (isRecord(fn) && hasKey(fn, 'k'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'suggests, not fixes, Object.hasOwn on a class constructor',
        code: dedent`
          declare class Widget {
            static readonly k: number;
          }
          const ok = Object.hasOwn(Widget, 'k');
        `,
        output: null,
        errors: [
          {
            messageId: 'hasOwnAcceptsFunctions',
            suggestions: [
              {
                messageId: 'suggestRecordCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  declare class Widget {
                    static readonly k: number;
                  }
                  const ok = (isRecord(Widget) && hasKey(Widget, 'k'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'suggests, not fixes, Object.hasOwn on object',
        code: dedent`
          declare const o: object;
          const ok = Object.hasOwn(o, 'k');
        `,
        output: null,
        errors: [
          {
            messageId: 'hasOwnAcceptsFunctions',
            suggestions: [
              {
                messageId: 'suggestRecordCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  declare const o: object;
                  const ok = (isRecord(o) && hasKey(o, 'k'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'suggests, not fixes, Object.hasOwn on unknown',
        code: dedent`
          declare const u: unknown;
          const ok = Object.hasOwn(u, 'k');
        `,
        output: null,
        errors: [
          {
            messageId: 'hasOwnAcceptsFunctions',
            suggestions: [
              {
                messageId: 'suggestRecordCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  declare const u: unknown;
                  const ok = (isRecord(u) && hasKey(u, 'k'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'still fixes Object.hasOwn on a plain object type, which cannot be a function',
        code: dedent`
          declare const plain: { readonly k?: number };
          const ok = Object.hasOwn(plain, 'k');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          declare const plain: { readonly k?: number };
          const ok = (isRecord(plain) && hasKey(plain, 'k'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'drops isRecord when the object already has a string index signature',
        code: dedent`
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = hasKey(obj, 'a');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'drops isRecord for `key in obj` on a record-typed object',
        code: dedent`
          declare const obj: Record<string, number>;
          const ok = 'a' in obj;
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';
          declare const obj: Record<string, number>;
          const ok = hasKey(obj, 'a');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'keeps isRecord for an index-signature-carrying callable, as a suggestion',
        code: dedent`
          type Callable = { (): void; [key: string]: unknown };
          declare const obj: Callable;
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: null,
        errors: [
          {
            messageId: 'hasOwnAcceptsFunctions',
            suggestions: [
              {
                messageId: 'suggestRecordCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  type Callable = { (): void; [key: string]: unknown };
                  declare const obj: Callable;
                  const ok = (isRecord(obj) && hasKey(obj, 'a'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'imports isRecord once when both forms appear in a file',
        code: dedent`
          declare const rec: Record<string, unknown>;
          declare const unk: { readonly b?: number } | null;
          const a = Object.hasOwn(rec, 'a');
          const b = Object.hasOwn(unk, 'b');
        `,
        output: [
          dedent`
            import { hasKey } from 'ts-data-forge';
            declare const rec: Record<string, unknown>;
            declare const unk: { readonly b?: number } | null;
            const a = hasKey(rec, 'a');
            const b = Object.hasOwn(unk, 'b');
          `,
          dedent`
            import { hasKey, isRecord } from 'ts-data-forge';
            declare const rec: Record<string, unknown>;
            declare const unk: { readonly b?: number } | null;
            const a = hasKey(rec, 'a');
            const b = (isRecord(unk) && hasKey(unk, 'b'));
          `,
        ],
        errors: [
          { messageId: 'useHasKey' },
          { messageId: 'useIsRecordAndHasKey' },
        ],
      },
      {
        name: 'replaces Object.hasOwn(obj, key) with isRecord && hasKey',
        code: dedent`
          const obj = { a: 1 };
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const obj = { a: 1 };
          const ok = (isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'replaces key in obj with isRecord && hasKey',
        code: dedent`
          const obj = { a: 1 };
          const ok = 'a' in obj;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  const obj = { a: 1 };
                  const ok = (isRecord(obj) && hasKey(obj, 'a'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'works with variable key',
        code: dedent`
          const obj = { a: 1 };
          const key = 'a';
          const ok = Object.hasOwn(obj, key);
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const obj = { a: 1 };
          const key = 'a';
          const ok = (isRecord(obj) && hasKey(obj, key));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'works with in and variable key',
        code: dedent`
          const obj = { a: 1 };
          const key = 'a';
          const ok = key in obj;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  const obj = { a: 1 };
                  const key = 'a';
                  const ok = (isRecord(obj) && hasKey(obj, key));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'keeps existing isRecord import',
        code: dedent`
          import { isRecord } from 'ts-data-forge';

          const obj = { a: 1 };
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';

          const obj = { a: 1 };
          const ok = (isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'keeps existing hasKey import',
        code: dedent`
          import { hasKey } from 'ts-data-forge';

          const obj = { a: 1 };
          const ok = 'a' in obj;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { hasKey, isRecord } from 'ts-data-forge';

                  const obj = { a: 1 };
                  const ok = (isRecord(obj) && hasKey(obj, 'a'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'keeps both existing imports',
        code: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';

          const obj = { a: 1 };
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';

          const obj = { a: 1 };
          const ok = (isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'replaces multiple checks',
        code: dedent`
          const obj = { a: 1 };
          const ok1 = Object.hasOwn(obj, 'a');
          const ok2 = 'b' in obj;
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const obj = { a: 1 };
          const ok1 = (isRecord(obj) && hasKey(obj, 'a'));
          const ok2 = 'b' in obj;
        `,
        errors: [
          { messageId: 'useIsRecordAndHasKey' },
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  const obj = { a: 1 };
                  const ok1 = Object.hasOwn(obj, 'a');
                  const ok2 = (isRecord(obj) && hasKey(obj, 'b'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'works with complex object expressions',
        code: dedent`
          const data = { nested: { value: 1 } };
          const ok = Object.hasOwn(data.nested, 'value');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const data = { nested: { value: 1 } };
          const ok = (isRecord(data.nested) && hasKey(data.nested, 'value'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'works with in and complex object expressions',
        code: dedent`
          const data = { nested: { value: 1 } };
          const ok = 'value' in data.nested;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  const data = { nested: { value: 1 } };
                  const ok = (isRecord(data.nested) && hasKey(data.nested, 'value'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'correctly wraps negated Object.hasOwn with parentheses',
        code: dedent`
          const obj = { a: 1 };
          const ok = !Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          const obj = { a: 1 };
          const ok = !(isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'correctly wraps negated key in obj with parentheses',
        code: dedent`
          const obj = { a: 1 };
          const ok = !('a' in obj);
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  const obj = { a: 1 };
                  const ok = !((isRecord(obj) && hasKey(obj, 'a')));
                `,
              },
            ],
          },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-is-record-and-has-key through type wrappers', () => {
  tester.run('prefer-is-record-and-has-key', preferIsRecordAndHasKey, {
    valid: [],
    invalid: [
      {
        name: 'reads `Object` through `as`',
        code: dedent`
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = (Object as ObjectConstructor).hasOwn(obj, 'a');
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = hasKey(obj, 'a');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
    ],
  });
});

describe('prefer-is-record-and-has-key with parenthesized operands', () => {
  tester.run('prefer-is-record-and-has-key', preferIsRecordAndHasKey, {
    valid: [],
    invalid: [
      {
        name: 'keeps the parentheses of a sequence object',
        code: dedent`
          declare const a: number;
          declare const o: Readonly<Record<string, unknown>>;
          const ok = 'k' in (a, o);
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';
          declare const a: number;
          declare const o: Readonly<Record<string, unknown>>;
          const ok = hasKey((a, o), 'k');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'keeps the parentheses of a sequence key',
        code: dedent`
          declare const a: number;
          declare const o: Readonly<Record<string, unknown>>;
          const ok = (a, 'k') in o;
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';
          declare const a: number;
          declare const o: Readonly<Record<string, unknown>>;
          const ok = hasKey(o, (a, 'k'));
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
    ],
  });
});

describe('prefer-is-record-and-has-key where the rewrite would change behavior', () => {
  tester.run('prefer-is-record-and-has-key', preferIsRecordAndHasKey, {
    valid: [
      {
        // `isRecord` rejects an array, so `'0' in xs` would turn false.
        name: 'an array',
        code: dedent`
          declare const xs: readonly number[];
          const a = '0' in xs;
          const b = Object.hasOwn(xs, 'length');
        `,
      },
      {
        name: 'a union with an array',
        code: dedent`
          declare const v: Readonly<Record<string, unknown>> | readonly number[];
          const ok = 'k' in v;
        `,
      },
      {
        name: 'an array cast to a record',
        code: dedent`
          declare const arr: readonly string[];
          const ok = Object.hasOwn(arr as unknown as Record<string, unknown>, '0');
        `,
      },
      {
        name: 'a record widened by `as` to one that may be an array: the author says it may be one',
        code: dedent`
          declare const obj: Readonly<Record<string, unknown>>;
          const ok = Object.hasOwn(obj as Readonly<Record<string, unknown>> | readonly string[], 'a');
        `,
      },
    ],
    invalid: [
      {
        // `isRecord(…) && hasKey(…)` would evaluate the object twice.
        name: 'an object with side effects is reported without a fix',
        code: dedent`
          declare const getObj: () => object;
          declare const log: () => void;
          declare const o: object;
          const a = 'k' in getObj();
          const b = Object.hasOwn(getObj(), 'k');
          const c = 'k' in (log(), o);
        `,
        output: null,
        errors: [
          { messageId: 'inReadsPrototypeChain' },
          { messageId: 'hasOwnAcceptsFunctions' },
          { messageId: 'inReadsPrototypeChain' },
        ],
      },
      {
        name: 'an object with side effects is fixed when isRecord is dropped: it is read once',
        code: dedent`
          declare const getRec: () => Readonly<Record<string, unknown>>;
          const ok = 'k' in getRec();
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';
          declare const getRec: () => Readonly<Record<string, unknown>>;
          const ok = hasKey(getRec(), 'k');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'a reference read through type wrappers is still read without side effects',
        code: dedent`
          declare const o: { readonly p: object };
          const ok = 'k' in (o.p satisfies object);
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  declare const o: { readonly p: object };
                  const ok = (isRecord(o.p satisfies object) && hasKey(o.p satisfies object, 'k'));
                `,
              },
            ],
          },
        ],
      },
    ],
  });
});

// `in` walks the prototype chain and accepts a function; `hasKey` reads own
// properties and `isRecord` rejects a function, so each of these would turn
// from true to false: a suggestion, never a fix.
describe('prefer-is-record-and-has-key on `key in obj` outside a record type', () => {
  tester.run('prefer-is-record-and-has-key', preferIsRecordAndHasKey, {
    valid: [],
    invalid: [
      {
        name: 'a Promise, whose `then` is inherited',
        code: dedent`
          declare const value: Promise<number>;
          const ok = 'then' in value;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  declare const value: Promise<number>;
                  const ok = (isRecord(value) && hasKey(value, 'then'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'a Map, whose `size` is inherited',
        code: dedent`
          declare const coll: ReadonlyMap<string, number>;
          const ok = 'size' in coll;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  declare const coll: ReadonlyMap<string, number>;
                  const ok = (isRecord(coll) && hasKey(coll, 'size'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'a Date, whose `toISOString` is inherited',
        code: dedent`
          declare const d: Date;
          const ok = 'toISOString' in d;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  declare const d: Date;
                  const ok = (isRecord(d) && hasKey(d, 'toISOString'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'a class instance, whose method is on the prototype',
        code: dedent`
          class View {
            render(): void {}
          }
          declare const instance: View;
          const ok = 'render' in instance;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  class View {
                    render(): void {}
                  }
                  declare const instance: View;
                  const ok = (isRecord(instance) && hasKey(instance, 'render'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'a class instance with a string index signature, whose method is still on the prototype',
        code: dedent`
          class Bag {
            [key: string]: unknown;
            render(): void {}
          }
          declare const bag: Bag;
          const ok = 'render' in bag;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { hasKey } from 'ts-data-forge';
                  class Bag {
                    [key: string]: unknown;
                    render(): void {}
                  }
                  declare const bag: Bag;
                  const ok = hasKey(bag, 'render');
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'an interface with a string index signature, which a class or a built-in may implement',
        code: dedent`
          interface Store {
            [key: string]: unknown;
            getItem(key: string): unknown;
          }
          declare const store: Store;
          const ok = 'getItem' in store;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { hasKey } from 'ts-data-forge';
                  interface Store {
                    [key: string]: unknown;
                    getItem(key: string): unknown;
                  }
                  declare const store: Store;
                  const ok = hasKey(store, 'getItem');
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'a type parameter bounded by a class with a string index signature',
        code: dedent`
          class Bag {
            [key: string]: unknown;
            render(): void {}
          }
          const f = <T extends Bag>(bag: T): boolean => 'render' in bag;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { hasKey } from 'ts-data-forge';
                  class Bag {
                    [key: string]: unknown;
                    render(): void {}
                  }
                  const f = <T extends Bag>(bag: T): boolean => hasKey(bag, 'render');
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'a mapped type over a class, whose methods are still on the prototype',
        code: dedent`
          class Bag {
            [key: string]: unknown;
            render(): void {}
          }
          declare const bag: Readonly<Bag>;
          const ok = 'render' in bag;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { hasKey } from 'ts-data-forge';
                  class Bag {
                    [key: string]: unknown;
                    render(): void {}
                  }
                  declare const bag: Readonly<Bag>;
                  const ok = hasKey(bag, 'render');
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'a literal key naming a member of `Object.prototype`',
        code: dedent`
          declare const rec: Readonly<Record<string, unknown>>;
          const ok = 'constructor' in rec;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { hasKey } from 'ts-data-forge';
                  declare const rec: Readonly<Record<string, unknown>>;
                  const ok = hasKey(rec, 'constructor');
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'an object literal with a computed key is fixed: it has no prototype of its own',
        code: dedent`
          declare const key: string;
          const counts = { [key]: 0 };
          const ok = 'a' in counts;
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';
          declare const key: string;
          const counts = { [key]: 0 };
          const ok = hasKey(counts, 'a');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'a function, which `isRecord` rejects',
        code: dedent`
          declare const fn: () => void;
          const ok = 'name' in fn;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'ts-data-forge';
                  declare const fn: () => void;
                  const ok = (isRecord(fn) && hasKey(fn, 'name'));
                `,
              },
            ],
          },
        ],
      },
    ],
  });
});

// `Reflect.has` reads the prototype chain as `in` does, so it is reported only
// where `key in obj` is fixed: on a plain record, where it is an own-property
// check written the long way. Anywhere else it is what is meant.
describe('prefer-is-record-and-has-key on Reflect.has', () => {
  tester.run('prefer-is-record-and-has-key', preferIsRecordAndHasKey, {
    valid: [
      {
        name: 'an interface, which a class or a built-in may implement',
        code: dedent`
          interface Store {
            [key: string]: unknown;
            getItem(key: string): unknown;
          }
          declare const store: Store;
          const ok = Reflect.has(store, 'getItem');
        `,
      },
      {
        name: 'a class instance',
        code: dedent`
          class Bag {
            [key: string]: unknown;
            render(): void {}
          }
          declare const bag: Bag;
          const ok = Reflect.has(bag, 'render');
        `,
      },
      {
        name: 'a mapped type over a class',
        code: dedent`
          class Bag {
            [key: string]: unknown;
            render(): void {}
          }
          declare const bag: Readonly<Bag>;
          const ok = Reflect.has(bag, 'render');
        `,
      },
      {
        name: 'a built-in',
        code: dedent`
          declare const value: Promise<number>;
          const ok = Reflect.has(value, 'then');
        `,
      },
      {
        name: 'a function',
        code: dedent`
          declare const fn: () => void;
          const ok = Reflect.has(fn, 'name');
        `,
      },
      {
        name: 'an array',
        code: dedent`
          declare const xs: readonly number[];
          const ok = Reflect.has(xs, '0');
        `,
      },
      {
        name: 'object',
        code: dedent`
          declare const o: object;
          const ok = Reflect.has(o, 'type');
        `,
      },
      {
        name: 'an unknown value narrowed to object',
        code: dedent`
          declare const value: unknown;
          const ok = typeof value === 'object' && value !== null && Reflect.has(value, 'type');
        `,
      },
      {
        name: 'a plain object type without a string index signature',
        code: dedent`
          declare const obj: { readonly a?: number };
          const ok = Reflect.has(obj, 'a');
        `,
      },
      {
        name: 'a record widened by `as` to a class instance',
        code: dedent`
          class Bag {
            [key: string]: unknown;
            render(): void {}
          }
          declare const rec: Readonly<Record<string, unknown>>;
          const ok = Reflect.has(rec as Bag, 'render');
        `,
      },
      {
        name: 'a value cast to a record, which its own type does not vouch for',
        code: dedent`
          declare const value: unknown;
          const ok = Reflect.has(value as Record<string, unknown>, 'k');
        `,
      },
      {
        name: 'another Reflect method, or a computed member',
        code: dedent`
          declare const rec: Readonly<Record<string, unknown>>;
          declare const has: 'has';
          declare const hasOwn: 'keys';
          const a = Reflect.get(rec, 'k');
          const b = Reflect[has](rec, 'k');
          const c = Object[hasOwn](rec, 'k');
        `,
      },
      {
        name: 'a Reflect or an Object the file declares',
        code: dedent`
          declare const rec: Readonly<Record<string, unknown>>;
          const f = (Reflect: { has: (o: object, k: string) => boolean }): boolean =>
            Reflect.has(rec, 'k');
          const g = (Object: { hasOwn: (o: object, k: string) => boolean }): boolean =>
            Object.hasOwn(rec, 'k');
        `,
      },
      {
        name: 'the wrong number of arguments, or a spread',
        code: dedent`
          declare const rec: Readonly<Record<string, unknown>>;
          declare const args: readonly [Readonly<Record<string, unknown>>, string];
          const a = Reflect.has(rec);
          const b = Reflect.has(...args);
        `,
      },
    ],
    invalid: [
      {
        name: 'a plain record is fixed to hasKey',
        code: dedent`
          declare const rec: Readonly<Record<string, number>>;
          declare const key: string;
          const ok = Reflect.has(rec, key);
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';
          declare const rec: Readonly<Record<string, number>>;
          declare const key: string;
          const ok = hasKey(rec, key);
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'a type named Reflect, which does not hide the global',
        code: dedent`
          type Reflect = number;
          declare const rec: Readonly<Record<string, number>>;
          const ok = Reflect.has(rec, 'k');
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';
          type Reflect = number;
          declare const rec: Readonly<Record<string, number>>;
          const ok = hasKey(rec, 'k');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'a negated check, reusing the hasKey import',
        code: dedent`
          import { hasKey } from 'ts-data-forge';

          declare const rec: Record<string, number>;
          const ok = !Reflect.has(rec, 'a') && hasKey(rec, 'b');
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';

          declare const rec: Record<string, number>;
          const ok = !hasKey(rec, 'a') && hasKey(rec, 'b');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'an object read with side effects, which hasKey reads once too',
        code: dedent`
          declare const getRec: () => Readonly<Record<string, unknown>>;
          const ok = Reflect.has(getRec(), 'k');
        `,
        output: dedent`
          import { hasKey } from 'ts-data-forge';
          declare const getRec: () => Readonly<Record<string, unknown>>;
          const ok = hasKey(getRec(), 'k');
        `,
        errors: [{ messageId: 'useHasKey' }],
      },
      {
        name: 'a literal key naming a member of `Object.prototype` gets a suggestion',
        code: dedent`
          declare const rec: Readonly<Record<string, unknown>>;
          const ok = Reflect.has(rec, 'toString');
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { hasKey } from 'ts-data-forge';
                  declare const rec: Readonly<Record<string, unknown>>;
                  const ok = hasKey(rec, 'toString');
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'reads Reflect, the object and the key through type wrappers',
        code: dedent`
          declare const rec: Record<string, number>;
          const a = (Reflect as typeof Reflect).has(rec satisfies Record<string, number>, 'k');
          const b = Reflect.has!(rec!, 'k');
          const c = (<typeof Reflect>Reflect).has(rec, 'constructor' as const);
        `,
        output: [
          dedent`
            import { hasKey } from 'ts-data-forge';
            declare const rec: Record<string, number>;
            const a = hasKey(rec satisfies Record<string, number>, 'k');
            const b = Reflect.has!(rec!, 'k');
            const c = (<typeof Reflect>Reflect).has(rec, 'constructor' as const);
          `,
          dedent`
            import { hasKey } from 'ts-data-forge';
            declare const rec: Record<string, number>;
            const a = hasKey(rec satisfies Record<string, number>, 'k');
            const b = hasKey(rec!, 'k');
            const c = (<typeof Reflect>Reflect).has(rec, 'constructor' as const);
          `,
        ],
        errors: [
          { messageId: 'useHasKey' },
          { messageId: 'useHasKey' },
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { hasKey } from 'ts-data-forge';
                  declare const rec: Record<string, number>;
                  const a = (Reflect as typeof Reflect).has(rec satisfies Record<string, number>, 'k');
                  const b = Reflect.has!(rec!, 'k');
                  const c = hasKey(rec, 'constructor' as const);
                `,
              },
            ],
          },
        ],
      },
    ],
  });
});
