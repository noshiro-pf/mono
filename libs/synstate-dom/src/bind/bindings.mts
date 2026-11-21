/**
 * The bindings: one effect each, holding its target in its own fields. A
 * binding is created with the element, writes the value it reads at once, and
 * writes again after every update that changed its source. The owner that was
 * current when it was created disposes it.
 */
import { EffectClass, noValue, type ObservableClass } from 'synstate/internal';

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

/**
 * Binds an attribute, as {@link writeAttribute} writes it. `fitted`, where
 * given, is told before and after each write: an input's `value`, which the
 * input fits to its `min`, `max`, `step` and `type`, is written again there
 * (see {@link InputValueWriter}).
 */
export class AttributeBinding extends EffectClass<unknown> {
  readonly #element: Element;

  readonly #name: string;

  readonly #fitted: InputValueWriter | undefined;

  constructor(
    source: ObservableClass<unknown>,
    element: Element,
    name: string,
    fitted?: InputValueWriter,
  ) {
    super(source);

    this.#element = element;

    this.#name = name;

    this.#fitted = fitted;

    this.run();
  }

  run(): void {
    const v = this.source.current;

    this.#fitted?.beforeBoundsWrite();

    writeAttribute(this.#element, this.#name, v === noValue ? undefined : v);

    this.#fitted?.afterBoundsWrite();
  }
}

/**
 * Writes `value` of an `<input>`, and writes it again after a write of `min`,
 * `max`, `step` or `type` while the input does not show it. An input fits its
 * value to its `type`, and a range input to its `min`, `max` and `step` too,
 * when the value is written and again whenever they change, and does not take
 * it back: an update that raises `max` and `value` together may write the value
 * first, since the effects run in the order their observables emitted, and a
 * `max` lowered then raised leaves the value lowered. A value the user has
 * changed since the last write, a draft or an IME composition, is kept: the
 * input is compared before each bounds write with what it showed after the last
 * write of either kind, so what the bounds changed is not taken for the user's.
 * A value the browser drops, as a type it does not fit does, gives way to the
 * bound value. A file input, which takes no value but `''`, is written only
 * `''`: another bound value is written once the type changes back, which drops
 * what the user typed or chose.
 */
export class InputValueWriter {
  readonly #input: HTMLInputElement;

  #mut_bound: unknown;

  /** What the input showed after the last write of its value or bounds. */
  #mut_shown: string;

  /** Whether its value was changed since it was last written. */
  #mut_edited: boolean;

  /** Whether it was a file input before the bounds write under way. */
  #mut_wasFile: boolean;

  /** What it showed before the bounds write under way. */
  #mut_before: string;

  /** Whether a value has been bound: before one is, nothing is written. */
  #mut_written: boolean;

  constructor(input: HTMLInputElement) {
    this.#input = input;

    this.#mut_bound = undefined;

    this.#mut_shown = '';

    this.#mut_edited = false;

    this.#mut_wasFile = false;

    this.#mut_before = '';

    this.#mut_written = false;
  }

  write(value: unknown): void {
    const input = this.#input;

    // A file input's value is the chosen file's name or `''`, and it refuses
    // any other: `''` clears the choice, and another value waits for a type
    // that takes it.
    if (input.type !== 'file') {
      Reflect.set(input, 'value', value);
    } else if (toText(value) === '') {
      input.value = '';
    }

    this.#mut_bound = value;

    this.#mut_shown = input.value;

    this.#mut_edited = false;

    this.#mut_written = true;
  }

  beforeBoundsWrite(): void {
    const input = this.#input;

    this.#mut_wasFile = input.type === 'file';

    this.#mut_before = input.value;

    if (input.value !== this.#mut_shown) {
      this.#mut_edited = true;
    }
  }

  /** Writes the bound value again if it is not what the input shows. */
  afterBoundsWrite(): void {
    const input = this.#input;

    const isFile = input.type === 'file';

    // Into or out of `file`, or into a type the value does not fit, the browser
    // drops what the user typed or chose: nothing of the user's is left to
    // keep.
    if (
      isFile !== this.#mut_wasFile ||
      (input.value === '' && this.#mut_before !== '')
    ) {
      this.#mut_edited = false;
    }

    if (this.#mut_edited || !this.#mut_written) {
      return;
    }

    if (isFile || input.value === toText(this.#mut_bound)) {
      this.#mut_shown = input.value;
    } else {
      this.write(this.#mut_bound);
    }
  }
}

/** Binds `value` of an `<input>` through its {@link InputValueWriter}. */
export class InputValueBinding extends EffectClass<unknown> {
  readonly #writer: InputValueWriter;

  constructor(source: ObservableClass<unknown>, writer: InputValueWriter) {
    super(source);

    this.#writer = writer;

    this.run();
  }

  run(): void {
    const v = this.source.current;

    if (v !== noValue) {
      this.#writer.write(v);
    }
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
