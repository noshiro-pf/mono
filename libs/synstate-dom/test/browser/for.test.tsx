import { createState, type InitializedObservable } from 'synstate';
import {
  constant,
  For,
  If,
  Portal,
  render,
  view,
  type JSX,
} from 'synstate-dom';

type Item = Readonly<{ id: string; name: string }>;

const mountInto = (
  app: () => JSX.Element,
): Readonly<{
  container: HTMLDivElement;
  unmount: () => void;
}> => {
  const container = document.createElement('div');

  const unmount = render(app, container);

  return { container, unmount };
};

const item = (id: string, name: string = id): Item => ({ id, name }) as const;

const setup = (
  initial: readonly Item[],
): Readonly<{
  container: HTMLDivElement;
  unmount: () => void;
  setItems: (items: readonly Item[]) => void;
  calls: ReadonlyMap<string, number>;
  text: () => string;
  lis: () => readonly HTMLLIElement[];
}> => {
  const [items$, setItems] = createState<readonly Item[]>(initial);

  const mut_calls = new Map<string, number>();

  const Row = ({
    item$,
    index$,
  }: Readonly<{
    item$: InitializedObservable<Item>;
    index$: InitializedObservable<number>;
  }>): JSX.Element => {
    const { id } = item$.getSnapshot().value;

    mut_calls.set(id, (mut_calls.get(id) ?? 0) + 1);

    return (
      <li>
        {view(index$, (i) => `${i}:`)}
        {view(item$, (i) => i.name)}
      </li>
    );
  };

  const { container, unmount } = mountInto(() => (
    <ul>
      <For items={items$} key={(i) => i.id}>
        {(item$, index$) => <Row item$={item$} index$={index$} />}
      </For>
    </ul>
  ));

  return {
    container,
    unmount,
    setItems,
    calls: mut_calls,
    text: () =>
      Array.from(container.querySelectorAll('li'), (li) => li.textContent).join(
        ' ',
      ),
    lis: () => Array.from(container.querySelectorAll('li')),
  };
};

