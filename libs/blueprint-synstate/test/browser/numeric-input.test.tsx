import { NumericInput, NumericInputView } from 'blueprint-synstate';
import { createState } from 'synstate';
import { constant } from 'synstate-dom';
import { all, mountInto, one, press, settle, type } from './helpers.mjs';

describe(NumericInputView, () => {
  test('draws Blueprint’s markup and hands every keystroke on as text, holding none', () => {
    const mut_texts: string[] = [];

    const mut_steps: string[] = [];

    const { container, unmount } = mountInto(() => (
      <NumericInputView
        data-e2e={constant('amount')}
        fill
        inputClass={'right'}
        value={constant('12')}
        onDecrementMouseDown={() => {
          mut_steps.push('down');
        }}
        onIncrementMouseDown={() => {
          mut_steps.push('up');
        }}
        onValueChange={(text) => {
          mut_texts.push(text);
        }}
      />
    ));

    const group = one(container, '.bp6-control-group.bp6-numeric-input');

    assert.isTrue(group.classList.contains('bp6-fill'));

    const input = one<HTMLInputElement>(group, '.bp6-input-group > input');

    assert.strictEqual(input.className, 'bp6-input right');

    assert.strictEqual(input.dataset['e2e'], 'amount');

    type(input, '-');

    type(input, '-1.');

    assert.deepStrictEqual(mut_texts, ['-', '-1.']);

    const buttons = all<HTMLButtonElement>(
      group,
      '.bp6-button-group.bp6-vertical.bp6-fixed > button',
    );

    assert.deepStrictEqual(
      buttons.map((b) => b.getAttribute('aria-label')),
      ['increment', 'decrement'],
    );

    for (const button of buttons) {
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }

    assert.deepStrictEqual(mut_steps, ['up', 'down']);

    unmount();
  });
});

