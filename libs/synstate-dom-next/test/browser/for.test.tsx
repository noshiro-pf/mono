import {
  constant,
  For,
  If,
  render,
  selector,
  type JSX,
} from 'synstate-dom-next';
import { batch, map, state, type InitializedObservable } from 'synstate-next';
import { Arr, Num } from 'ts-data-forge';

type Item = Readonly<{ id: number; v: number }>;

const setup = (
  initial: readonly Item[],
): Readonly<{
  set: (next: readonly Item[]) => void;
  text: () => string;
  calls: ReadonlyMap<number, number>;
  lis: () => readonly HTMLLIElement[];
}> => {
  const items = state(initial);

  const mut_calls = new Map<number, number>();

  const Row = ({
    item,
    index,
  }: Readonly<{
    item: InitializedObservable<Item>;
    index: InitializedObservable<number>;
  }>): JSX.Element => {
    const { id } = item.value;

    mut_calls.set(id, (mut_calls.get(id) ?? 0) + 1);

    return (
      <li>
        {index}
        {constant(':')}
        {item.pipe(map((x) => `${x.id.toString()}=${x.v.toString()}`))}
      </li>
    );
  };

  const container = document.createElement('div');

  render(
    () => (
      <ul>
        <For
          items={items}
          key={(x) => x.id}
          children={(item, index) => <Row index={index} item={item} />}
        />
      </ul>
    ),
    container,
  );

  return {
    set: (next) => {
      items.set(next);
    },
    text: () =>
      Array.from(container.querySelectorAll('li'), (li) => li.textContent).join(
        ' ',
      ),
    calls: mut_calls,
    lis: () => Array.from(container.querySelectorAll('li')),
  };
};

const it = (id: number, v: number = 0): Item => ({ id, v }) as const;

describe(For, () => {
  test('mounts a row per item', () => {
    const { text } = setup([it(1), it(2)]);

    assert.strictEqual(text(), '0:1=0 1:2=0');
  });

  test('an item that changes is set in its row, which is not rebuilt', () => {
    const { set, text, calls, lis } = setup([it(1), it(2)]);

    const [first] = lis();

    set([it(1, 5), it(2)]);

    assert.strictEqual(text(), '0:1=5 1:2=0');

    assert.strictEqual(calls.get(1), 1);

    assert.strictEqual(lis()[0], first);
  });

  test('reordering moves the rows, keeping their elements', () => {
    const { set, text, lis } = setup([it(1), it(2), it(3), it(4)]);

    const before = new Map(lis().map((li, i) => [i + 1, li]));

    set([it(4), it(2), it(3), it(1)]);

    assert.strictEqual(text(), '0:4=0 1:2=0 2:3=0 3:1=0');

    const after = lis();

    for (const [i, id] of [4, 2, 3, 1].entries()) {
      assert.strictEqual(after[i], before.get(id));
    }
  });

  test('adding and removing', () => {
    const { set, text, calls } = setup([it(1), it(2), it(3)]);

    set([it(0), it(2), it(4)]);

    assert.strictEqual(text(), '0:0=0 1:2=0 2:4=0');

    assert.strictEqual(calls.get(2), 1);

    set([]);

    assert.strictEqual(text(), '');

    set([it(2)]);

    assert.strictEqual(text(), '0:2=0');

    assert.strictEqual(calls.get(2), 2);
  });

  test('a key seen twice is reported', () => {
    const error = vi
      // eslint-disable-next-line vitest/no-restricted-vi-methods -- the report is the behavior under test
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      const { text } = setup([it(1), it(1, 2)]);

      assert.strictEqual(text(), '0:1=0 1:1=2');

      expect(error).toHaveBeenCalledExactlyOnceWith(
        'synstate-dom-next: For was given a duplicate key:',
        1,
      );
    } finally {
      error.mockRestore();
    }
  });
});

describe('nested For', () => {
  test('a row that starts with an inner For moves and goes whole', () => {
    type Group = Readonly<{ id: string; members: readonly string[] }>;

    const groups = state<readonly Group[]>([
      { id: 'a', members: ['a1', 'a2'] },
      { id: 'b', members: ['b1'] },
    ]);

    const container = document.createElement('div');

    render(
      () => (
        <For
          items={groups}
          key={(g) => g.id}
          children={(group) => (
            <For
              items={group.pipe(map((g) => g.members))}
              key={(m) => m}
              children={(member) => <i>{member}</i>}
            />
          )}
        />
      ),
      container,
    );

    const text = (): string =>
      Array.from(container.querySelectorAll('i'), (i) => i.textContent).join(
        ' ',
      );

    // The first node the inner For mounted goes.
    groups.set([
      { id: 'a', members: ['a2'] },
      { id: 'b', members: ['b1'] },
    ]);

    assert.strictEqual(text(), 'a2 b1');

    groups.set([
      { id: 'b', members: ['b1'] },
      { id: 'a', members: ['a2'] },
    ]);

    assert.strictEqual(text(), 'b1 a2');

    groups.set([{ id: 'b', members: ['b1'] }]);

    assert.strictEqual(text(), 'b1');

    groups.set([]);

    assert.strictEqual(text(), '');
  });
});

