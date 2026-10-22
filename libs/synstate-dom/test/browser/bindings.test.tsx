import { createState, just } from 'synstate';
import { constant, render, view, type JSX } from 'synstate-dom';

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

describe('attributes', () => {
  test('writes constants once and observables on every update', () => {
    const [title$, setTitle] = createState('a');

    const { container } = mountInto(() => (
      <div id={constant('x')} title={title$} tabIndex={constant(2)} />
    ));

    const div = container.querySelector('div');

    assert.strictEqual(div?.getAttribute('id'), 'x');

    assert.strictEqual(div?.getAttribute('title'), 'a');

    assert.strictEqual(div?.getAttribute('tabindex'), '2');

    setTitle('b');

    assert.strictEqual(div?.getAttribute('title'), 'b');
  });

  test('a boolean attribute is removed by false', () => {
    const [disabled$, setDisabled] = createState(true);

    const { container } = mountInto(() => <button disabled={disabled$} />);

    const button = container.querySelector('button');

    assert.strictEqual(button?.getAttribute('disabled'), '');

    setDisabled(false);

    assert.strictEqual(button?.hasAttribute('disabled'), false);
  });

  test('renames the attributes whose property is spelt differently', () => {
    const { container } = mountInto(() => <label htmlFor={constant('name')} />);

    assert.strictEqual(container.getHTML(), '<label for="name"></label>');
  });

  test('takes aria-* and data-* attributes', () => {
    const [expanded$, setExpanded] = createState('false');

    const { container } = mountInto(() => (
      <div aria-expanded={expanded$} data-row={constant('3')} />
    ));

    const div = container.querySelector('div');

    assert.strictEqual(div?.dataset['row'], '3');

    setExpanded('true');

    assert.strictEqual(div?.getAttribute('aria-expanded'), 'true');
  });

  test('accepts a view', () => {
    const [count$, setCount] = createState(0);

    const { container } = mountInto(() => (
      <button disabled={view(count$, (n) => n === 0)} />
    ));

    const button = container.querySelector('button');

    assert.strictEqual(button?.disabled, true);

    setCount(1);

    assert.strictEqual(button?.disabled, false);
  });
});

describe('properties', () => {
  test('value and checked are written as properties', () => {
    const [text$, setText] = createState('a');

    const [checked$, setChecked] = createState(false);

    const { container } = mountInto(() => (
      <>
        <input value={text$} />
        <input type={constant('checkbox')} checked={checked$} />
      </>
    ));

    const [text, checkbox] = container.querySelectorAll('input');

    assert.strictEqual(text?.value, 'a');

    assert.strictEqual(text?.hasAttribute('value'), false);

    setText('b');

    assert.strictEqual(text?.value, 'b');

    setChecked(true);

    assert.strictEqual(checkbox?.checked, true);
  });
});

describe('class', () => {
  test('takes a string', () => {
    const [name$, setName] = createState('a b');

    const { container } = mountInto(() => <p class={name$} />);

    setName('c');

    assert.strictEqual(container.getHTML(), '<p class="c"></p>');
  });

  test('toggles each class of the object form on its own', () => {
    const [active$, setActive] = createState(false);

    const { container } = mountInto(() => (
      <p class={{ item: constant(true), active: active$ }} />
    ));

    const p = container.querySelector('p');

    assert.strictEqual(p?.className, 'item');

    setActive(true);

    assert.strictEqual(p?.className, 'item active');

    setActive(false);

    assert.strictEqual(p?.className, 'item');
  });

  test('reports a class name with whitespace', () => {
    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    const { container } = mountInto(() => (
      <p class={{ 'a b': constant(true), c: constant(true) }} />
    ));

    vi.unstubAllGlobals();

    expect(error).toHaveBeenCalledExactlyOnceWith(
      'synstate-dom: the class name "a b" contains whitespace; give each class its own key.',
    );

    assert.strictEqual(container.querySelector('p')?.className, 'c');
  });
});

describe('style', () => {
  test('takes a cssText string', () => {
    const { container } = mountInto(() => (
      <p style={constant('color: red;')} />
    ));

    assert.strictEqual(container.querySelector('p')?.style.color, 'red');
  });

  test('binds each property of the object form', () => {
    const [color$, setColor] = createState('red');

    const { container } = mountInto(() => (
      <p style={{ color: color$, '--accent': constant('blue') }} />
    ));

    const p = container.querySelector('p');

    assert.strictEqual(p?.style.getPropertyValue('--accent'), 'blue');

    setColor('green');

    assert.strictEqual(p?.style.color, 'green');
  });
});

describe('events', () => {
  test('adds the listener and removes it on unmount', () => {
    const mut_clicks = { current: 0 };

    const { container, unmount } = mountInto(() => (
      <button
        onClick={(event) => {
          mut_clicks.current +=
            event.currentTarget.tagName === 'BUTTON' ? 1 : 0;
        }}
      />
    ));

    const button = container.querySelector('button');

    button?.click();

    assert.strictEqual(mut_clicks.current, 1);

    unmount();

    button?.click();

    assert.strictEqual(mut_clicks.current, 1);
  });

  test('a multi-word event name is lower-cased', () => {
    const mut_seen = { current: false };

    const { container } = mountInto(() => (
      <div
        onPointerDown={() => {
          mut_seen.current = true;
        }}
      />
    ));

    container
      .querySelector('div')
      ?.dispatchEvent(new PointerEvent('pointerdown'));

    assert.isTrue(mut_seen.current);
  });
});

describe('subscriptions', () => {
  test('unmounting releases the bindings', () => {
    const [title$, setTitle] = createState('a');

    const { container, unmount } = mountInto(() => <div title={title$} />);

    const div = container.querySelector('div');

    unmount();

    setTitle('b');

    assert.strictEqual(div?.getAttribute('title'), 'a');
  });

  test('a completed observable is written once', () => {
    const { container } = mountInto(() => <div title={just('x')} />);

    assert.strictEqual(container.querySelector('div')?.title, 'x');
  });
});

describe('svg', () => {
  test('creates SVG elements in the SVG namespace', () => {
    const [r$, setR] = createState(5);

    const { container } = mountInto(() => (
      <svg viewBox={constant('0 0 10 10')}>
        <circle cx={constant(5)} cy={constant(5)} r={r$} />
      </svg>
    ));

    const circle = container.querySelector('circle');

    assert.instanceOf(circle, SVGCircleElement);

    assert.strictEqual(
      container.querySelector('svg')?.getAttribute('viewBox'),
      '0 0 10 10',
    );

    setR(3);

    assert.strictEqual(circle.getAttribute('r'), '3');
  });
});
