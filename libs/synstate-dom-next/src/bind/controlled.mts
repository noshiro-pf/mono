import { isObservable } from 'synstate-next';
import { noValue, toNode } from 'synstate-next/internal';

/** The DOM properties a user's change changes and the binding sets back. */
export type ControlledKey = 'checked' | 'indeterminate' | 'value';

/**
 * `key` and its element when it is controlled there: `checked` and
 * `indeterminate` of an `<input>`, and `value` of a `<select>` alone (not of a
 * `<select multiple>`, which `restore` leaves alone). A `<select>` has no draft
 * and no composition, so every `change` is a finished choice, as a checkbox's
 * is; an `<input>` or `<textarea>` bound one way keeps what is being typed,
 * which a draft committed on `change` or blur, or an IME composition, needs.
 */
export const controlledKeyOn = (
  element: Element,
  key: string,
): Readonly<{ element: ControlledElement; key: ControlledKey }> | undefined => {
  if (key === 'value') {
    return element instanceof HTMLSelectElement ? { element, key } : undefined;
  }

  return (key === 'checked' || key === 'indeterminate') &&
    element instanceof HTMLInputElement
    ? { element, key }
    : undefined;
};

/**
 * Makes `key` of `input` controlled, `value` having been bound to it: after a
 * `change`, the element is drawn as the bound values again, so a change its
 * owner did not take undoes itself. This waits until every handler of the event
 * (the ancestors' included) has seen the user's change: for the next animation
 * frame, before it is painted, or a task queued by the event, which runs in a
 * hidden page too, whichever comes first.
 * Checking a radio button unchecks the others of its group with no event on
 * them, so a change on one sets back every bound button of the group.
 */
export const controlProperty = (
  input: ControlledElement,
  key: ControlledKey,
  value: unknown,
): void => {
  const read = isObservable(value) ? readNode(value) : (): unknown => value;

  const mut_existing = mut_controlled.get(input);

  if (mut_existing === undefined) {
    mut_controlled.set(
      input,
      new Map<ControlledKey, () => unknown>([[key, read]]),
    );

    // Capturing, so that it runs before the element's own handlers and none of
    // them can stop it.
    input.addEventListener('change', onChange, { capture: true });
  } else {
    mut_existing.set(key, read);
  }
};

/** The elements whose properties can be controlled. */
type ControlledElement = HTMLInputElement | HTMLSelectElement;

/** How to read the bound value of each controlled property of an input. */
// transformer-ignore-next-line convert-to-readonly
const mut_controlled = new WeakMap<
  ControlledElement,
  Map<ControlledKey, () => unknown>
>();

/** The bound value of an observable, read when it is restored. */
const readNode = (value: Parameters<typeof toNode>[0]): (() => unknown) => {
  const node = toNode(value);

  return () => node.current;
};

/** Writes every bound property of `input` back to it. */
const restore = (input: ControlledElement): void => {
  const reads = mut_controlled.get(input);

  if (reads === undefined) {
    return;
  }

  for (const [key, read] of reads) {
    // `value` names one option, so a `<select multiple>`, whose user may have
    // chosen several, is not drawn back to it: it stays one way.
    if (
      key === 'value' &&
      input instanceof HTMLSelectElement &&
      input.multiple
    ) {
      continue;
    }

    const v = read();

    if (v !== noValue && Reflect.get(input, key) !== v) {
      Reflect.set(input, key, v);
    }
  }
};

/**
 * The radio buttons of `input`'s group: those of the same `name` and form in
 * the same document or shadow root. Any other input, one in no document
 * included, is a group of its own: a click on an input in no document fires no
 * `change`, so nothing is restored.
 */
const radioGroupOf = (
  input: ControlledElement,
): readonly ControlledElement[] => {
  const root = input.getRootNode();

  if (
    !(input instanceof HTMLInputElement) ||
    input.type !== 'radio' ||
    input.name === '' ||
    !(root instanceof Document || root instanceof ShadowRoot)
  ) {
    return [input];
  }

  return Array.from(
    root.querySelectorAll<HTMLInputElement>(
      `input[type="radio"][name="${CSS.escape(input.name)}"]`,
    ),
  ).filter((radio) => radio.form === input.form);
};

const onChange = (event: Event): void => {
  const input = event.currentTarget;

  if (!(
    input instanceof HTMLInputElement || input instanceof HTMLSelectElement
  )) {
    return;
  }

  const restoreGroup = (): void => {
    for (const member of radioGroupOf(input)) {
      restore(member);
    }
  };

  // Whichever comes first cancels the other.
  const frame = requestAnimationFrame(() => {
    clearTimeout(task);

    restoreGroup();
  });

  const task = setTimeout(() => {
    cancelAnimationFrame(frame);

    restoreGroup();
  }, 0);
};
