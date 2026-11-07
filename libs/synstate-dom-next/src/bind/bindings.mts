/**
 * The bindings: one effect each, holding its target in its own fields. A
 * binding is created with the element, writes the value it reads at once, and
 * writes again after every update that changed its source. The owner that was
 * current when it was created disposes it.
 */
import {
  EffectClass,
  noValue,
  type ObservableClass,
} from 'synstate-next/internal';

/** Binds the text of a text node. */
export class TextBinding extends EffectClass<unknown> {
  readonly #text: Text;

  constructor(source: ObservableClass<unknown>, text: Text) {
    super(source);

    this.#text = text;

    this.run();
  }

  run(): void {
    this.#text.data = toText(this.source.current);
  }
}

/** Binds a DOM property: `element[name] = value`. */
export class PropertyBinding extends EffectClass<unknown> {
  readonly #element: Element;

  readonly #name: string;

  constructor(
    source: ObservableClass<unknown>,
    element: Element,
    name: string,
  ) {
    super(source);

    this.#element = element;

    this.#name = name;

    this.run();
  }

  run(): void {
    const v = this.source.current;

    if (v !== noValue) {
      Reflect.set(this.#element, this.#name, v);
    }
  }
}

/** Binds an attribute, as {@link writeAttribute} writes it. */
export class AttributeBinding extends EffectClass<unknown> {
  readonly #element: Element;

  readonly #name: string;

  constructor(
    source: ObservableClass<unknown>,
    element: Element,
    name: string,
  ) {
    super(source);

    this.#element = element;

    this.#name = name;

    this.run();
  }

  run(): void {
    const v = this.source.current;

    writeAttribute(this.#element, this.#name, v === noValue ? undefined : v);
  }
}

/** Binds whether `element` has the class `name`. */
export class ClassToggleBinding extends EffectClass<unknown> {
  readonly #element: Element;

  readonly #name: string;

  constructor(
    source: ObservableClass<unknown>,
    element: Element,
    name: string,
  ) {
    super(source);

    this.#element = element;

    this.#name = name;

    this.run();
  }

  run(): void {
    this.#element.classList.toggle(this.#name, this.source.current === true);
  }
}

/** Binds one CSS property; `undefined` removes it. */
export class StyleBinding extends EffectClass<unknown> {
  readonly #style: CSSStyleDeclaration;

  readonly #name: string;

  constructor(
    source: ObservableClass<unknown>,
    style: CSSStyleDeclaration,
    name: string,
  ) {
    super(source);

    this.#style = style;

    this.#name = name;

    this.run();
  }

  run(): void {
    writeStyle(this.#style, this.#name, this.source.current);
  }
}

/**
 * Writes an attribute. `true` writes an empty attribute, and `false` and
 * `undefined` remove it. An `aria-*` attribute reads `""` as its default, so a
 * boolean is written there as `"true"` or `"false"`, as React does.
 */
export const writeAttribute = (
  element: Element,
  name: string,
  value: unknown,
): void => {
  if (typeof value === 'boolean') {
    if (name.startsWith('aria-')) {
      element.setAttribute(name, value ? 'true' : 'false');
    } else {
      element.toggleAttribute(name, value);
    }

    return;
  }

  if (value === undefined || value === null || value === noValue) {
    element.removeAttribute(name);

    return;
  }

  element.setAttribute(name, toText(value));
};

/** Writes one CSS property; `undefined` removes it. */
export const writeStyle = (
  style: CSSStyleDeclaration,
  name: string,
  value: unknown,
): void => {
  if (value === undefined || value === null || value === noValue) {
    style.removeProperty(name);
  } else {
    style.setProperty(name, toText(value));
  }
};

/**
 * The text of a value written as text or as an attribute: a string or a number
 * by the types; anything else writes nothing.
 */
const toText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return value.toString();
  }

  return '';
};
