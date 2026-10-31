import type { ReadonlyRecord, StrictPick, TypeEq } from 'ts-type-forge';
import type { Bindable } from '../constant/index.mjs';
import type {
  propertyNames,
  svgAttributeNames,
  SvgTagName,
} from '../internal/index.mjs';
import type { Child } from './child.mjs';
import type { EventPropNames } from './event-prop-names.mjs';

/**
 * The props every intrinsic element takes.
 *
 * - `ref` is called once with the element, right after it is created and
 *   before its children are mounted or anything is bound.
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
    ReadonlyRecord<
      `aria-${string}` | `data-${string}`,
      Bindable<string | undefined>
    >
  >;

/** `class` as one `Bindable<boolean>` per class name. */
export type ClassObject = ReadonlyRecord<string, Bindable<boolean>>;

/**
 * `style` as one `Bindable<string | undefined>` per hyphenated CSS property
 * name; `undefined` removes the property.
 */
export type StyleObject = ReadonlyRecord<string, Bindable<string | undefined>>;

/**
 * The props of an HTML element: the common ones, one `Bindable` per writable
 * primitive DOM property of `E` (`id`, `disabled`, `value`, `tabIndex`, …), and
 * one handler per event of `HTMLElementEventMap`.
 *
 * An attribute, `aria-*` and `data-*` included, also takes `undefined`, which
 * removes it: a value that comes and goes is an observable of `T | undefined`
 * (SPEC.md 4.1). A DOM property of `propertyNames` (`value`, `checked`, …) has
 * no absent state and does not.
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
      Bindable<number | string | undefined>
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
  [K in keyof E as ReflectedKey<E, K>]?: Bindable<
    K extends PropertyName ? NonNullable<E[K]> : NonNullable<E[K]> | undefined
  >;
}>;

type PropertyName = (typeof propertyNames)[number];

/**
 * `K` if it is a writable primitive property of `E`, and `never` otherwise.
 * An index signature is dropped: `HTMLFormElement` has one for its named
 * controls, which would otherwise swallow every other key.
 */
type ReflectedKey<E, K extends keyof E> = string extends K
  ? never
  : number extends K
    ? never
    : K extends ExcludedKey | `aria${string}` | `on${string}`
      ? never
      : NonNullable<E[K]> extends boolean | number | string
        ? IsWritable<E, K> extends true
          ? K
          : never
        : never;

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
