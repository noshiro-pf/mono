import { constant, render, type Bindable, type JSX } from 'synstate-dom-next';
import { createState, just, map, source } from 'synstate-next';
import { Obj } from 'ts-data-forge';
import { cdp } from 'vitest/browser';

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

/** Resolves after the next frame's callbacks, when a refused change is undone. */
const nextFrame = async (): Promise<void> => {
  await new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
};

const mountInDocument = (
  app: () => JSX.Element,
): Readonly<{ inputs: readonly HTMLInputElement[]; unmount: () => void }> => {
  const container = document.createElement('div');

  document.body.append(container);

  const unmountApp = render(app, container);

  return {
    inputs: Array.from(container.querySelectorAll('input')),
    unmount: () => {
      unmountApp();

      container.remove();
    },
  };
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

  test('writes defaultMuted, defaultSelected and encoding as the attributes they reflect (#2934)', () => {
    const { container } = mountInto(() => (
      <div>
        <form encoding={constant('multipart/form-data')} />
        <video defaultMuted={constant(true)} />
        <select>
          <option>{constant('a')}</option>
          <option defaultSelected={constant(true)}>{constant('b')}</option>
        </select>
      </div>
    ));

    assert.strictEqual(container.querySelector('video')?.defaultMuted, true);

    assert.strictEqual(container.querySelector('select')?.selectedIndex, 1);

    assert.strictEqual(
      container.querySelector('form')?.enctype,
      'multipart/form-data',
    );
  });

  test('writes autocorrect and async as properties, whose false an absent attribute is not (#3000)', () => {
    const [on$, setOn] = createState(false);

    const { container } = mountInto(() => (
      <div>
        <input autocorrect={on$} />
        <script async={on$} />
      </div>
    ));

    const input = container.querySelector('input');

    const script = container.querySelector('script');

    // Autocorrection is on, and a script made by createElement is async, with
    // no attribute.
    assert.deepStrictEqual([input?.autocorrect, script?.async], [false, false]);

    setOn(true);

    assert.deepStrictEqual([input?.autocorrect, script?.async], [true, true]);

    setOn(false);

    assert.deepStrictEqual([input?.autocorrect, script?.async], [false, false]);
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

  test('writes a boolean on an aria-* attribute as "true" or "false" (#3165)', () => {
    const [busy$, setBusy] = createState<boolean | undefined>(true);

    const { container } = mountInto(() => (
      <section aria-busy={busy$} aria-hidden={constant(false)} />
    ));

    const section = container.querySelector('section');

    assert.isNotNull(section);

    assert.strictEqual(section.getAttribute('aria-busy'), 'true');

    assert.strictEqual(section.getAttribute('aria-hidden'), 'false');

    setBusy(false);

    assert.strictEqual(section.getAttribute('aria-busy'), 'false');

    setBusy(undefined);

    assert.isFalse(section.hasAttribute('aria-busy'));
  });

  test('writes a number on an aria-* attribute', () => {
    const { container } = mountInto(() => (
      <div aria-level={constant(2)} aria-valuenow={constant(0)} />
    ));

    const div = container.querySelector('div');

    assert.strictEqual(div?.getAttribute('aria-level'), '2');

    assert.strictEqual(div?.getAttribute('aria-valuenow'), '0');
  });

  test('writes a boolean on an aria-* attribute of an SVG element too', () => {
    const { container } = mountInto(() => <svg aria-hidden={constant(true)} />);

    assert.strictEqual(
      container.querySelector('svg')?.getAttribute('aria-hidden'),
      'true',
    );
  });

  test('accepts an inline map', () => {
    const [count$, setCount] = createState(0);

    const { container } = mountInto(() => (
      <button disabled={count$.pipe(map((n) => n === 0))} />
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

describe('value is bound after the other props (#3940)', () => {
  // The props are written out of order on purpose: a range or number input fits
  // its value to the `type`, `min`, `max` and `step` it has when the value is
  // written, so `value` has to come last whatever the order.
  test.each([
    ['max', { value: '150', type: 'range', max: '200' }, '150'],
    ['min', { value: '-5', type: 'range', min: '-10' }, '-5'],
    ['step', { value: '0.5', type: 'range', step: '0.5' }, '0.5'],
    ['type', { value: '150', max: '200', type: 'range' }, '150'],
  ] as const)(
    'a range input with value written before %s reads back the bound value',
    (_, props, expected) => {
      const { container } = mountInto(() => (
        <input {...Obj.map(props, constant)} />
      ));

      assert.strictEqual(container.querySelector('input')?.value, expected);
    },
  );

  test('a number input and a select still read back theirs', () => {
    const { container } = mountInto(() => (
      <>
        <input
          {...{
            value: constant('7'),
            type: constant('number'),
            max: constant('9'),
          }}
        />
        <select value={constant('b')}>
          <option value={constant('a')}>{constant('a')}</option>
          <option value={constant('b')}>{constant('b')}</option>
        </select>
      </>
    ));

    assert.strictEqual(container.querySelector('input')?.value, '7');

    assert.strictEqual(container.querySelector('select')?.value, 'b');
  });
});

describe('value fitted to the min, max, step or type of the time (#4123)', () => {
  test('raising max and value in one update draws the new value', () => {
    const [state, setState] = createState({ max: '200', value: '150' });

    // `value` is derived first, so the update writes it before `max`.
    const value = state.pipe(map((s) => s.value));

    const max = state.pipe(map((s) => s.max));

    const { container } = mountInto(() => (
      <input max={max} type={constant('range')} value={value} />
    ));

    const input = container.querySelector('input');

    assert.strictEqual(input?.value, '150');

    setState({ max: '400', value: '350' });

    assert.strictEqual(input?.value, '350');
  });

  test('lowering min and value in one update draws the new value', () => {
    const [state, setState] = createState({ min: '0', value: '10' });

    const value = state.pipe(map((s) => s.value));

    const min = state.pipe(map((s) => s.min));

    const { container } = mountInto(() => (
      <input min={min} type={constant('range')} value={value} />
    ));

    const input = container.querySelector('input');

    setState({ min: '-100', value: '-50' });

    assert.strictEqual(input?.value, '-50');
  });

  test('raising min and max past the value in one update draws the new value', () => {
    const [state, setState] = createState({
      min: '0',
      max: '100',
      value: '50',
    });

    // `value` is derived first, so the update writes it before `min` and `max`,
    // and the browser fits the value again when each of them is written.
    const value = state.pipe(map((s) => s.value));

    const min = state.pipe(map((s) => s.min));

    const max = state.pipe(map((s) => s.max));

    const { container } = mountInto(() => (
      <input max={max} min={min} type={constant('range')} value={value} />
    ));

    const input = container.querySelector('input');

    setState({ min: '200', max: '300', value: '250' });

    assert.strictEqual(input?.value, '250');
  });

  test('a max lowered below the value and raised again draws the bound value again', () => {
    const [max, setMax] = createState('200');

    const { container } = mountInto(() => (
      <input max={max} type={constant('range')} value={constant('150')} />
    ));

    const input = container.querySelector('input');

    setMax('100');

    assert.strictEqual(input?.value, '100');

    setMax('200');

    assert.strictEqual(input?.value, '150');
  });

  test('a range the user moved keeps the user’s value when max changes', () => {
    const [max, setMax] = createState('200');

    const { container } = mountInto(() => (
      <input max={max} type={constant('range')} value={constant('150')} />
    ));

    const mut_input = container.querySelector('input');

    assert.isNotNull(mut_input);

    mut_input.value = '180';

    setMax('400');

    assert.strictEqual(mut_input.value, '180');
  });

  test('a text input whose type becomes file is left empty, and drawn again when it changes back', () => {
    const [type, setType] = createState('text');

    const [value, setValue] = createState('bound');

    const { container } = mountInto(() => <input type={type} value={value} />);

    const input = container.querySelector('input');

    setType('file');

    assert.strictEqual(input?.value, '');

    setValue('changed');

    assert.strictEqual(input?.value, '');

    setType('text');

    assert.strictEqual(input?.value, 'changed');
  });

  test('a value bound to an observable that holds none is not written when the type goes through file', () => {
    const [type, setType] = createState('text');

    // The types admit only an observable that holds a value; a JavaScript
    // caller can still bind one that does not.
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the test binds what the types refuse
    const value = source<string>() as unknown as Bindable<string>;

    const { container } = mountInto(() => (
      <input defaultValue={constant('x')} type={type} value={value} />
    ));

    const input = container.querySelector('input');

    setType('file');

    setType('text');

    assert.strictEqual(input?.value, 'x');
  });

  test('a file input mounted with a value is left empty', () => {
    const { container } = mountInto(() => (
      <input type={constant('file')} value={constant('bound')} />
    ));

    assert.strictEqual(container.querySelector('input')?.value, '');
  });

  test('a bound empty value clears the file chosen in a file input', () => {
    const [value, setValue] = createState('bound');

    const { container } = mountInto(() => (
      <input type={constant('file')} value={value} />
    ));

    const mut_input = container.querySelector('input');

    assert.isNotNull(mut_input);

    const transfer = new DataTransfer();

    transfer.items.add(new File(['x'], 'chosen.txt'));

    mut_input.files = transfer.files;

    assert.strictEqual(mut_input.files.length, 1);

    setValue('');

    assert.strictEqual(mut_input.files.length, 0);
  });

  test('a draft typed before the type becomes file and back gives way to the bound value', () => {
    const [type, setType] = createState('text');

    const { container } = mountInto(() => (
      <input type={type} value={constant('bound')} />
    ));

    const mut_input = container.querySelector('input');

    assert.isNotNull(mut_input);

    mut_input.value = 'draft';

    setType('file');

    setType('text');

    assert.strictEqual(mut_input.value, 'bound');
  });

  test('a draft the new type drops gives way to the bound value', () => {
    const [type, setType] = createState('text');

    const { container } = mountInto(() => (
      <input type={type} value={constant('5')} />
    ));

    const mut_input = container.querySelector('input');

    assert.isNotNull(mut_input);

    mut_input.value = 'abc';

    setType('number');

    assert.strictEqual(mut_input.value, '5');
  });

  test('a text input keeps the draft typed into it when its type changes', () => {
    const [type, setType] = createState('text');

    const { container } = mountInto(() => (
      <input type={type} value={constant('bound')} />
    ));

    const mut_input = container.querySelector('input');

    assert.isNotNull(mut_input);

    mut_input.value = 'draft';

    setType('search');

    assert.strictEqual(mut_input.value, 'draft');
  });
});

describe('controlled checked', () => {
  test('a checkbox whose change is refused is drawn as its bound value again', async () => {
    const mut_seen: boolean[] = [];

    const { inputs, unmount } = mountInDocument(() => (
      <input
        checked={constant(false)}
        type={constant('checkbox')}
        onChange={(event) => {
          mut_seen.push(event.currentTarget.checked);
        }}
      />
    ));

    const [checkbox] = inputs;

    assert.isDefined(checkbox);

    checkbox.click();

    // The handler sees the user's change, which is undone only after it.
    assert.deepStrictEqual(mut_seen, [true]);

    await nextFrame();

    assert.isFalse(checkbox.checked);

    unmount();
  });

  test('a checkbox whose change is taken keeps it', async () => {
    const [checked$, setChecked] = createState(false);

    const { inputs, unmount } = mountInDocument(() => (
      <input
        checked={checked$}
        type={constant('checkbox')}
        onChange={(event) => {
          setChecked(event.currentTarget.checked);
        }}
      />
    ));

    const [checkbox] = inputs;

    assert.isDefined(checkbox);

    checkbox.click();

    await nextFrame();

    assert.isTrue(checkbox.checked);

    assert.isTrue(checked$.value);

    unmount();
  });

  test("a delegated handler on an ancestor also sees the user's change", async () => {
    const mut_seen: boolean[] = [];

    const { inputs, unmount } = mountInDocument(() => (
      <div
        onChange={(event) => {
          if (event.target instanceof HTMLInputElement) {
            mut_seen.push(event.target.checked);
          }
        }}
      >
        <input checked={constant(false)} type={constant('checkbox')} />
      </div>
    ));

    const [checkbox] = inputs;

    assert.isDefined(checkbox);

    checkbox.click();

    assert.deepStrictEqual(mut_seen, [true]);

    await nextFrame();

    assert.isFalse(checkbox.checked);

    unmount();
  });

  test('a handler that stops the event does not keep the refused change', async () => {
    const { inputs, unmount } = mountInDocument(() => (
      <input
        type={constant('checkbox')}
        onChange={(event) => {
          event.stopImmediatePropagation();
        }}
        checked={constant(false)}
      />
    ));

    const [checkbox] = inputs;

    assert.isDefined(checkbox);

    checkbox.click();

    await nextFrame();

    assert.isFalse(checkbox.checked);

    unmount();
  });

  test('a bound indeterminate is drawn again after a refused change', async () => {
    const { inputs, unmount } = mountInDocument(() => (
      <input
        checked={constant(false)}
        indeterminate={constant(true)}
        type={constant('checkbox')}
      />
    ));

    const [checkbox] = inputs;

    assert.isDefined(checkbox);

    checkbox.click();

    await nextFrame();

    assert.isFalse(checkbox.checked);

    assert.isTrue(checkbox.indeterminate);

    unmount();
  });

  test('a bound indeterminate is drawn again with checked left to the user', async () => {
    const { inputs, unmount } = mountInDocument(() => (
      <input
        defaultChecked={constant(false)}
        indeterminate={constant(true)}
        type={constant('checkbox')}
      />
    ));

    const [checkbox] = inputs;

    assert.isDefined(checkbox);

    checkbox.click();

    await nextFrame();

    assert.isTrue(checkbox.checked);

    assert.isTrue(checkbox.indeterminate);

    unmount();
  });

  test('a radio button whose choice is refused checks the bound one of its group again', async () => {
    const { inputs, unmount } = mountInDocument(() => (
      <>
        <input
          checked={constant(true)}
          name={constant('controlled "refused"')}
          type={constant('radio')}
        />
        <input
          checked={constant(false)}
          name={constant('controlled "refused"')}
          type={constant('radio')}
        />
      </>
    ));

    const [first, second] = inputs;

    assert.isDefined(first);

    assert.isDefined(second);

    second.click();

    await nextFrame();

    assert.isTrue(first.checked);

    assert.isFalse(second.checked);

    unmount();
  });

  test('a radio button whose choice is taken moves the group to it', async () => {
    const [choice$, setChoice] = createState<'a' | 'b'>('a');

    const { inputs, unmount } = mountInDocument(() => (
      <>
        {(['a', 'b'] as const).map((choice) => (
          <input
            checked={choice$.pipe(map((c) => c === choice))}
            name={constant('controlled-taken')}
            type={constant('radio')}
            onChange={() => {
              setChoice(choice);
            }}
          />
        ))}
      </>
    ));

    const [first, second] = inputs;

    assert.isDefined(first);

    assert.isDefined(second);

    second.click();

    await nextFrame();

    assert.isFalse(first.checked);

    assert.isTrue(second.checked);

    unmount();
  });
});

/** Picks `value` on `select` as a user would: the value, then `change`. */
const choose = (mut_select: HTMLSelectElement, value: string): void => {
  mut_select.value = value;

  mut_select.dispatchEvent(new Event('change', { bubbles: true }));
};

const selectOptions = (): JSX.Element => (
  <>
    <option value={constant('a')}>{constant('A')}</option>
    <option value={constant('b')}>{constant('B')}</option>
  </>
);

const mountSelect = (
  app: () => JSX.Element,
): Readonly<{ select: HTMLSelectElement; unmount: () => void }> => {
  const container = document.createElement('div');

  document.body.append(container);

  const unmountApp = render(app, container);

  const select = container.querySelector('select');

  assert.isNotNull(select);

  return {
    select,
    unmount: () => {
      unmountApp();

      container.remove();
    },
  };
};

describe('controlled select value (#3411)', () => {
  test('a refused choice is drawn as the bound value again', async () => {
    const mut_seen: string[] = [];

    const { select, unmount } = mountSelect(() => (
      <select
        value={constant('a')}
        onChange={(event) => {
          mut_seen.push(event.currentTarget.value);
        }}
      >
        {selectOptions()}
      </select>
    ));

    choose(select, 'b');

    // The handler sees the user's choice, which is undone only after it.
    assert.deepStrictEqual(mut_seen, ['b']);

    await nextFrame();

    assert.strictEqual(select.value, 'a');

    unmount();
  });

  test('a taken choice stays', async () => {
    const [value$, setValue] = createState('a');

    const { select, unmount } = mountSelect(() => (
      <select
        value={value$}
        onChange={(event) => {
          setValue(event.currentTarget.value);
        }}
      >
        {selectOptions()}
      </select>
    ));

    choose(select, 'b');

    await nextFrame();

    assert.strictEqual(select.value, 'b');

    unmount();
  });

  test('a handler that stops the event does not keep the refused choice', async () => {
    const { select, unmount } = mountSelect(() => (
      <select
        value={constant('a')}
        onChange={(event) => {
          event.stopImmediatePropagation();
        }}
      >
        {selectOptions()}
      </select>
    ));

    choose(select, 'b');

    await nextFrame();

    assert.strictEqual(select.value, 'a');

    unmount();
  });

  test('a multiple select stays one way, keeping the choices the user made', async () => {
    const { select, unmount } = mountSelect(() => (
      <select multiple={constant(true)} value={constant('a')}>
        {selectOptions()}
      </select>
    ));

    const [mut_a, mut_b] = Array.from(select.options);

    assert.isDefined(mut_a);

    assert.isDefined(mut_b);

    // The user moves the choice from a to b, which changes `value`.
    mut_a.selected = false;

    mut_b.selected = true;

    select.dispatchEvent(new Event('change', { bubbles: true }));

    await nextFrame();

    assert.isFalse(mut_a.selected);

    assert.isTrue(mut_b.selected);

    unmount();
  });

  test('a text input and a textarea stay one way', async () => {
    const container = document.createElement('div');

    document.body.append(container);

    const unmount = render(
      () => (
        <>
          <input value={constant('bound')} />
          <textarea value={constant('bound')} />
        </>
      ),
      container,
    );

    const mut_input = container.querySelector('input');

    const mut_textarea = container.querySelector('textarea');

    assert.isNotNull(mut_input);

    assert.isNotNull(mut_textarea);

    mut_input.value = 'typed';

    mut_input.dispatchEvent(new Event('change', { bubbles: true }));

    mut_textarea.value = 'typed';

    mut_textarea.dispatchEvent(new Event('change', { bubbles: true }));

    await nextFrame();

    assert.strictEqual(mut_input.value, 'typed');

    assert.strictEqual(mut_textarea.value, 'typed');

    unmount();

    container.remove();
  });
});

/** Composes `か`, `かん` and `漢` through CDP, then commits `漢`. */
const composeKan = async (between: () => void): Promise<void> => {
  for (const text of ['か', 'かん', '漢']) {
    // eslint-disable-next-line no-await-in-loop -- each composition step reaches the input before the next
    await cdp().send('Input.imeSetComposition', {
      text,
      selectionStart: text.length,
      selectionEnd: text.length,
    });

    between();
  }

  await cdp().send('Input.insertText', { text: '漢' });
};

/** The number of compositions started on `input` so far. */
const countCompositions = (input: HTMLInputElement): (() => number) => {
  const mut_count = { current: 0 };

  input.addEventListener('compositionstart', () => {
    mut_count.current += 1;
  });

  return () => mut_count.current;
};

describe('a one-way value during an IME composition (SPEC.md 7.3)', () => {
  test('a draft written back on every input keeps the composition', async () => {
    const [draft$, setDraft] = createState('');

    const { inputs, unmount } = mountInDocument(() => (
      <input
        value={draft$}
        onInput={(event) => {
          setDraft(event.currentTarget.value);
        }}
      />
    ));

    const input = inputs[0];

    assert.isDefined(input);

    const compositions = countCompositions(input);

    input.focus();

    await composeKan(() => {});

    assert.strictEqual(compositions(), 1);

    assert.strictEqual(input.value, '漢');

    assert.strictEqual(draft$.value, '漢');

    unmount();
  });

  test('a different value written mid-composition restarts it', async () => {
    const [draft$, setDraft] = createState('');

    const { inputs, unmount } = mountInDocument(() => (
      <input
        value={draft$}
        onInput={(event) => {
          setDraft(event.currentTarget.value);
        }}
      />
    ));

    const input = inputs[0];

    assert.isDefined(input);

    const compositions = countCompositions(input);

    input.focus();

    const mut_written = { current: false };

    await composeKan(() => {
      if (mut_written.current) {
        return;
      }

      mut_written.current = true;

      setDraft('x');
    });

    assert.strictEqual(compositions(), 2);

    assert.notStrictEqual(input.value, '漢');

    unmount();
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
      'synstate-dom-next: the class name "a b" contains whitespace; give each class its own key.',
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
  // synstate-dom removes the listener on unmount; synstate-dom-next leaves it
  // on the element, which goes with its owner.
  test('adds the listener, which goes with the element on unmount', () => {
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

    assert.strictEqual(container.querySelector('button'), null);
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

describe('removing attributes', () => {
  test('undefined removes an attribute', () => {
    const [label$, setLabel] = createState<string | undefined>('a');

    const { container } = mountInto(() => <div aria-label={label$} />);

    const div = container.querySelector('div');

    assert.strictEqual(div?.getAttribute('aria-label'), 'a');

    setLabel(undefined);

    assert.strictEqual(div?.hasAttribute('aria-label'), false);
  });

  test('a select takes the value of one of its options', () => {
    const [value$, setValue] = createState('b');

    const { container } = mountInto(() => (
      <select value={value$}>
        <option value={constant('a')}>{constant('A')}</option>
        <option value={constant('b')}>{constant('B')}</option>
      </select>
    ));

    const select = container.querySelector('select');

    assert.strictEqual(select?.value, 'b');

    setValue('a');

    assert.strictEqual(select?.value, 'a');
  });
});

describe('a mapped binding', () => {
  test('writes a result again only when it is not Object.is the last one written', () => {
    const [count$, setCount] = createState(0);

    const { container } = mountInto(() => (
      <p title={count$.pipe(map((n) => (n % 2 === 0 ? 'even' : 'odd')))}>
        {count$.pipe(map((n) => (n < 10 ? 'small' : 'large')))}
      </p>
    ));

    const p = container.querySelector('p');

    assert.isNotNull(p);

    const observer = new MutationObserver(() => {});

    observer.observe(p, {
      attributes: true,
      characterData: true,
      subtree: true,
    });

    setCount(2);

    assert.deepStrictEqual(observer.takeRecords(), []);

    setCount(3);

    assert.deepStrictEqual(
      observer.takeRecords().map((r) => r.type),
      ['attributes'],
    );

    setCount(13);

    assert.deepStrictEqual(
      observer.takeRecords().map((r) => r.type),
      ['characterData'],
    );

    observer.disconnect();

    assert.strictEqual(p.getAttribute('title'), 'odd');

    assert.strictEqual(p.textContent, 'large');
  });
});
