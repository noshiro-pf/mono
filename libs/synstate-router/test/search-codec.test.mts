import {
  asSafeInt,
  expectType,
  Num,
  Optional,
  Result,
  type SafeInt,
} from 'ts-data-forge';
import type { Brand } from 'ts-type-forge';
import {
  param,
  search,
  type SearchCodec,
  type SearchElementCodec,
  type StandardSchemaV1,
} from '../src/index.mjs';

describe('search.string', () => {
  test('is string | undefined, and keeps the empty value', () => {
    const q = search.string();

    expectType<typeof q, SearchElementCodec<string>>('=');

    assert.isTrue(q.decode([]) === undefined);

    assert.isTrue(q.decode('') === '');

    assert.isTrue(q.decode(['a', 'b']) === 'a');
  });

  test('is string with a default', () => {
    const q = search.string({ default: 'all' });

    expectType<typeof q, SearchCodec<string>>('=');

    assert.isTrue(q.decode([]) === 'all');

    assert.deepStrictEqual(q.encode('all'), []);

    assert.deepStrictEqual(q.encode('x'), ['x']);
  });
});

describe('search.int', () => {
  test('reads canonical integers, and anything else as absent', () => {
    const page = search.int();

    expectType<typeof page, SearchElementCodec<SafeInt>>('=');

    assert.isTrue(page.decode('3') === 3);

    assert.deepStrictEqual(page.parse(['03']), {
      value: undefined,
      issue: 'invalid',
    });

    assert.deepStrictEqual(page.parse(['']), {
      value: undefined,
      issue: undefined,
    });
  });

  test('takes a plain number as the default and checks it', () => {
    const page = search.int({ default: 1 });

    expectType<typeof page, SearchCodec<SafeInt>>('=');

    assert.isTrue(page.decode('abc') === 1);

    assert.throws(() => search.int({ default: 1.5 }));
  });
});

describe('search.boolean', () => {
  test('reads true and false only', () => {
    const open = search.boolean({ default: false });

    assert.isTrue(open.decode('true'));

    assert.isFalse(open.decode('yes'));

    assert.deepStrictEqual(open.encode(true), ['true']);

    assert.deepStrictEqual(open.encode(false), []);
  });
});

describe('search.literal', () => {
  test('reads the listed values only', () => {
    const sort = search.literal(['name', 'price']);

    expectType<typeof sort, SearchElementCodec<'name' | 'price'>>('=');

    assert.isTrue(sort.decode('price') === 'price');

    assert.isTrue(sort.decode('date') === undefined);
  });

  test('accepts a default from the list', () => {
    const sort = search.literal(['name', 'price'], { default: 'name' });

    expectType<typeof sort, SearchCodec<'name' | 'price'>>('=');

    assert.isTrue(sort.decode('date') === 'name');

    // @ts-expect-error The default is one of the values.
    search.literal(['name', 'price'], { default: 'date' });
  });
});

describe('search.array', () => {
  test('reads repeated keys', () => {
    const tags = search.array(search.string());

    expectType<typeof tags, SearchCodec<readonly string[]>>('=');

    assert.deepStrictEqual(tags.decode(['a', 'b,c']), ['a', 'b,c']);

    assert.deepStrictEqual(tags.encode(['a', 'b']), ['a', 'b']);

    assert.deepStrictEqual(tags.decode([]), []);
  });

  test('is all or nothing', () => {
    const ids = search.array(search.int());

    assert.deepStrictEqual(ids.parse(['1', 'x', '3']), {
      value: [],
      issue: 'invalid',
    });

    assert.deepStrictEqual(ids.parse(['', '']), {
      value: [],
      issue: undefined,
    });
  });

  test('leaves empty values out without a warning', () => {
    const ids = search.array(search.int());

    assert.deepStrictEqual<unknown>(ids.parse(['1', '', '3']), {
      value: [1, 3],
      issue: undefined,
    });

    // An empty string is a value of `search.string()`.
    assert.deepStrictEqual(search.array(search.string()).decode(['a', '']), [
      'a',
      '',
    ]);
  });

  test('takes element codecs only', () => {
    expectType<typeof _arrayOfDefaulted, () => void>('=');
  });
});

/** Never called: for the type checker. */
const _arrayOfDefaulted = (): void => {
  // @ts-expect-error An element with a default would have no meaning.
  search.array(search.int({ default: 1 }));
};

