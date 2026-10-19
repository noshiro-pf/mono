import type { Child } from './child.mjs';
import type { Mountable } from './mountable.mjs';

/**
 * The props of an intrinsic element.
 *
 * - `ref` is called once with the element, right after it is created and
 *   before its children are mounted.
 * - Attributes, properties, `class`, `style` and events are bound by the next
 *   milestone (SPEC.md 5.2, 7).
 */
export type ElementProps<E extends Element> = Readonly<{
  ref?: (element: E) => void;
  children?: Child;
}>;

type GeneratedIntrinsicElements = Readonly<{
  [K in keyof HTMLElementTagNameMap]: ElementProps<HTMLElementTagNameMap[K]>;
}>;

/** The `JSX` namespace TypeScript reads through `jsxImportSource`. */
export declare namespace JSX {
  type Element = Mountable;

  type ElementChildrenAttribute = Readonly<{ children: unknown }>;

  type IntrinsicElements = GeneratedIntrinsicElements;
}