describe(For, () => {
  test('mounts a row per item', () => {
    const { text } = setup([item('a'), item('b')]);

    assert.strictEqual(text(), '0:a 1:b');
  });

  test('adds and removes rows without rebuilding the others', () => {
    const { setItems, calls, text, lis } = setup([item('a'), item('b')]);

    const [a, b] = lis();

    setItems([item('a'), item('c'), item('b')]);

    assert.strictEqual(text(), '0:a 1:c 2:b');

    setItems([item('c'), item('b')]);

    assert.strictEqual(text(), '0:c 1:b');

    assert.strictEqual(lis()[1], b);

    assert.strictEqual(a?.isConnected, false);

    assert.deepStrictEqual(Array.from(calls), [
      ['a', 1],
      ['b', 1],
      ['c', 1],
    ]);
  });

  test('reorders the same DOM nodes', () => {
    const { setItems, calls, text, lis } = setup([
      item('a'),
      item('b'),
      item('c'),
      item('d'),
    ]);

    const before = lis();

    setItems([item('d'), item('b'), item('a'), item('c')]);

    assert.strictEqual(text(), '0:d 1:b 2:a 3:c');

    assert.deepStrictEqual<unknown>(lis(), [
      before[3],
      before[1],
      before[0],
      before[2],
    ]);

    assert.isTrue(calls.values().every((n) => n === 1));
  });

  test('moves only the rows outside the longest increasing subsequence', () => {
    const { container, setItems } = setup([
      item('a'),
      item('b'),
      item('c'),
      item('d'),
      item('e'),
    ]);

    const ul = container.querySelector('ul');

    const mut_moved: Node[] = [];

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        mut_moved.push(...record.addedNodes);
      }
    });

    if (ul !== null) {
      observer.observe(ul, { childList: true });
    }

    setItems([item('e'), item('a'), item('b'), item('c'), item('d')]);

    for (const record of observer.takeRecords()) {
      mut_moved.push(...record.addedNodes);
    }

    observer.disconnect();

    // Only `e`: its row start comment and its `li`.
    assert.strictEqual(
      mut_moved.filter((node) => node instanceof HTMLLIElement).length,
      1,
    );
  });

  test('updates item$ in place for a key that stays', () => {
    const { setItems, calls, text } = setup([item('a', 'apple')]);

    setItems([item('a', 'avocado')]);

    assert.strictEqual(text(), '0:avocado');

    assert.strictEqual(calls.get('a'), 1);
  });

  test('disposes the row of a key that goes', () => {
    const [items$, setItems] = createState<readonly string[]>(['a', 'b']);

    const [suffix$, setSuffix] = createState('!');

    const mut_runs = { current: 0 };

    mountInto(() => (
      <For items={items$} key={(s) => s}>
        {(item$) => (
          <b>
            {view(suffix$, (s) => {
              mut_runs.current += 1;

              return `${item$.getSnapshot().value}${s}`;
            })}
          </b>
        )}
      </For>
    ));

    setItems(['a']);

    const before = mut_runs.current;

    setSuffix('?');

    assert.strictEqual(mut_runs.current, before + 1);
  });

  test('keeps rows whose top level switches when they move', () => {
    const [items$, setItems] = createState<readonly string[]>(['a', 'b']);

    const [open$, setOpen] = createState(false);

    const { container } = mountInto(() => (
      <div>
        <For items={items$} key={(s) => s}>
          {(item$) => (
            <If cond={open$} then={<b>{item$}</b>} else={<i>{item$}</i>} />
          )}
        </For>
      </div>
    ));

    setOpen(true);

    setItems(['b', 'a']);

    assert.strictEqual(container.querySelector('div')?.textContent, 'ba');

    assert.strictEqual(container.querySelectorAll('i').length, 0);

    setItems([]);

    assert.strictEqual(container.querySelectorAll('b').length, 0);
  });

  test('a duplicate key is reported and still rendered', () => {
    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    const { text } = setup([item('a', 'x'), item('a', 'y')]);

    vi.unstubAllGlobals();

    expect(error).toHaveBeenCalledExactlyOnceWith(
      'synstate-dom: For found the key',
      'a',
      'more than once; keys must be unique.',
    );

    assert.strictEqual(text(), '0:x 1:y');
  });

  test('takes a constant', () => {
    const { container } = mountInto(() => (
      <For items={constant(['x', 'y'])} key={(s) => s}>
        {(s$) => <i>{s$}</i>}
      </For>
    ));

    assert.strictEqual(
      container.getHTML().replaceAll('<!---->', ''),
      '<i>x</i><i>y</i>',
    );
  });

  test('writes nothing during propagation', () => {
    const warn = vi.fn();

    vi.stubGlobal('console', { ...console, warn });

    const { setItems } = setup([item('a'), item('b')]);

    setItems([item('b', 'banana'), item('c')]);

    setItems([item('c'), item('a')]);

    vi.unstubAllGlobals();

    expect(warn).not.toHaveBeenCalled();
  });

  test('unmounting removes every row', () => {
    const { container, unmount } = setup([item('a'), item('b')]);

    unmount();

    assert.strictEqual(container.getHTML(), '');
  });
});

describe(Portal, () => {
  test('mounts into the target and leaves with the enclosing branch', () => {
    const target = document.createElement('section');

    const [open$, setOpen] = createState(true);

    const { container } = mountInto(() => (
      <div>
        <If
          cond={open$}
          then={
            <Portal target={target}>
              <b>{constant('modal')}</b>
            </Portal>
          }
        />
      </div>
    ));

    assert.strictEqual(target.getHTML(), '<b>modal</b>');

    assert.strictEqual(container.getHTML(), '<div><!----></div>');

    setOpen(false);

    assert.strictEqual(target.getHTML(), '');
  });
});
