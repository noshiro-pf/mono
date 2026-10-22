import type { ReadonlyRecord, StrictPick, TypeEq } from 'ts-type-forge';
import type { Bindable } from '../constant/index.mjs';
import type { SvgTagName, svgAttributeNames } from '../internal/index.mjs';
import type { Child } from './child.mjs';
import type { EventPropNames } from './event-prop-names.mjs';

/**
 * The props every intrinsic element takes.
 *
 * - `ref` is called once with the element, right after it is created and
 *   before anything is bound or its children are mounted.
 * - `class` is either a string or an object of `Bindable<boolean>`s, one per
 *   class name, never both (SPEC.md 7.2).
 * - `style` is either a `cssText` string or an object of CSS properties, each
 *   bound with `style.setProperty`, so the keys are the hyphenated names
 *   (`'background-color'`, `'--accent'`).
 */
export type CommonElementProps<E extends Element> = Readonly<{
  ref?: (element: E) => void;
  children?: Child;
  class?: Bindable<string> | ClassObject;
  style?: Bindable<string> | StyleObject;
}> &
  Partial<
    ReadonlyRecord<`aria-${string}` | `data-${string}`, Bindable<string>>
  >;

/** `class` as one `Bindable<boolean>` per class name. */
export type ClassObject = ReadonlyRecord<string, Bindable<boolean>>;

/** `style` as one `Bindable<string>` per hyphenated CSS property name. */
export type StyleObject = ReadonlyRecord<string, Bindable<string>>;

/**
 * The props of an HTML element: the common ones, one `Bindable` per writable
 * primitive DOM property of `E` (`id`, `disabled`, `value`, `tabIndex`, …),
 * and one handler per event of `HTMLElementEventMap`.
 */
export type HtmlElementProps<E extends HTMLElement> = CommonElementProps<E> &
  ReflectedProps<E> &
  EventProps<E, HTMLElementEventMap>;

/**
 * The props of an SVG element: the common ones, the attributes of
 * `svgAttributeNames`, and one handler per event of `SVGElementEventMap`.
 */
export type SvgElementProps<E extends SVGElement> = CommonElementProps<E> &
  Partial<
    ReadonlyRecord<
      (typeof svgAttributeNames)[number],
      Bindable<number | string>
    >
  > &
  EventProps<E, SVGElementEventMap>;

/**
 * One handler per event, named `on` followed by the event's name in
 * PascalCase (`onClick`, `onPointerDown`). `currentTarget` is narrowed to the
 * element. A handler is a function, never an observable.
 */
export type EventProps<E extends Element, M> = Readonly<{
  [K in keyof M & keyof EventPropNames as EventPropNames[K]]?: (
    event: M[K] & Readonly<{ currentTarget: E }>,
  ) => void;
}>;

export type GeneratedIntrinsicElements = Readonly<{
  [K in keyof HTMLElementTagNameMap]: HtmlElementProps<
    HTMLElementTagNameMap[K]
  >;
}> &
  Readonly<{ [K in SvgTagName]: SvgElementProps<SVGElementTagNameMap[K]> }>;

type ReflectedProps<E> = Readonly<{
  [K in ReflectedKey<E>]?: Bindable<NonNullable<E[K]>>;
}>;

type ReflectedKey<E> = {
  [K in keyof E]-?: K extends ExcludedKey | `aria${string}` | `on${string}`
    ? never
    : NonNullable<E[K]> extends boolean | number | string
      ? IsWritable<E, K> extends true
        ? K
        : never
      : never;
}[keyof E];

type IsWritable<E, K extends keyof E> =
  TypeEq<StrictPick<E, K>, Readonly<StrictPick<E, K>>> extends true
    ? false
    : true;

/**
 * Writable primitive properties that are not attributes, or that are props of
 * their own (`class`, `style`).
 */
type ExcludedKey =
  | 'className'
  | 'innerHTML'
  | 'innerText'
  | 'nodeValue'
  | 'outerHTML'
  | 'outerText'
  | 'scrollLeft'
  | 'scrollTop'
  | 'textContent';
