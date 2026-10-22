import type { GeneratedIntrinsicElements } from './element-props.mjs';
import type { Mountable } from './mountable.mjs';

/** The `JSX` namespace TypeScript reads through `jsxImportSource`. */
export declare namespace JSX {
  type Element = Mountable;

  type ElementChildrenAttribute = Readonly<{ children: unknown }>;

  type IntrinsicElements = GeneratedIntrinsicElements;
}
