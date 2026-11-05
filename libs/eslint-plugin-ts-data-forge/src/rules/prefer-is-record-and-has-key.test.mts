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
        name: 'keeps isRecord for an index-signature-carrying callable',
        code: dedent`
          type Callable = { (): void; [key: string]: unknown };
          declare const obj: Callable;
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: dedent`
          import { isRecord, hasKey } from 'ts-data-forge';
          type Callable = { (): void; [key: string]: unknown };
          declare const obj: Callable;
          const ok = (isRecord(obj) && hasKey(obj, 'a'));
        `,
        errors: [{ messageId: 'useIsRecordAndHasKey' }],
      },
      {
        name: 'imports isRecord once when both forms appear in a file',
        code: dedent`
          declare const rec: Record<string, unknown>;
          declare const unk: unknown;
          const a = Object.hasOwn(rec, 'a');
          const b = Object.hasOwn(unk, 'b');
        `,
        output: [
          dedent`
            import { hasKey } from 'ts-data-forge';
            declare const rec: Record<string, unknown>;
            declare const unk: unknown;
            const a = hasKey(rec, 'a');
            const b = Object.hasOwn(unk, 'b');
          `,
          dedent`
            import { hasKey, isRecord } from 'ts-data-forge';
            declare const rec: Record<string, unknown>;
            declare const unk: unknown;
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
          { messageId: 'useIsRecordAndHasKey' },
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
