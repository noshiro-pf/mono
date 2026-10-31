import { isObservable, onScopeDispose } from 'synstate';
import { hasKey, isBoolean, isRecord, unknownToString } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Bindable } from '../constant/index.mjs';
import {
  attributeNameOf,
  bindValue,
  propertyNames,
  viewTag,
} from '../internal/index.mjs';
import { listenInScope } from '../scope/index.mjs';

/**
 * Binds every prop of an intrinsic element except `ref` and `children` (SPEC.md
 * 7): `class`, `style`, event handlers, the DOM properties of `propertyNames`,
 * and attributes for the rest. Subscriptions and listeners are released when
 * the current scope is disposed.
 */
export const bindProps = (
  element: Element,
  props: ReadonlyRecord<string, unknown>,
): void => {
  for (const [key, value] of Object.entries(props)) {
    bindProp(element, key, value);
  }
};

/**
 * `true` writes an empty attribute, and `false`, `undefined` and `null` remove
 * it.
 */
const writeAttribute = (
  element: Element,
  name: string,
  value: unknown,
): void => {
  if (isBoolean(value)) {
    element.toggleAttribute(name, value);

    return;
  }

  if (value === undefined || value === null) {
    element.removeAttribute(name);

    return;
  }

  element.setAttribute(name, unknownToString(value));
};

/**
 * Every value is a `Bindable` at run time: what is neither an observable nor a
 * view is a constant. An omitted prop is `undefined`, which is not.
 */
const isBindable = (value: unknown): value is Bindable<unknown> =>
  value !== undefined && value !== null;

/** `class` and `style` in their object form: neither an observable nor a view. */
const isPlainObject = (
  value: unknown,
): value is ReadonlyRecord<string, unknown> =>
  isRecord(value) && !isObservable(value) && !hasKey(value, viewTag);

const bindClass = (element: Element, value: Bindable<unknown>): void => {
  if (!isPlainObject(value)) {
    bindValue(value, (v) => {
      writeAttribute(element, 'class', v);
    });

    return;
  }

  for (const [name, on] of Object.entries(value)) {
    if (/\s/u.test(name)) {
      console.error(
        `synstate-dom: the class name ${JSON.stringify(name)} contains whitespace; give each class its own key.`,
      );

      continue;
    }

    if (isBindable(on)) {
      bindValue(on, (v) => {
        element.classList.toggle(name, v === true);
      });
    }
  }
};

const bindStyle = (element: Element, value: Bindable<unknown>): void => {
  if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
    return;
  }

  const { style } = element;

  if (!isPlainObject(value)) {
    bindValue(value, (v) => {
      writeAttribute(element, 'style', v);
    });

    return;
  }

  for (const [name, v] of Object.entries(value)) {
    if (isBindable(v)) {
      bindValue(v, (current) => {
        if (current === undefined || current === null) {
          style.removeProperty(name);
        } else {
          style.setProperty(name, unknownToString(current));
        }
      });
    }
  }
};

/**
 * The radio buttons of `input`'s group: those of the same `name` and form in
 * the same document or shadow root. Any other input is a group of its own.
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

/**
 * The controlled properties of an element, created with the `change` listener
 * that sets them back. The listener is a capturing one, which runs before the
 * element's own handlers, so no handler on the element can stop it.
 */
const controlledOf = (element: HTMLInputElement): Controlled => {
  const existing = controlled.get(element);

  if (existing !== undefined) {
    return existing;
  }

  const mut_restorers = new Map<ControlledKey, () => void>();

  const created: Controlled = {
    add: (key, restore) => {
      mut_restorers.set(key, restore);
    },
    restore: () => {
      for (const restore of mut_restorers.values()) {
        restore();
      }
    },
  } as const;

  const onChange = (): void => {
    requestAnimationFrame(() => {
      for (const input of radioGroupOf(element)) {
        controlled.get(input)?.restore();
      }
    });
  };

  controlled.set(element, created);

  listenInScope(element, 'change', onChange, { capture: true });

  onScopeDispose(() => {
    controlled.delete(element);
  });

  return created;
};

/**
 * `checked` and `indeterminate` are controlled (SPEC.md 7.2): after a `change`,
 * the element is drawn as the bound values again, so a change its owner did not
 * take undoes itself. This waits for the next frame, after every handler of the
 * event, the ancestors' included, has seen the user's change, and before it is
 * painted. Checking a radio button unchecks the others of its group with no
 * event on them, so a change on one sets back every bound button of the group.
 */
const bindControlled = (
  element: HTMLInputElement,
  key: ControlledKey,
  value: Bindable<unknown>,
): void => {
  const mut_bound: { current: unknown } = { current: undefined };

  bindValue(value, (v) => {
    mut_bound.current = v;

    Reflect.set(element, key, v);
  });

  controlledOf(element).add(key, () => {
    if (Reflect.get(element, key) !== mut_bound.current) {
      Reflect.set(element, key, mut_bound.current);
    }
  });
};

type ControlledKey = 'checked' | 'indeterminate';

type Controlled = Readonly<{
  add: (key: ControlledKey, restore: () => void) => void;
  /** Writes every bound property back to the element. */
  restore: () => void;
}>;

const isControlledKey = (key: string): key is ControlledKey =>
  key === 'checked' || key === 'indeterminate';

/** The elements bound by {@link bindControlled}. */
const controlled = new WeakMap<HTMLInputElement, Controlled>();

/** `onClick`, `onPointerDown`: `on` and an upper-case letter. */
const isEventKey = (key: string): boolean => /^on[A-Z]/u.test(key);

const isEventHandler = (value: unknown): value is EventListener =>
  typeof value === 'function';

const bindProp = (element: Element, key: string, value: unknown): void => {
  if (key === 'children' || key === 'ref' || !isBindable(value)) {
    return;
  }

  if (key === 'class') {
    bindClass(element, value);

    return;
  }

  if (key === 'style') {
    bindStyle(element, value);

    return;
  }

  if (isEventKey(key) && isEventHandler(value)) {
    listenInScope(element, key.slice(2).toLowerCase(), value);

    return;
  }

  if (isControlledKey(key) && element instanceof HTMLInputElement) {
    bindControlled(element, key, value);

    return;
  }

  if (propertyNameSet.has(key)) {
    bindValue(value, (v) => {
      Reflect.set(element, key, v);
    });

    return;
  }

  const name = attributeNameOf[key] ?? key;

  bindValue(value, (v) => {
    writeAttribute(element, name, v);
  });
};

const propertyNameSet: ReadonlySet<string> = new Set(propertyNames);
