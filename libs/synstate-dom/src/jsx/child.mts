import { isObservable } from 'synstate';
import { Arr, hasKey, isNumber, isRecord, isString } from 'ts-data-forge';
import type { Bindable } from '../constant/index.mjs';
import { bindValue, mountableTag, viewTag } from '../internal/index.mjs';
import type { Mountable, MountedNodes } from './mountable.mjs';

/**
 * What a JSX element accepts as a child. Text must be a `Bindable` like any
 * other data: `<p>{constant('big')}</p>`, never `<p>big</p>` (SPEC.md 5.1).
 */
export type Child = Bindable<number | string> | Mountable | readonly Child[];

/**
 * Mounts a child in the current scope and returns its nodes in order: a
 * description is mounted, a `Bindable` becomes a text node bound to it, and an
 * array is flattened.
 */
export const mountChild = (child: Child): readonly ChildNode[] => {
  if (Arr.isArray(child)) {
    return child.flatMap(mountChild);
  }

  if (isMountable(child)) {
    return toNodes(child.mount());
  }

  const mut_text = document.createTextNode('');

  bindValue(child, (value) => {
    mut_text.data = value.toString();
  });

  return [mut_text];
};

export const toNodes = (nodes: MountedNodes): readonly ChildNode[] =>
  Arr.isArray(nodes) ? nodes : ([nodes] as const);

/**
 * Tells a child from any other value, one level deep: the elements of an array
 * are checked as they are mounted.
 */
export const isChild = (value: unknown): value is Child =>
  Arr.isArray(value) ||
  isString(value) ||
  isNumber(value) ||
  isObservable(value) ||
  (isRecord(value) && (hasKey(value, mountableTag) || hasKey(value, viewTag)));

const isMountable = (child: Child): child is Mountable =>
  isRecord(child) && hasKey(child, mountableTag);
