import { mountableTag } from '../internal/index.mjs';

/**
 * What a JSX expression evaluates to: a description that creates DOM nodes
 * when mounted, not the nodes themselves (SPEC.md 6.1).
 *
 * The children of a JSX element are evaluated before the element, so a
 * description that created its nodes at once would create both branches of
 * `<If cond={c$} then={<A />} else={<B />} />` before either was chosen.
 *
 * It is an object rather than a function: a props object with a `then` prop
 * holding a function would be taken for a thenable.
 *
 * The same description may be mounted any number of times; each mount
 * creates new nodes.
 */
export type Mountable = Readonly<{
  [mountableTag]: true;
  /** Called inside the current scope; creates the nodes and returns them. */
  mount: () => MountedNodes;
}>;

/** What one mount produced. */
export type MountedNodes = ChildNode | readonly ChildNode[];

/** Makes a {@link Mountable} from the function that mounts it. */
export const mountable = (mount: () => MountedNodes): Mountable =>
  ({
    [mountableTag]: true,
    mount,
  }) as const;
