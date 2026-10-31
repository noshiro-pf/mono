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

const bindEvent = (
  element: Element,
  type: string,
  handler: EventListener,
): void => {
  element.addEventListener(type, handler);

  onScopeDispose(() => {
    element.removeEventListener(type, handler);
  });
};

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
    bindEvent(element, key.slice(2).toLowerCase(), value);

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
