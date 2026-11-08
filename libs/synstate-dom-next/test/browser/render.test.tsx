import { constant, If, render, type JSX } from 'synstate-dom-next';
import { map, onCleanup, state } from 'synstate-next';

const mount = (
  app: () => JSX.Element,
): Readonly<{ container: HTMLDivElement; unmount: () => void }> => {
  const container = document.createElement('div');

  document.body.append(container);

  const unmount = render(app, container);

  return { container, unmount };
};

const Greeting = ({
  name,
}: Readonly<{ name: JSX.Element | string }>): JSX.Element => (
  <>
    <b>{constant('hi')}</b>
    {typeof name === 'string' ? <i>{constant(name)}</i> : name}
  </>
);

describe(render, () => {
  test('constant text and attributes are written once', () => {
    const { container } = mount(() => (
      <p id={constant('greeting')} title={constant('hello')}>
        {constant('hello, ')}
        {constant(42)}
      </p>
    ));

    assert.strictEqual(
      container.getHTML(),
      '<p id="greeting" title="hello">hello, 42</p>',
    );
  });

  test('an observable child is a text node that follows it', () => {
    const count = state(1);

    const { container } = mount(() => <p>{count}</p>);

    count.set(2);

    assert.strictEqual(container.getHTML(), '<p>2</p>');
  });

  test('attributes, properties, classes and styles follow their observables', () => {
    const disabled = state(false);

    const value = state('a');

    const active = state(true);

    const color = state<string | undefined>('red');

    const label = state<string | undefined>('first');

    const { container } = mount(() => (
      <input
        aria-label={label}
        class={{ active, fixed: constant(true) }}
        disabled={disabled}
        style={{ color }}
        value={value}
      />
    ));

    const input = container.querySelector('input');

    assert.isNotNull(input);

    assert.isFalse(input.disabled);

    assert.strictEqual(input.value, 'a');

    assert.strictEqual(input.className, 'active fixed');

    assert.strictEqual(input.style.color, 'red');

    disabled.set(true);

    value.set('b');

    active.set(false);

    color.set(undefined);

    label.set(undefined);

    assert.isTrue(input.disabled);

    assert.strictEqual(input.value, 'b');

    assert.strictEqual(input.className, 'fixed');

    assert.strictEqual(input.style.color, '');

    assert.isFalse(input.hasAttribute('aria-label'));
  });

  test('a boolean aria attribute is written as "true" or "false"', () => {
    const expanded = state(false);

    const { container } = mount(() => <div aria-expanded={expanded} />);

    assert.strictEqual(
      container.getHTML(),
      '<div aria-expanded="false"></div>',
    );

    expanded.set(true);

    assert.strictEqual(container.getHTML(), '<div aria-expanded="true"></div>');
  });

  test('event handlers, including those with no on… property', () => {
    const mut_seen: string[] = [];

    const { container } = mount(() => (
      <button
        onClick={() => {
          mut_seen.push('click');
        }}
        onFocusIn={() => {
          mut_seen.push('focusin');
        }}
      />
    ));

    const button = container.querySelector('button');

    button?.click();

    button?.dispatchEvent(new FocusEvent('focusin'));

    assert.deepStrictEqual(mut_seen, ['click', 'focusin']);
  });

  test('ref is called before the children are mounted', () => {
    const mut_seen: number[] = [];

    mount(() => (
      <div
        ref={(element) => {
          mut_seen.push(element.childNodes.length);
        }}
      >
        <span />
      </div>
    ));

    assert.deepStrictEqual(mut_seen, [0]);
  });

  test('ref runs in the owner the element mounts in', () => {
    const show = state(true);

    const mut_cleaned: string[] = [];

    const { unmount } = mount(() => (
      <If
        cond={show}
        then={
          <p
            ref={() => {
              onCleanup(() => {
                mut_cleaned.push('branch');
              });
            }}
          />
        }
      />
    ));

    assert.deepStrictEqual(mut_cleaned, []);

    // Closing the branch disposes its owner, which the ref's cleanup was in.
    show.set(false);

    assert.deepStrictEqual(mut_cleaned, ['branch']);

    unmount();

    assert.deepStrictEqual(mut_cleaned, ['branch']);
  });

  test('components and fragments', () => {
    const { container } = mount(() => <Greeting name="you" />);

    assert.strictEqual(container.getHTML(), '<b>hi</b><i>you</i>');
  });

  test('a write made while mounting propagates once the nodes are in the container', () => {
    const count = state(0);

    const mut_parents: (Node | null)[] = [];

    const { container } = mount(() => (
      <p
        ref={(element) => {
          count.subscribe(() => {
            mut_parents.push(element.parentNode);
          });

          count.set(1);
        }}
      >
        {count}
      </p>
    ));

    assert.strictEqual(container.getHTML(), '<p>1</p>');

    // The subscriber ran once when subscribed, and once after the batch, when
    // the paragraph was in the container.
    assert.deepStrictEqual(mut_parents, [null, container]);
  });

  test('unmounting removes what an If at the top inserted after mounting', () => {
    const cond = state(true);

    const { container, unmount } = mount(() => (
      <If cond={cond} then={<p />} else={<i />} />
    ));

    cond.set(false);

    unmount();

    assert.strictEqual(container.childNodes.length, 0);
  });

  test('a key on an element is not written as an attribute', () => {
    const props = { key: 'k', title: constant('t') } as const;

    const { container } = mount(() => (
      <>
        {/* @ts-expect-error `key` is not a prop of an element */}
        <p key="k" />
        <p {...props} />
      </>
    ));

    assert.strictEqual(container.getHTML(), '<p></p><p title="t"></p>');
  });

  test("a select's value is set once its options are there", () => {
    const { container } = mount(() => (
      <select value={constant('b')}>
        <option value={constant('a')} />
        <option value={constant('b')} />
      </select>
    ));

    assert.strictEqual(container.querySelector('select')?.value, 'b');
  });

  test('unmounting removes the nodes and disposes what the app made', () => {
    const count = state(0);

    const mut_seen: number[] = [];

    const { container, unmount } = mount(() => {
      const doubled = count.pipe(map((x) => x * 2));

      doubled.subscribe((x) => {
        mut_seen.push(x);
      });

      return <p>{doubled}</p>;
    });

    unmount();

    assert.strictEqual(container.getHTML(), '');

    count.set(1);

    assert.deepStrictEqual(mut_seen, [0]);
  });
});
