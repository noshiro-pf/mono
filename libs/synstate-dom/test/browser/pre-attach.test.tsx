import {
  createState,
  onScopeDispose,
  type InitializedObservable,
} from 'synstate';
import {
  constant,
  For,
  If,
  inlineMap,
  MatchOptional,
  Portal,
  render,
  type JSX,
} from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';

// An element mounts all its children before it appends them, and `render`
// mounts the whole app before it appends it. A child mounted later that writes
// to what an earlier `For` or `If` reads (in its body, or in a `ref`) updates
// them while their anchor is not yet in any parent (#2935).

type Item = Readonly<{ id: string }>;

const setupFor = (): Readonly<{
  rows: () => JSX.Element;
  write: () => JSX.Element;
  calls: ReadonlyMap<string, number>;
  live: () => number;
}> => {
  const [items$, setItems] = createState<readonly Item[]>([
    { id: 'a' },
    { id: 'b' },
  ]);

  const mut_calls = new Map<string, number>();

  const mut_live = { current: 0 };

  const Row = ({
    item$,
  }: Readonly<{ item$: InitializedObservable<Item> }>): JSX.Element => {
    const { id } = item$.getSnapshot().value;

    mut_calls.set(id, (mut_calls.get(id) ?? 0) + 1);

    // Counts the row scopes still alive.
    mut_live.current += 1;

    onScopeDispose(() => {
      mut_live.current -= 1;
    });

    return <li>{inlineMap(item$, (i) => i.id)}</li>;
  };

  const rows = (): JSX.Element => (
    <For items={items$} key={(i) => i.id}>
      {(item$) => <Row item$={item$} />}
    </For>
  );

  const Write = (): JSX.Element => {
    setItems([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);

    return <span>{constant(' (written)')}</span>;
  };

  return {
    rows,
    write: () => <Write />,
    calls: mut_calls,
    live: () => mut_live.current,
  };
};

const setupIf = (): Readonly<{
  branch: () => JSX.Element;
  write: () => JSX.Element;
}> => {
  const [cond$, setCond] = createState(true);

  const Write = (): JSX.Element => {
    setCond(false);

    return <span>{constant(' (written)')}</span>;
  };

  return {
    branch: () => (
      <If
        cond={cond$}
        then={<b>{constant('then')}</b>}
        else={<i>{constant('else')}</i>}
      />
    ),
    write: () => <Write />,
  };
};

/** Where the `For` or `If` and the writer after it are placed. */
const layouts = [
  [
    'siblings in an element',
    (first: () => JSX.Element, second: () => JSX.Element) => (
      <div>
        {first()}
        {second()}
      </div>
    ),
  ],
  [
    'the writer inside a later sibling element',
    (first: () => JSX.Element, second: () => JSX.Element) => (
      <div>
        {first()}
        <p>{second()}</p>
      </div>
    ),
  ],
  [
    'siblings in a fragment inside an element',
    (first: () => JSX.Element, second: () => JSX.Element) => (
      <div>
        <>
          {first()}
          {second()}
        </>
      </div>
    ),
  ],
  [
    'siblings at the top of render',
    (first: () => JSX.Element, second: () => JSX.Element) => (
      <>
        {first()}
        {second()}
      </>
    ),
  ],
] as const;

describe('an update before the anchor is attached (#2935)', () => {
  describe.each(layouts)('%s', (_, layout) => {
    test('For shows the latest items and builds each row once', () => {
      const { rows, write, calls, live } = setupFor();

      const container = document.createElement('div');

      const unmount = render(() => layout(rows, write), container);

      assert.deepStrictEqual(
        Array.from(container.querySelectorAll('li'), (li) => li.textContent),
        ['a', 'b', 'c'],
      );

      assert.deepStrictEqual(Object.fromEntries(calls), { a: 1, b: 1, c: 1 });

      assert.strictEqual(live(), 3);

      unmount();

      assert.strictEqual(live(), 0);

      assert.strictEqual(container.childNodes.length, 0);
    });

    test('If shows the branch chosen last', () => {
      const { branch, write } = setupIf();

      const container = document.createElement('div');

      const unmount = render(() => layout(branch, write), container);

      assert.strictEqual(container.textContent, 'else (written)');

      unmount();

      assert.strictEqual(container.childNodes.length, 0);
    });
  });
});

describe('updates deferred by the mounts For, If and Portal open themselves', () => {
  test('a row added later follows a write from a later sibling in the row', () => {
    const [items$, setItems] = createState<readonly string[]>(['a']);

    const RowWithSwitch = ({ id }: Readonly<{ id: string }>): JSX.Element => {
      const [on$, setOn] = createState(true);

      const Write = (): JSX.Element => {
        setOn(false);

        return <span>{constant('|')}</span>;
      };

      return (
        <li>
          <If
            cond={on$}
            then={<b>{constant(`${id}:on`)}</b>}
            else={<i>{constant(`${id}:off`)}</i>}
          />
          <Write />
        </li>
      );
    };

    const container = document.createElement('div');

    const unmount = render(
      () => (
        <ul>
          <For items={items$} key={(id) => id}>
            {(id$) => <RowWithSwitch id={id$.getSnapshot().value} />}
          </For>
        </ul>
      ),
      container,
    );

    setItems(['a', 'b']);

    assert.deepStrictEqual(
      Array.from(container.querySelectorAll('li'), (li) => li.textContent),
      ['a:off|', 'b:off|'],
    );

    unmount();
  });

  test('a branch opened later follows a write from a later sibling in the branch', () => {
    const [outer$, setOuter] = createState(false);

    const [inner$, setInner] = createState(true);

    const Write = (): JSX.Element => {
      setInner(false);

      return <span>{constant('|')}</span>;
    };

    const container = document.createElement('div');

    const unmount = render(
      () => (
        <If
          cond={outer$}
          then={
            <>
              <If
                cond={inner$}
                then={<b>{constant('on')}</b>}
                else={<i>{constant('off')}</i>}
              />
              <Write />
            </>
          }
        />
      ),
      container,
    );

    setOuter(true);

    assert.strictEqual(container.textContent, 'off|');

    unmount();
  });

  test('Portal children follow a write from a later sibling', () => {
    const [on$, setOn] = createState(true);

    const Write = (): JSX.Element => {
      setOn(false);

      return <span>{constant('|')}</span>;
    };

    const target = document.createElement('div');

    const unmount = render(
      () => (
        <Portal target={target}>
          <If
            cond={on$}
            then={<b>{constant('on')}</b>}
            else={<i>{constant('off')}</i>}
          />
          <Write />
        </Portal>
      ),
      document.createElement('div'),
    );

    assert.strictEqual(target.textContent, 'off|');

    unmount();
  });

  test('a deferred update of a For disposed in the meantime does nothing', () => {
    const [show$, setShow] = createState(true);

    const [items$, setItems] = createState<readonly string[]>(['a']);

    const mut_built: string[] = [];

    const Write = (): JSX.Element => {
      // Both updates are deferred; the If's runs first and disposes the For.
      setShow(false);

      setItems(['a', 'b']);

      return <span>{constant('|')}</span>;
    };

    const container = document.createElement('div');

    const unmount = render(
      () => (
        <div>
          <If
            cond={show$}
            then={
              <For items={items$} key={(id) => id}>
                {(id$) => {
                  mut_built.push(id$.getSnapshot().value);

                  return <b>{inlineMap(id$, (id) => id)}</b>;
                }}
              </For>
            }
            else={<i>{constant('hidden')}</i>}
          />
          <Write />
        </div>
      ),
      container,
    );

    assert.strictEqual(container.textContent, 'hidden|');

    assert.deepStrictEqual(mut_built, ['a']);

    unmount();
  });

  test('a value applied while attached replaces the one still waiting', () => {
    const [show$, setShow] = createState(true);

    const [items$, setItems] = createState<readonly string[]>(['a']);

    const WriteFirst = (): JSX.Element => {
      // Both wait for the div; the If's update runs first and mounts `else`.
      setShow(false);

      setItems(['x']);

      return <span>{constant('|')}</span>;
    };

    const WriteLater = (): JSX.Element => {
      // The For is attached by now, so this applies at once.
      setItems(['y']);

      return <span>{constant('')}</span>;
    };

    const container = document.createElement('div');

    const unmount = render(
      () => (
        <div>
          <If
            cond={show$}
            then={<i>{constant('shown')}</i>}
            else={<WriteLater />}
          />
          <For items={items$} key={(id) => id}>
            {(id$) => <b>{inlineMap(id$, (id) => id)}</b>}
          </For>
          <WriteFirst />
        </div>
      ),
      container,
    );

    assert.strictEqual(container.textContent, 'y|');

    unmount();
  });

  test('render takes back what it appended when a deferred update throws', () => {
    const [cond$, setCond] = createState(true);

    const Write = (): JSX.Element => {
      setCond(false);

      return <span>{constant('|')}</span>;
    };

    const container = document.createElement('div');

    expect(() =>
      render(
        // At the top, the If's update waits for render's own append.
        () => (
          <>
            <If cond={cond$} then={<b>{constant('on')}</b>} else={<Throw />} />
            <Write />
          </>
        ),
        container,
      ),
    ).toThrow('mount failed');

    assert.strictEqual(container.childNodes.length, 0);
  });

  test('an update deferred after one that throws still runs', () => {
    const [first$, setFirst] = createState(true);

    const [second$, setSecond] = createState(true);

    const mut_reached = { current: false };

    const Reached = (): JSX.Element => {
      mut_reached.current = true;

      return <i>{constant('off')}</i>;
    };

    const Write = (): JSX.Element => {
      setFirst(false);

      setSecond(false);

      return <span>{constant('|')}</span>;
    };

    expect(() =>
      render(
        () => (
          <div>
            <If cond={first$} then={<b>{constant('on')}</b>} else={<Throw />} />
            <If
              cond={second$}
              then={<b>{constant('on')}</b>}
              else={<Reached />}
            />
            <Write />
          </div>
        ),
        document.createElement('div'),
      ),
    ).toThrow('mount failed');

    assert.isTrue(mut_reached.current);
  });

  test('a component that throws while mounting leaves later renders working', () => {
    expect(() =>
      render(
        () => (
          <div>
            <Throw />
          </div>
        ),
        document.createElement('div'),
      ),
    ).toThrow('mount failed');

    const { branch, write } = setupIf();

    const container = document.createElement('div');

    const unmount = render(
      () => (
        <div>
          {branch()}
          {write()}
        </div>
      ),
      container,
    );

    assert.strictEqual(container.textContent, 'else (written)');

    unmount();
  });
});

const setupSelfWritingIf = (
  initial: boolean,
): Readonly<{
  branch: () => JSX.Element;
  setCond: (v: boolean) => void;
  live: () => number;
}> => {
  const [cond$, setCond] = createState(initial);

  const mut_live = { current: 0 };

  const Live = ({
    children,
  }: Readonly<{ children: JSX.Element }>): JSX.Element => {
    mut_live.current += 1;

    onScopeDispose(() => {
      mut_live.current -= 1;
    });

    return children;
  };

  // `then` writes the `cond` that chose it while it is mounted.
  const WriteFalse = (): JSX.Element => {
    setCond(false);

    return <b>{constant('then')}</b>;
  };

  return {
    branch: () => (
      <If
        cond={cond$}
        then={
          <Live>
            <WriteFalse />
          </Live>
        }
        else={
          <Live>
            <i>{constant('else')}</i>
          </Live>
        }
      />
    ),
    setCond,
    live: () => mut_live.current,
  };
};

const setupSelfWritingFor = (
  initial: readonly string[],
): Readonly<{
  rows: () => JSX.Element;
  setItems: (v: readonly string[]) => void;
  calls: ReadonlyMap<string, number>;
  live: () => number;
}> => {
  const [items$, setItems] = createState<readonly string[]>(initial);

  const mut_calls = new Map<string, number>();

  const mut_live = { current: 0 };

  const Row = ({ id }: Readonly<{ id: string }>): JSX.Element => {
    mut_calls.set(id, (mut_calls.get(id) ?? 0) + 1);

    mut_live.current += 1;

    onScopeDispose(() => {
      mut_live.current -= 1;
    });

    // Row `a` adds row `b` while it is mounted.
    const current = items$.getSnapshot().value;

    if (id === 'a' && !current.includes('b')) {
      setItems(Arr.toPushed(current, 'b'));
    }

    return <li>{constant(id)}</li>;
  };

  return {
    rows: () => (
      <ul>
        <For items={items$} key={(id) => id}>
          {(id$) => <Row id={id$.getSnapshot().value} />}
        </For>
      </ul>
    ),
    setItems,
    calls: mut_calls,
    live: () => mut_live.current,
  };
};

describe('a write from inside the branch or row being mounted (#3141)', () => {
  describe.each(layouts)('%s', (_, layout) => {
    test('If follows a write from the branch mounted first', () => {
      const { branch, live } = setupSelfWritingIf(true);

      const container = document.createElement('div');

      const unmount = render(
        () => layout(branch, () => <span>{constant('|')}</span>),
        container,
      );

      assert.strictEqual(container.textContent, 'else|');

      assert.strictEqual(live(), 1);

      unmount();

      assert.strictEqual(live(), 0);

      assert.strictEqual(container.childNodes.length, 0);
    });
  });

  test('If follows a write from the branch it switches to', () => {
    const { branch, setCond, live } = setupSelfWritingIf(false);

    const container = document.createElement('div');

    const unmount = render(() => <div>{branch()}</div>, container);

    assert.strictEqual(container.textContent, 'else');

    setCond(true);

    assert.strictEqual(container.textContent, 'else');

    assert.strictEqual(live(), 1);

    unmount();

    assert.strictEqual(live(), 0);
  });

  test('MatchOptional follows a write from the branch it switches to', () => {
    const [value$, setValue] = createState<Optional<number>>(Optional.none);

    const mut_live = { current: 0 };

    const Some = (): JSX.Element => {
      mut_live.current += 1;

      onScopeDispose(() => {
        mut_live.current -= 1;
      });

      setValue(Optional.none);

      return <b>{constant('some')}</b>;
    };

    const container = document.createElement('div');

    const unmount = render(
      () => (
        <div>
          <MatchOptional
            value={value$}
            some={() => <Some />}
            none={<i>{constant('none')}</i>}
          />
        </div>
      ),
      container,
    );

    setValue(Optional.some(1));

    assert.strictEqual(container.textContent, 'none');

    assert.strictEqual(mut_live.current, 0);

    unmount();
  });

  test('a write that never settles is an error, not a hang', () => {
    const [cond$, setCond] = createState(false);

    const Write = ({ to }: Readonly<{ to: boolean }>): JSX.Element => {
      setCond(to);

      return <b>{constant(to ? 'then' : 'else')}</b>;
    };

    // Each branch writes the value that chooses the other.
    expect(() =>
      render(
        () => (
          <div>
            <If
              cond={cond$}
              then={<Write to={false} />}
              else={<Write to={true} />}
            />
          </div>
        ),
        document.createElement('div'),
      ),
    ).toThrow('more than 100 times in a row');
  });

  test('a For row write that never settles is an error, not a hang', () => {
    const [items$, setItems] = createState<readonly number[]>([0]);

    // Each row adds the next key while it is mounted.
    const Row = ({ n }: Readonly<{ n: number }>): JSX.Element => {
      setItems(Arr.toPushed(items$.getSnapshot().value, n + 1));

      return <li />;
    };

    expect(() =>
      render(
        () => (
          <ul>
            <For items={items$} key={(n) => n}>
              {(n$) => <Row n={n$.getSnapshot().value} />}
            </For>
          </ul>
        ),
        document.createElement('div'),
      ),
    ).toThrow('more than 100 times in a row');
  });

  test.each([
    ['directly in the disposed branch', (x: JSX.Element) => x],
    [
      'inside an element of the disposed branch',
      (x: JSX.Element) => <div>{x}</div>,
    ],
  ] as const)(
    'a write kept while a switch was disposed in the meantime does nothing: %s',
    (_, wrap) => {
      const [show$, setShow] = createState(true);

      const [cond$, setCond] = createState(false);

      // The writes from a mount warn that they happen during an update; nothing
      // else may (a scope born disposed, a mount that belongs to no scope).
      const warn = vi.fn();

      vi.stubGlobal('console', { ...console, warn });

      onTestFinished(() => {
        vi.unstubAllGlobals();
      });

      const WriteBoth = (): JSX.Element => {
        // Kept for the inner If, which the outer one then disposes.
        setCond(false);

        setShow(false);

        return <b>{constant('then')}</b>;
      };

      const container = document.createElement('div');

      const unmount = render(
        () => (
          <div>
            <If
              cond={show$}
              then={wrap(
                <If
                  cond={cond$}
                  then={<WriteBoth />}
                  else={<i>{constant('else')}</i>}
                />,
              )}
              else={<i>{constant('hidden')}</i>}
            />
          </div>
        ),
        container,
      );

      setCond(true);

      assert.strictEqual(container.textContent, 'hidden');

      assert.deepStrictEqual(
        warn.mock.calls
          .map((args: readonly unknown[]) => args[0])
          .filter(
            (message) =>
              typeof message !== 'string' ||
              !message.includes('while an update was propagating'),
          ),
        [],
      );

      unmount();
    },
  );

  test('For follows a write from a row mounted first', () => {
    const { rows, calls, live } = setupSelfWritingFor(['x', 'a']);

    const container = document.createElement('div');

    const unmount = render(rows, container);

    assert.deepStrictEqual(
      Array.from(container.querySelectorAll('li'), (li) => li.textContent),
      ['x', 'a', 'b'],
    );

    assert.deepStrictEqual(Object.fromEntries(calls), { x: 1, a: 1, b: 1 });

    assert.strictEqual(live(), 3);

    unmount();

    assert.strictEqual(live(), 0);
  });

  test('For follows a write from a row it adds', () => {
    const { rows, setItems, calls, live } = setupSelfWritingFor(['x']);

    const container = document.createElement('div');

    const unmount = render(rows, container);

    setItems(['x', 'a']);

    assert.deepStrictEqual(
      Array.from(container.querySelectorAll('li'), (li) => li.textContent),
      ['x', 'a', 'b'],
    );

    assert.deepStrictEqual(Object.fromEntries(calls), { x: 1, a: 1, b: 1 });

    assert.strictEqual(live(), 3);

    unmount();

    assert.strictEqual(live(), 0);
  });
});

const Throw = (): JSX.Element => {
  throw new Error('mount failed');
};