describe('search.refine', () => {
  type PageNumber = Brand<SafeInt, 'PageNumber'>;

  const isPageNumber = (n: SafeInt): n is PageNumber => n >= 1;

  test('narrows the element and reads a failing guard as absent', () => {
    const page = search.refine(search.int(), isPageNumber);

    expectType<typeof page, SearchElementCodec<PageNumber>>('=');

    assert.isTrue(page.decode('2') === 2);

    assert.deepStrictEqual(page.parse(['0']), {
      value: undefined,
      issue: 'invalid',
    });
  });

  test('puts the default on the refined codec, in the refined type', () => {
    const asPageNumber = (n: number): PageNumber => {
      const i = asSafeInt(n);

      if (!isPageNumber(i)) {
        throw new Error(`${n} is not a page number`);
      }

      return i;
    };

    const one = asPageNumber(1);

    const page = search.refine(search.int(), isPageNumber, { default: one });

    expectType<typeof page, SearchCodec<PageNumber>>('=');

    assert.isTrue(page.decode('0') === 1);

    // @ts-expect-error A default on the inner codec would bypass the guard.
    search.refine(search.int({ default: 0 }), isPageNumber);
  });

  test('refines array elements', () => {
    type TagId = Brand<string, 'TagId'>;

    const isTagId = (s: string): s is TagId => s.startsWith('t');

    const tags = search.array(search.refine(search.string(), isTagId));

    expectType<typeof tags, SearchCodec<readonly TagId[]>>('=');

    const decoded: readonly string[] = tags.decode(['t1', 't2']);

    assert.deepStrictEqual(decoded, ['t1', 't2']);

    assert.deepStrictEqual(tags.decode(['t1', 'x']), []);
  });
});

describe('search.from and search.custom', () => {
  test('reuse a path codec', () => {
    type UserId = Brand<string, 'UserId'>;

    const isUserId = (s: string): s is UserId => s.startsWith('u');

    const userId = param.refine(param.string, isUserId);

    const owner = search.from(userId);

    expectType<typeof owner, SearchElementCodec<UserId>>('=');

    assert.isTrue(owner.decode('u1') === 'u1');

    assert.isTrue(owner.decode('x') === undefined);
  });

  test('take a custom codec with a default', () => {
    const range = search.custom(
      {
        decode: (raw: string) => {
          const [from, to] = raw.split('..', 2);

          return from !== undefined && to !== undefined
            ? Optional.some({ from, to })
            : Optional.none;
        },
        encode: ({ from, to }: Readonly<{ from: string; to: string }>) =>
          `${from}..${to}`,
      },
      { default: { from: 'a', to: 'z' } },
    );

    assert.deepStrictEqual(range.decode('b..c'), { from: 'b', to: 'c' });

    assert.deepStrictEqual(range.decode('bc'), { from: 'a', to: 'z' });

    assert.deepStrictEqual(range.encode({ from: 'a', to: 'z' }), []);
  });
});

const enumSchema = <const Ls extends readonly string[]>(
  values: Ls,
): StandardSchemaV1<unknown, Ls[number]> =>
  ({
    '~standard': {
      version: 1,
      vendor: 'test',
      validate: (value) =>
        typeof value === 'string' && values.includes(value)
          ? ({ value } as const)
          : ({ issues: [{ message: 'not in the enum' }] } as const),
    },
  }) as const;

describe('search.schema', () => {
  test('validates the raw string with a Standard Schema', () => {
    const sort = search.schema(enumSchema(['name', 'price']));

    expectType<typeof sort, SearchElementCodec<'name' | 'price'>>('=');

    assert.isTrue(sort.decode('name') === 'name');

    assert.deepStrictEqual(sort.parse(['date']), {
      value: undefined,
      issue: 'invalid',
    });
  });

  test('takes a default', () => {
    const sort = search.schema(enumSchema(['name', 'price']), {
      default: 'name',
    });

    expectType<typeof sort, SearchCodec<'name' | 'price'>>('=');

    assert.isTrue(sort.decode('date') === 'name');
  });

  test('needs encode when the output is not a scalar', () => {
    const schema: StandardSchemaV1<unknown, Readonly<{ n: number }>> = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: (value) =>
          typeof value === 'string' && /^\d+$/u.test(value)
            ? ({
                value: {
                  n: Result.unwrapOkOr(Num.safeParseInt(value), Number.NaN),
                },
              } as const)
            : ({ issues: [{ message: 'not a number' }] } as const),
      },
    } as const;

    // @ts-expect-error `encode` is required for an object output.
    search.schema(schema);

    const boxed = search.schema(schema, { encode: ({ n }) => n.toString() });

    assert.deepStrictEqual(boxed.decode('3'), { n: 3 });

    assert.deepStrictEqual(boxed.encode({ n: 3 }), ['3']);
  });

  test('reads an asynchronous validation as absent and catches its rejection', async () => {
    const mut_rejections: unknown[] = [];

    const onRejection = (reason: unknown): void => {
      mut_rejections.push(reason);
    };

    process.on('unhandledRejection', onRejection);

    try {
      const schema: StandardSchemaV1<unknown, string> = {
        '~standard': {
          version: 1,
          vendor: 'test',
          validate: () => Promise.reject(new Error('async')),
        },
      } as const;

      const value = search.schema(schema);

      assert.deepStrictEqual(value.parse(['x']), {
        value: undefined,
        issue: 'async',
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      assert.deepStrictEqual(mut_rejections, []);
    } finally {
      process.off('unhandledRejection', onRejection);
    }
  });
});
