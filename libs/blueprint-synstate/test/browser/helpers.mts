import { createState, type InitializedObservable } from 'synstate';
import { render, type JSX } from 'synstate-dom';

/** Mounts `app` into a container attached to the document. */
export const mountInto = (
  app: () => JSX.Element,
): Readonly<{
  container: HTMLDivElement;
  unmount: () => void;
}> => {
  const container = document.createElement('div');

  document.body.append(container);

  const unmount = render(app, container);

  return {
    container,
    unmount: () => {
      unmount();

      container.remove();
    },
  };
};

/**
 * A value held as the app holds it: what `onChange` is called with becomes the
 * value, and every call is kept.
 */
export const controlled = (
  initial: string,
): Readonly<{
  value$: InitializedObservable<string>;
  onChange: (value: string) => void;
  changes: readonly string[];
}> => {
  const [value$, setValue] = createState(initial);

  const mut_changes: string[] = [];

  return {
    value$,
    onChange: (value) => {
      mut_changes.push(value);

      setValue(value);
    },
    changes: mut_changes,
  };
};

/** Lets the work queued for after an update run. */
export const settle = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

/**
 * Lets the next frame's callbacks run, by which synstate-dom has drawn a
 * refused change of a bound `checked` as its value again.
 */
export const nextFrame = (): Promise<void> =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });

/** The one element `selector` finds under `root`, failing the test otherwise. */
export const one = <E extends Element = HTMLElement>(
  root: Element,
  selector: string,
): E => {
  const found = root.querySelectorAll<E>(selector);

  assert.strictEqual(found.length, 1);

  const [element] = found;

  assert.isDefined(element);

  return element;
};

/** Every element `selector` finds under `root`. */
export const all = <E extends Element = HTMLElement>(
  root: Element,
  selector: string,
): readonly E[] => Array.from(root.querySelectorAll<E>(selector));

/** The day button showing `day` in the month shown, not an outside day. */
export const dayButton = (root: Element, day: number): HTMLButtonElement => {
  const found = all<HTMLButtonElement>(
    root,
    'button.rdp-day:not(.rdp-day_outside)',
  ).find((button) => button.textContent === day.toString());

  assert.isDefined(found);

  return found;
};

/** Sets a select's value and fires `change`, as a person picking does. */
export const pick = (mut_select: HTMLSelectElement, value: string): void => {
  mut_select.value = value;

  mut_select.dispatchEvent(new Event('change', { bubbles: true }));
};

/** Sets an input's value and fires `input`, as typing does. */
export const type = (mut_input: HTMLInputElement, value: string): void => {
  mut_input.value = value;

  mut_input.dispatchEvent(new Event('input', { bubbles: true }));
};

/** Fires a `keydown` of `key`, and returns whether it was not cancelled. */
export const press = (
  target: Element,
  key: string,
  init: Readonly<KeyboardEventInit> = {},
): boolean =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  );

/**
 * Stops the clock at 2026-10-23 14:05 local time for the rest of the test, so
 * that today, and the range the pickers default to, are known.
 */
export const fixNow = (): void => {
  vi.useFakeTimers({ toFake: ['Date'] });

  vi.setSystemTime('2026-10-23T14:05');

  onTestFinished(() => {
    vi.useRealTimers();
  });
};