/** xorshift32, so that a failure replays. */
const random = (seed: number): ((n: number) => number) => {
  let mut_seed = seed;

  return (n) => {
    mut_seed ^= mut_seed << 13;

    mut_seed ^= mut_seed >>> 17;

    mut_seed ^= mut_seed << 5;

    return Num.isNonZero(n) ? Num.rem(mut_seed >>> 0, n) : 0;
  };
};

describe('For, against random edits', () => {
  test('the DOM matches the list after every edit', () => {
    const rnd = random(7);

    const items = state<readonly Item[]>([]);

    const selected = state(-1);

    const isSelected = selector(selected);

    const showTail = state(true);

    const container = document.createElement('div');

    render(
      () => (
        <ul>
          <For
            items={items}
            key={(x) => x.id}
            children={(item, index) => {
              const { id } = item.value;

              return (
                <>
                  <li class={{ on: isSelected.is(id) }}>
                    {item.pipe(
                      map((x) => `${x.id.toString()}:${x.v.toString()}`),
                    )}
                    {constant('@')}
                    {index}
                  </li>
                  <If
                    cond={item.pipe(map((x) => x.v % 2 === 0))}
                    then={<b>{constant('even')}</b>}
                  />
                </>
              );
            }}
          />
          <If
            cond={showTail}
            then={<i>{constant('tail')}</i>}
            else={<s>{constant('none')}</s>}
          />
        </ul>
      ),
      container,
    );

    const expected = (): string =>
      items.value
        .map(
          (x, i) =>
            `<li class="${x.id === selected.value ? 'on' : ''}">${x.id.toString()}:${x.v.toString()}@${i.toString()}</li>${x.v % 2 === 0 ? '<b>even</b>' : ''}`,
        )
        .join('') + (showTail.value ? '<i>tail</i>' : '<s>none</s>');

    const actual = (): string =>
      Array.from(
        container.querySelector('ul')?.children ?? [],
        (element) => element.outerHTML,
      ).join('');

    let mut_nextId = 1;

    const fresh = (): Item => {
      const item = it(mut_nextId, rnd(10));

      mut_nextId += 1;

      return item;
    };

    for (const step of Array.from({ length: 2000 }, (_, i) => i)) {
      const mut_next = Array.from(items.value);

      const op = rnd(8);

      if (op === 0) {
        for (const _ of Array.from({ length: rnd(5) + 1 })) {
          mut_next.splice(rnd(mut_next.length + 1), 0, fresh());
        }
      } else if (op === 1 && Arr.isNonEmpty(mut_next)) {
        mut_next.splice(rnd(mut_next.length), 1 + rnd(3));
      } else if (op === 2) {
        mut_next.sort(() => rnd(3) - 1);
      } else if (op === 3 && Arr.isNonEmpty(mut_next)) {
        const i = rnd(mut_next.length);

        mut_next[i] = it(mut_next[i]?.id ?? 0, rnd(10));
      } else if (op === 4) {
        mut_next.reverse();
      } else if (op === 5 && rnd(10) === 0) {
        // Everything goes; `length` is read-only under the strict library.
        while (Arr.isNonEmpty(mut_next)) {
          mut_next.pop();
        }
      } else if (op === 6 && Arr.isNonEmpty(mut_next)) {
        batch(() => {
          selected.set(mut_next[rnd(mut_next.length)]?.id ?? -1);

          showTail.update((x) => !x);
        });
      } else if (op === 7 && mut_next.length > 1) {
        const i = rnd(mut_next.length);

        const j = rnd(mut_next.length);

        const a = mut_next[i];

        const b = mut_next[j];

        if (a !== undefined && b !== undefined) {
          mut_next[i] = b;

          mut_next[j] = a;
        }
      }

      items.set(mut_next);

      // The step and the operation, to replay a failure.
      expect(
        actual().replaceAll(' class=""', ''),
        `step ${step.toString()}, op ${op.toString()}`,
      ).toBe(expected().replaceAll(' class=""', ''));
    }
  });
});