describe(NumericInput, () => {
  test('keeps half-typed text as it is until blur, then commits it normalized', () => {
    const { input, changes, unmount } = setUp(3);

    assert.strictEqual(input.value, '3');

    type(input, '-');

    assert.strictEqual(input.value, '-');

    type(input, '12.345');

    assert.deepStrictEqual(changes, []);

    input.dispatchEvent(new FocusEvent('blur'));

    assert.strictEqual(input.value, '12.35');

    assert.deepStrictEqual(changes, [12.35]);

    unmount();
  });

  test('reads out the number the text shows, as it is typed', () => {
    const { input, unmount } = setUp(3);

    assert.strictEqual(input.getAttribute('aria-valuenow'), '3');

    type(input, '-');

    assert.isFalse(input.hasAttribute('aria-valuenow'));

    type(input, '7');

    assert.strictEqual(input.getAttribute('aria-valuenow'), '7');

    // A number, but none a spin button can read out.
    type(input, 'Infinity');

    assert.isFalse(input.hasAttribute('aria-valuenow'));

    unmount();
  });

  test('rewrites the text, and tells no one, when it stands for the value already', () => {
    const { input, changes, unmount } = setUp(3);

    type(input, '3.00');

    assert.isTrue(press(input, 'Enter'));

    assert.strictEqual(input.value, '3');

    assert.deepStrictEqual(changes, []);

    type(input, 'abc');

    press(input, 'Enter');

    assert.strictEqual(input.value, '0');

    assert.deepStrictEqual(changes, [0]);

    unmount();
  });

  test('follows a value changed from outside', async () => {
    const { input, setValue, unmount } = setUp(3);

    setValue(42);

    await settle();

    assert.strictEqual(input.value, '42');

    unmount();
  });

  test('the arrow keys and the buttons step, and repeat while held', () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'],
    });

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const { input, up, changes, unmount } = setUp(3);

    assert.isFalse(press(input, 'ArrowUp', { code: 'ArrowUp' }));

    assert.isFalse(press(input, 'ArrowUp', { code: 'ArrowUp', repeat: true }));

    assert.deepStrictEqual(changes, [3.5]);

    // The delay, then two repeats.
    vi.advanceTimersToNextTimer();

    vi.advanceTimersToNextTimer();

    vi.advanceTimersToNextTimer();

    assert.deepStrictEqual(changes, [3.5, 4, 4.5]);

    document.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'ArrowUp', code: 'ArrowUp' }),
    );

    assert.strictEqual(vi.getTimerCount(), 0);

    up.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    document.dispatchEvent(new MouseEvent('mouseup'));

    assert.strictEqual(vi.getTimerCount(), 0);

    assert.deepStrictEqual(changes, [3.5, 4, 4.5, 5]);

    assert.strictEqual(input.value, '5');

    unmount();
  });

  test('repeats only for the main mouse button, and only the held key’s release stops a key', () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'],
    });

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const { input, up, changes, unmount } = setUp(3);

    up.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 2 }));

    up.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, ctrlKey: true }),
    );

    assert.deepStrictEqual(changes, []);

    assert.strictEqual(vi.getTimerCount(), 0);

    press(input, 'ArrowDown', { code: 'ArrowDown' });

    document.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'Shift', code: 'ShiftLeft' }),
    );

    document.dispatchEvent(new MouseEvent('mouseup'));

    assert.strictEqual(vi.getTimerCount(), 1);

    input.dispatchEvent(new FocusEvent('blur'));

    assert.strictEqual(vi.getTimerCount(), 0);

    assert.deepStrictEqual(changes, [2.5]);

    unmount();
  });

  test('the window’s blur stops a repeat', () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'],
    });

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const { up, unmount } = setUp(3);

    up.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    globalThis.dispatchEvent(new FocusEvent('blur'));

    assert.strictEqual(vi.getTimerCount(), 0);

    unmount();
  });

  test('Enter or Space on a button steps once, and a mouse click adds nothing to its press', () => {
    const { up, down, changes, unmount } = setUp(3);

    // A click from the keyboard has a `detail` of 0.
    down.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));

    assert.deepStrictEqual(changes, [2.5]);

    up.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    document.dispatchEvent(new MouseEvent('mouseup'));

    up.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));

    assert.deepStrictEqual(changes, [2.5, 3]);

    unmount();
  });

  test('an activation by assistive technology, press and click together, steps once', () => {
    const { up, changes, unmount } = setUp(3);

    up.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    document.dispatchEvent(new MouseEvent('mouseup'));

    up.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));

    assert.deepStrictEqual(changes, [3.5]);

    unmount();
  });

  test('a Ctrl+click, which does not start a repeat, steps once by its click', () => {
    const { up, changes, unmount } = setUp(3);

    up.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, ctrlKey: true }),
    );

    up.dispatchEvent(
      new MouseEvent('click', { bubbles: true, ctrlKey: true, detail: 1 }),
    );

    assert.deepStrictEqual(changes, [3.5]);

    unmount();
  });

  test('a held key is released by its code, whatever its key reads then', () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'],
    });

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const { input, unmount } = setUp(3);

    press(input, 'ArrowUp', { code: 'Numpad8' });

    document.dispatchEvent(
      new KeyboardEvent('keyup', { key: '8', code: 'Numpad8' }),
    );

    assert.strictEqual(vi.getTimerCount(), 0);

    unmount();
  });

  test('being disabled stops a repeat', () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'],
    });

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const [disabled$, setDisabled] = createState(false);

    const { container, unmount } = mountInto(() => (
      <NumericInput
        decode={Number.parseFloat}
        disabled={disabled$}
        encode={(n) => n.toString()}
        normalize={clampAndRound}
        value={constant(3)}
        onValueChange={() => {}}
      />
    ));

    const [up] = all<HTMLButtonElement>(container, 'button');

    up?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    assert.strictEqual(vi.getTimerCount(), 1);

    setDisabled(true);

    assert.strictEqual(vi.getTimerCount(), 0);

    unmount();
  });

  test('keys that an input method is composing with step and commit nothing', () => {
    const { input, changes, unmount } = setUp(3);

    type(input, '12');

    assert.isTrue(press(input, 'Enter', { isComposing: true }));

    assert.isTrue(press(input, 'ArrowDown', { isComposing: true }));

    // Safari's Enter that confirms a composition, after it has ended.
    press(input, 'Enter', { keyCode: 229 });

    assert.strictEqual(input.value, '12');

    assert.deepStrictEqual(changes, []);

    unmount();
  });

  test('an arrow key with the key code of an input method steps, as Android’s virtual keyboard sends every key', () => {
    const { input, changes, unmount } = setUp(3);

    assert.isFalse(press(input, 'ArrowUp', { code: 'ArrowUp', keyCode: 229 }));

    document.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'ArrowUp', code: 'ArrowUp' }),
    );

    assert.deepStrictEqual(changes, [3.5]);

    unmount();
  });

  test('a repeat stops at a bound', () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'],
    });

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const { up, changes, unmount } = setUp(99);

    up.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    vi.advanceTimersToNextTimer();

    vi.advanceTimersToNextTimer();

    vi.advanceTimersToNextTimer();

    assert.deepStrictEqual(changes, [99.5, 100]);

    assert.strictEqual(vi.getTimerCount(), 0);

    up.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    assert.strictEqual(vi.getTimerCount(), 0);

    unmount();
  });

  test('keeps text typed as soon as it is mounted', async () => {
    const { input, unmount } = setUp(3);

    type(input, '4');

    await settle();

    assert.strictEqual(input.value, '4');

    unmount();
  });

  test('a press released off the button leaves the next keyboard click its step', async () => {
    const { down, up, changes, unmount } = setUp(3);

    up.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    // Released elsewhere: no click follows.
    document.dispatchEvent(new MouseEvent('mouseup'));

    await new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });

    down.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));

    assert.deepStrictEqual(changes, [3.5, 3]);

    unmount();
  });

  test('a press the window’s blur took the release from leaves the next keyboard click its step', async () => {
    const { up, changes, unmount } = setUp(3);

    up.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    globalThis.dispatchEvent(new FocusEvent('blur'));

    await new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });

    up.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));

    assert.deepStrictEqual(changes, [3.5, 4]);

    unmount();
  });

  test('the step buttons take the intent, as Blueprint’s', () => {
    const { container, unmount } = mountInto(() => (
      <NumericInputView
        intent={'danger'}
        value={constant('1')}
        onValueChange={() => {}}
      />
    ));

    assert.deepStrictEqual(
      all(container, 'button').map((b) => b.className),
      ['bp6-button bp6-intent-danger', 'bp6-button bp6-intent-danger'],
    );

    unmount();
  });

  test('a step from text that is no number starts from normalize(NaN)', () => {
    const { input, changes, unmount } = setUp(3);

    type(input, '');

    press(input, 'ArrowUp', { code: 'ArrowUp' });

    document.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'ArrowUp', code: 'ArrowUp' }),
    );

    assert.strictEqual(input.value, '0.5');

    assert.deepStrictEqual(changes, [0.5]);

    unmount();
  });

  test('a held button keeps repeating when it takes the focus from the input', () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'],
    });

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const { input, up, changes, unmount } = setUp(3);

    // The browser's order: the press, then the blur it causes.
    up.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    input.dispatchEvent(new FocusEvent('blur'));

    vi.advanceTimersToNextTimer();

    vi.advanceTimersToNextTimer();

    assert.deepStrictEqual(changes, [3.5, 4]);

    document.dispatchEvent(new MouseEvent('mouseup'));

    assert.strictEqual(vi.getTimerCount(), 0);

    unmount();
  });

  test('Cmd or Ctrl with an arrow key moves the caret and steps nothing', () => {
    const { input, changes, unmount } = setUp(3);

    assert.isTrue(press(input, 'ArrowUp', { metaKey: true }));

    assert.isTrue(press(input, 'ArrowDown', { ctrlKey: true }));

    assert.deepStrictEqual(changes, []);

    unmount();
  });

  test('releasing Meta stops a held arrow key, whose own release macOS does not send', () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'],
    });

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const { input, unmount } = setUp(3);

    press(input, 'ArrowUp', { code: 'ArrowUp' });

    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Meta' }));

    assert.strictEqual(vi.getTimerCount(), 0);

    unmount();
  });

  test('stops repeating when it is unmounted', () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'],
    });

    onTestFinished(() => {
      vi.useRealTimers();
    });

    const { up, unmount } = setUp(3);

    up.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    assert.strictEqual(vi.getTimerCount(), 1);

    unmount();

    assert.strictEqual(vi.getTimerCount(), 0);
  });
});

const clampAndRound = (n: number): number =>
  Number.isFinite(n)
    ? Math.min(100, Math.max(0, Math.round(n * 100) / 100))
    : 0;

const setUp = (
  initial: number,
): Readonly<{
  input: HTMLInputElement;
  up: HTMLButtonElement;
  down: HTMLButtonElement;
  changes: readonly number[];
  setValue: (value: number) => void;
  unmount: () => void;
}> => {
  const [value$, setValue] = createState(initial);

  const mut_changes: number[] = [];

  const { container, unmount } = mountInto(() => (
    <NumericInput
      decode={Number.parseFloat}
      encode={(n) => n.toString()}
      normalize={clampAndRound}
      step={0.5}
      value={value$}
      onValueChange={(n) => {
        mut_changes.push(n);

        setValue(n);
      }}
    />
  ));

  const [up, down] = all<HTMLButtonElement>(container, 'button');

  assert.isDefined(up);

  assert.isDefined(down);

  return {
    input: one<HTMLInputElement>(container, 'input'),
    up,
    down,
    changes: mut_changes,
    setValue,
    unmount,
  };
};
