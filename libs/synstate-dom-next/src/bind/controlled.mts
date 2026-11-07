import { isObservable } from 'synstate-next';
import { noValue, toNode } from 'synstate-next/internal';

/** The DOM properties a user's click changes and the binding sets back. */
export type ControlledKey = 'checked' | 'indeterminate';

export const isControlledKey = (key: string): key is ControlledKey =>
  key === 'checked' || key === 'indeterminate';

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
  input: HTMLInputElement,
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

/** How to read the bound value of each controlled property of an input. */
// transformer-ignore-next-line convert-to-readonly
const mut_controlled = new WeakMap<
  HTMLInputElement,
  Map<ControlledKey, () => unknown>
>();

/** The bound value of an observable, read when it is restored. */
const readNode = (value: Parameters<typeof toNode>[0]): (() => unknown) => {
  const node = toNode(value);

  return () => node.current;
};

/** Writes every bound property of `input` back to it. */
const restore = (input: HTMLInputElement): void => {
  const reads = mut_controlled.get(input);

  if (reads === undefined) {
    return;
  }

  for (const [key, read] of reads) {
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
const radioGroupOf = (input: HTMLInputElement): readonly HTMLInputElement[] => {
  const root = input.getRootNode();

  if (
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

  if (!(input instanceof HTMLInputElement)) {
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
