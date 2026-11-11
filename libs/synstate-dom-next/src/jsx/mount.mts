/**
 * Descriptions and mounting. A JSX expression evaluates to a description; the
 * DOM nodes are created only when it is mounted, inside the current owner.
 */
import { isObservable } from 'synstate-next';
import { toNode } from 'synstate-next/internal';
import * as Arr from 'ts-data-forge/array';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  bindProps,
  isSvgOnlyTag,
  svgNamespace,
  TextBinding,
} from '../bind/index.mjs';
import type { Bindable } from '../constant.mjs';

/**
 * What a JSX expression evaluates to: a description that creates DOM nodes when
 * mounted, not the nodes themselves. The children of a JSX element are
 * evaluated before the element, so a description that created its nodes at once
 * would create both branches of an `If` before either was chosen.
 *
 * The same description may be mounted any number of times; each mount creates
 * new nodes.
 */
export abstract class Description {
  /** Creates the nodes in the current owner and appends them to `out`. */
  abstract mount(out: MountedNodes): void;
}

/**
 * The nodes one mount produced, in order. A mount appends to it rather than
 * returning an array of its own, so that nested mounts allocate nothing.
 */
export class MountedNodes {
  readonly #mut_list: ChildNode[];

  constructor() {
    this.#mut_list = [];
  }

  /**
   * The nodes as one node: the only one, or a fragment holding them. Moving
   * them into a fragment that is in no document costs no layout work, and a
   * spread of thousands of nodes as arguments could exceed the engine's limit.
   */
  #asOne(document_: Document): ChildNode | DocumentFragment {
    const list = this.#mut_list;

    if (Arr.isFixedLengthArray(1, list)) {
      return list[0];
    }

    const fragment = document_.createDocumentFragment();

    for (const node of list) {
      fragment.append(node);
    }

