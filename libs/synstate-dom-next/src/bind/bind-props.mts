import { isObservable, map } from 'synstate-next';
import { toNode } from 'synstate-next/internal';
import { isNonNullObject } from 'ts-data-forge';
import * as Arr from 'ts-data-forge/array';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  AttributeBinding,
  ClassToggleBinding,
  PropertyBinding,
  StyleBinding,
  writeAttribute,
  writeStyle,
} from './bindings.mjs';
import { controlProperty, isControlledKey } from './controlled.mjs';
import {
  attributeNameOf,
  isSvgOnlyTag,
  propertyNames,
  svgNamespace,
} from './dom-tables.mjs';

/**
 * Binds every prop of an element except `ref` and `children`: `class`, `style`,
 * the event handlers, the DOM properties of `propertyNames`, and attributes for
 * the rest. A constant is written once; an observable gets a binding, owned by
 * the current owner.
 */
export const bindProps = (
  element: Element,
  props: ReadonlyRecord<string, unknown>,
): void => {
  const htmlTypedSvg =
    element.namespaceURI === svgNamespace && !isSvgOnlyTag(element.localName);

  for (const [key, value] of Object.entries(props)) {
    bindProp(element, key, value, htmlTypedSvg);
  }
};

/** `onClick`, `onPointerDown`: `on` and an upper-case letter. */
const isEventKey = (key: string): boolean => /^on[A-Z]/u.test(key);

/**
 * Assigns the handler to the element's `on…` property where it has one, which
 * costs less than a listener and goes with the element; an event with no such
 * property (`focusin`, `compositionstart`) gets a listener. Neither is removed:
 * the element is dropped when its owner is disposed.
 */
const listen = (element: Element, key: string, handler: unknown): void => {
  if (typeof handler !== 'function') {
    return;
  }

  const property = key.toLowerCase();

  // The handler properties are inherited from the prototype chain, which is
  // what `in` looks at.
  // eslint-disable-next-line no-restricted-syntax, unicorn/no-computed-property-existence-check, ts-data-forge/prefer-is-record-and-has-key
  if (property in element) {
    Reflect.set(element, property, handler);
  } else {
    element.addEventListener(property.slice(2), (event) => {
      Reflect.apply(handler, element, [event]);
    });
  }
};

const bindProperty = (element: Element, key: string, value: unknown): void => {
  if (isObservable(value)) {
    // Registers itself with the source and the current owner.
    // oxlint-disable-next-line eslint/no-new
    new PropertyBinding(toNode(value), element, key);
  } else {
    Reflect.set(element, key, value);
  }
};

const bindAttribute = (
  element: Element,
  name: string,
  value: unknown,
): void => {
  if (isObservable(value)) {
    // oxlint-disable-next-line eslint/no-new
    new AttributeBinding(toNode(value), element, name);
  } else {
    writeAttribute(element, name, value);
  }
};

const booleanAsText = (value: unknown): unknown =>
  typeof value === 'boolean' ? value.toString() : value;

/**
 * `value`, a constant or an observable, with a boolean as text: `false` is a
 * value of an enumerated attribute, where `writeAttribute` would remove it.
 */
const asText = (value: unknown): unknown =>
  isObservable(value) ? value.pipe(map(booleanAsText)) : booleanAsText(value);

/**
 * An event handler, a DOM property, or an attribute. `htmlTypedSvg` is an
 * element with a tag HTML has (`<a>`, `<title>`) mounted inside an `<svg>`: an
 * SVG element, typed with HTML's props. It has none of HTML's DOM properties,
 * and `setAttribute` lower-cases a name on an HTML element only, so every prop
 * is an attribute, lower-cased here (`tabIndex` becomes `tabindex`), and the
 * enumerated ones are written as text (`draggable="false"`).
 */
const bindOther = (
  element: Element,
  key: string,
  value: unknown,
  htmlTypedSvg: boolean,
): void => {
  if (isEventKey(key)) {
    listen(element, key, value);
  } else if (htmlTypedSvg) {
    bindAttribute(
      element,
      (attributeNameOf[key] ?? key).toLowerCase(),
      enumeratedNameSet.has(key) ? asText(value) : value,
    );
  } else if (propertyNameSet.has(key)) {
    bindProperty(element, key, value);

    if (isControlledKey(key) && element instanceof HTMLInputElement) {
      controlProperty(element, key, value);
    }
  } else {
    bindAttribute(element, attributeNameOf[key] ?? key, value);
  }
};

/** `class` and `style` in their object form. */
const isPlainObject = (
  value: unknown,
): value is ReadonlyRecord<string, unknown> =>
  isNonNullObject(value) && !Arr.isArray(value) && !isObservable(value);

/** `class` as a string, or as one boolean per class name. */
const bindClass = (element: Element, value: unknown): void => {
  if (!isPlainObject(value)) {
    bindAttribute(element, 'class', value);

    return;
  }

  for (const [name, on] of Object.entries(value)) {
    if (/\s/u.test(name)) {
      console.error(
        `synstate-dom-next: the class name ${JSON.stringify(name)} contains whitespace; give each class its own key.`,
      );
    } else if (isObservable(on)) {
      // oxlint-disable-next-line eslint/no-new
      new ClassToggleBinding(toNode(on), element, name);
    } else if (on === true) {
      element.classList.add(name);
    }
  }
};

/** `style` as a `cssText` string, or as one value per CSS property. */
const bindStyle = (element: Element, value: unknown): void => {
  if (!isPlainObject(value)) {
    bindAttribute(element, 'style', value);

    return;
  }

  if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
    return;
  }

  const { style } = element;

  for (const [name, v] of Object.entries(value)) {
    if (isObservable(v)) {
      // oxlint-disable-next-line eslint/no-new
      new StyleBinding(toNode(v), style, name);
    } else {
      writeStyle(style, name, v);
    }
  }
};

const bindProp = (
  element: Element,
  key: string,
  value: unknown,
  htmlTypedSvg: boolean,
): void => {
  // `key` belongs to `For`; on an element, it can only have come in a spread.
  if (
    key === 'children' ||
    key === 'ref' ||
    key === 'key' ||
    value === undefined
  ) {
    return;
  }

  switch (key) {
    case 'class':
      bindClass(element, value);

      return;

    case 'style':
      bindStyle(element, value);

      return;

    default:
      bindOther(element, key, value, htmlTypedSvg);
  }
};

const propertyNameSet: ReadonlySet<string> = new Set<string>(propertyNames);

/** The props of `propertyNames` whose `false` is a value, not an absence. */
const enumeratedNameSet: ReadonlySet<string> = new Set<string>([
  'autocorrect',
  'draggable',
  'spellcheck',
  'translate',
]);
