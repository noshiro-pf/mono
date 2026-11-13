import { hasKey, isRecord } from 'ts-data-forge';
import { bindProps } from '../bind/index.mjs';
import {
  appendTo,
  isMountingInSvg,
  mountThenInsert,
  mountUnder,
  svgTagNames,
  svgTwinTagNames,
} from '../internal/index.mjs';
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
 */
export const createMountable = <P,>(
  type: string | ((componentProps: P) => Mountable),
  props: P,
  key?: unknown,
): Mountable => {
  // The transform takes `key` out of the props and passes it on its own. It is
  // put back for a component: `For` takes its `key` function as a prop.
  const propsWithKey = key === undefined ? props : ({ ...props, key } as const);

  return typeof type === 'string'
    ? mountable(() => mountElement(type, props))
    : mountable(() => type(propsWithKey).mount());
};

/** Mounts its children in order, with no element around them. */
export const Fragment = (props: Readonly<{ children?: Child }>): Mountable =>
  mountable(() => mountChild(props.children ?? []));

const isRefCallback = (value: unknown): value is (element: Element) => void =>
  typeof value === 'function';

const mountElement = (tag: string, props: unknown): Element => {
  // An element knows its own namespace, so its children are told it without
  // reading the DOM.
  const isSvg =
    svgTagNameSet.has(tag) || (isMountingInSvg() && svgTwinTagNameSet.has(tag));

  const element = isSvg
    ? document.createElementNS(svgNamespace, tag)
    : document.createElement(tag);

  if (!isRecord(props)) {
    return element;
  }

  if (hasKey(props, 'ref') && isRefCallback(props.ref)) {
    props.ref(element);
  }

  // Children first, so that a `<select>`'s `value` finds its `<option>`s.
  if (hasKey(props, 'children') && isChild(props.children)) {
    const { children } = props;

    mountUnder(isSvg && tag !== 'foreignObject', () =>
      mountThenInsert(mountChild, children, appendTo, element),
    );
  }

  bindProps(element, props);

  return element;
};

const svgNamespace = 'http://www.w3.org/2000/svg';

const svgTagNameSet: ReadonlySet<string> = new Set(svgTagNames);

const svgTwinTagNameSet: ReadonlySet<string> = new Set(svgTwinTagNames);
