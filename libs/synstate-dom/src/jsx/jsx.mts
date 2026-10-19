import { hasKey, isRecord } from 'ts-data-forge';
import { isChild, mountChild, type Child } from './child.mjs';
import { mountable, type Mountable } from './mountable.mjs';

/**
 * The JSX factory (SPEC.md 6.2), exported from `synstate-dom/jsx-runtime` as
 * `jsx` and `jsxs`. Returns a description and does nothing else:
 * no DOM is created and no component is called until it is mounted.
 *
 * TypeScript checks a JSX expression against the `JSX` namespace, not against
 * this signature, so the props of an intrinsic element arrive as `P` and are
 * read with run-time checks.
 *
 * `key` is not used; `For` takes a `key` function as a prop instead.
 */
export const createMountable = <P,>(
  type: string | ((componentProps: P) => Mountable),
  props: P,
): Mountable =>
  typeof type === 'string'
    ? mountable(() => mountElement(type, props))
    : mountable(() => type(props).mount());

/** Mounts its children in order, with no element around them. */
export const Fragment = (props: Readonly<{ children?: Child }>): Mountable =>
  mountable(() => mountChild(props.children ?? []));

const mountElement = (tag: string, props: unknown): Element => {
  const element = document.createElement(tag);

  if (!isRecord(props)) {
    return element;
  }

  if (hasKey(props, 'ref') && isRefCallback(props.ref)) {
    props.ref(element);
  }

  if (hasKey(props, 'children') && isChild(props.children)) {
    element.append(...mountChild(props.children));
  }

  return element;
};

const isRefCallback = (value: unknown): value is (element: Element) => void =>
  typeof value === 'function';
