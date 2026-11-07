import {
  constant,
  For,
  If,
  render,
  selector,
  type JSX,
} from 'synstate-dom-next';
import { map, onCleanup, state } from 'synstate-next';

const mount = (app: () => JSX.Element): HTMLDivElement => {
  const container = document.createElement('div');

  render(app, container);

  return container;
};

describe(If, () => {
  test('mounts the branch the condition picks, and disposes the other', () => {
    const cond = state(true);

    const mut_cleaned: string[] = [];

    const Branch = ({ name }: Readonly<{ name: string }>): JSX.Element => {
      onCleanup(() => {
        mut_cleaned.push(name);
      });

      return <b>{constant(name)}</b>;
    };

    const container = mount(() => (
      <div>
        <If
          cond={cond}
          else={<Branch name="no" />}
          then={<Branch name="yes" />}
        />
        <hr />
      </div>
    ));

    const text = (): string => container.textContent;

    assert.strictEqual(text(), 'yes');

    cond.set(false);

    assert.strictEqual(text(), 'no');

    assert.deepStrictEqual(mut_cleaned, ['yes']);

    cond.set(true);

    assert.strictEqual(text(), 'yes');

    assert.deepStrictEqual(mut_cleaned, ['yes', 'no']);

    // The branch stays before the following sibling.
    assert.strictEqual(
      container.querySelector('div')?.lastElementChild?.tagName,
      'HR',
    );
  });

  test('a constant condition mounts one branch once', () => {
    const container = mount(() => (
      <If cond={constant(false)} then={<b />} else={<i />} />
    ));

    assert.strictEqual(container.getHTML(), '<i></i>');
  });

  test('no else: nothing while the condition is false', () => {
    const cond = state(false);

    const container = mount(() => <If cond={cond} then={<b />} />);

    assert.strictEqual(container.querySelectorAll('b').length, 0);

    cond.set(true);

    assert.strictEqual(container.querySelectorAll('b').length, 1);
  });
});

describe(selector, () => {
  test('only the rows of the old and the new key are written', () => {
    const selected = state(1);

    const isSelected = selector(selected);

    const mut_writes: number[] = [];

    const container = mount(() => (
      <ul>
        <For
          items={constant([1, 2, 3, 4])}
          key={(id) => id}
          children={(item) => {
            const id = item.value;

            const on = isSelected.is(id);

            on.subscribe(() => {
              mut_writes.push(id);
            });

            return <li class={{ on }} />;
          }}
        />
      </ul>
    ));

    const before = mut_writes.length;

    selected.set(3);

    assert.deepStrictEqual(
      mut_writes.slice(before).toSorted((a, b) => a - b),
      [1, 3],
    );

    assert.deepStrictEqual(
      Array.from(container.querySelectorAll('li'), (li) => li.className),
      ['', '', 'on', ''],
    );
  });

  test('an `is` made after a change starts from the current key', () => {
    const selected = state('a');

    const isSelected = selector(selected);

    selected.set('b');

    assert.isTrue(isSelected.is('b').value);

    assert.isFalse(isSelected.is('a').value);
  });
});

describe('a map in a row', () => {
  test('reads the new item after the update', () => {
    const items = state<readonly Readonly<{ id: number; n: number }>[]>([
      { id: 1, n: 1 },
    ]);

    const container = mount(() => (
      <For
        items={items}
        key={(x) => x.id}
        children={(item) => <p>{item.pipe(map((x) => x.n * 10))}</p>}
      />
    ));

    items.set([{ id: 1, n: 2 }]);

    assert.strictEqual(container.textContent, '20');
  });
});
