import type { GeneratedIntrinsicElements } from './element-props.mjs';
import type { Description } from './mount.mjs';

/** The `JSX` namespace TypeScript reads through `jsxImportSource`. */
export declare namespace JSX {
  type Element = Description;

  type ElementChildrenAttribute = Readonly<{ children: unknown }>;

  type IntrinsicElements = GeneratedIntrinsicElements;
}