    return fragment;
  }

  get list(): readonly ChildNode[] {
    return this.#mut_list;
  }

  push(node: ChildNode): void {
    this.#mut_list.push(node);
  }

  /** Inserts the nodes before `anchor`, in one insertion into the document. */
  insertBefore(anchor: ChildNode): void {
    anchor.before(this.#asOne(anchor.ownerDocument ?? document));
  }

  /** Appends the nodes to `parent`, in one insertion into the document. */
  appendTo(parent: Element): void {
    parent.append(this.#asOne(parent.ownerDocument));
  }
}

/**
 * What a JSX element accepts as a child. Text is a `Bindable` like any other
 * data: `<p>{constant('big')}</p>`, never `<p>big</p>`.
 */
export type Child = Bindable<number | string> | Description | readonly Child[];

/** A function component. */
export type Component<P> = (props: P) => Description;

/** Mounts `child` in the current owner, appending its nodes to `out`. */
export const mountChildInto = (child: Child, out: MountedNodes): void => {
  if (child instanceof Description) {
    child.mount(out);

    return;
  }

  if (isObservable(child)) {
    const text = document.createTextNode('');

    // Registers itself with the source and the current owner.
    // oxlint-disable-next-line eslint/no-new
    new TextBinding(toNode(child), text);

    out.push(text);

    return;
  }

  if (Arr.isArray(child)) {
    for (const c of child) {
      mountChildInto(c, out);
    }

    return;
  }

  out.push(document.createTextNode(constantText(child)));
};

/**
 * The namespace the elements mounted now are created in: what is mounted inside
 * an SVG element, down to a `<foreignObject>`, is SVG. An SVG-only tag
 * (`<circle>`) is SVG wherever it is mounted; `<a>`, `<title>`, `<script>` and
 * `<style>`, which are both, follow where they are mounted.
 */
export const currentNamespace = (): Namespace => mut_mounting.namespace;

/** The namespace of what is mounted into `parent`. */
export const namespaceInside = (parent: Element): Namespace =>
  parent.namespaceURI === svgNamespace && parent.localName !== 'foreignObject'
    ? 'svg'
    : 'html';

/**
 * Runs `mount` with `namespace` as the current one. A binding that mounts later
 * (an `If`'s branch, a `For`'s rows) keeps the namespace it was made in, through
 * `MountSite`, and mounts with this.
 */
export const mountInNamespace = <R,>(
  namespace: Namespace,
  mount: () => R,
): R => {
  const saved = mut_mounting.namespace;

  if (namespace === saved) {
    return mount();
  }

  mut_mounting.namespace = namespace;

  try {
    return mount();
  } finally {
    mut_mounting.namespace = saved;
  }
};

/** A description that mounts with a function of its own: `If`, `For`. */
export class ControlDescription extends Description {
  readonly #mount: (out: MountedNodes) => void;

  constructor(mount: (out: MountedNodes) => void) {
    super();

    this.#mount = mount;
  }

  mount(out: MountedNodes): void {
    this.#mount(out);
  }
}

/** `<div …>`: creates the element, binds its props, mounts its children. */
class ElementDescription extends Description {
  readonly #tag: string;

  readonly #props: Props;

  constructor(tag: string, props: Props) {
    super();

    this.#tag = tag;

    this.#props = props;
  }

  mount(out: MountedNodes): void {
    const props = this.#props;

    const tag = this.#tag;

    const isSvg = mut_mounting.namespace === 'svg' || isSvgOnlyTag(tag);

    const element = isSvg
      ? document.createElementNS(svgNamespace, tag)
      : document.createElement(tag);

    // `ref` first: before the children are mounted or anything is bound.
    const { ref, children } = props;

    if (typeof ref === 'function') {
      Reflect.apply(ref, undefined, [element]);
    }

    // The children before the props: a `<select>`'s `value` selects one of the
    // `<option>`s, which have to be there.
    if (children !== undefined) {
      mountChildren(
        element,
        children,
        isSvg && tag !== 'foreignObject' ? 'svg' : 'html',
      );
    }

    bindProps(element, props);

    out.push(element);
  }
}

/** `<Component …>`: calls the component in the current owner. */
class ComponentDescription extends Description {
  readonly #component: Component<Props>;

  readonly #props: Props;

  constructor(component: Component<Props>, props: Props) {
    super();

    this.#component = component;

    this.#props = props;
  }

  mount(out: MountedNodes): void {
    this.#component(this.#props).mount(out);
  }
}

/**
 * The JSX factory: `jsx`, `jsxs` and `jsxDEV` are all this one. The compiler
 * passes a `key` prop apart from the others. It is put back for a component,
 * since `For` takes its `key` as a prop, and dropped for an element, which
 * would otherwise get a `key` attribute.
 */
export const createDescription = (
  type: Component<ReadonlyRecord<string, unknown>> | string,
  props: ReadonlyRecord<string, unknown>,
  key?: unknown,
): Description => {
  if (typeof type === 'string') {
    return new ElementDescription(type, props);
  }

  return new ComponentDescription(
    type,
    key === undefined ? props : ({ ...props, key } as const),
  );
};

/** `<>…</>`: its children, mounted in order. */
export const Fragment = ({
  children,
}: Readonly<{ children?: Child }>): Description =>
  new ControlDescription((out) => {
    if (children !== undefined) {
      mountChildInto(children, out);
    }
  });

/**
 * Tells a child from any other value, one level deep as synstate-dom's: any
 * array is taken for one, whatever it holds. An element of it that is no child
 * (`null`, an object) mounts as an empty text node.
 */
export const isChild = (value: unknown): value is Child =>
  value instanceof Description ||
  isObservable(value) ||
  Arr.isArray(value) ||
  typeof value === 'string' ||
  typeof value === 'number';

/**
 * Mounts `child` and appends its nodes to `parent` in one insertion, creating
 * them in `parent`'s namespace; returns them. In the current owner: the caller
 * removes them, if they are to go before `parent` does.
 */
export const appendChildTo = (child: Child, parent: Element): MountedNodes => {
  const out = new MountedNodes();

  mountInNamespace(namespaceInside(parent), () => {
    mountChildInto(child, out);
  });

  out.appendTo(parent);

  return out;
};

/** The namespace an element is created in. */
export type Namespace = 'html' | 'svg';

type Props = ReadonlyRecord<string, unknown>;

const mut_mounting: { namespace: Namespace } = { namespace: 'html' };

/** A constant child: a string or a number, by the types. */
const constantText = (child: unknown): string =>
  typeof child === 'string'
    ? child
    : typeof child === 'number'
      ? child.toString()
      : '';

/** Mounts the children of `element` into it. */
const mountChildren = (
  mut_element: Element,
  children: unknown,
  namespace: Namespace,
): void => {
  if (typeof children === 'string' || typeof children === 'number') {
    // One constant text child: no text node of our own to create.
    mut_element.textContent = constantText(children);

    return;
  }

  if (!isChild(children)) {
    return;
  }

  const out = new MountedNodes();

  if (namespace === mut_mounting.namespace) {
    mountChildInto(children, out);
  } else {
    mountInNamespace(namespace, () => {
      mountChildInto(children, out);
    });
  }

  out.appendTo(mut_element);
};
