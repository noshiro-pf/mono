import {
  createScope,
  getCurrentScope,
  isObservable,
  onScopeDispose,
  type Scope,
} from 'synstate';
import { Arr } from 'ts-data-forge';
import type { Bindable } from '../constant/index.mjs';
import {
  applyWhenAttached,
  bindValue,
  insertBefore,
  mountThenInsert,
} from '../internal/index.mjs';
import { toNodes, type Mountable, type MountedNodes } from '../jsx/index.mjs';

/**
 * Mounts one branch at a time in front of an anchor comment, choosing it from
 * the value of `value` (SPEC.md 8.1–8.3).
 *
 * The branch is rebuilt only when `keyOf` gives a different key: within the
 * same key the branch keeps its nodes and its scope, and it is up to the branch
 * to follow the value (`MatchOptional` hands it an observable derived from
 * `value`). Each branch is mounted in a scope of its own, a child of the scope
 * the switch was mounted in; disposing the branch's scope removes its nodes, so
 * the switch's own nodes stay accurate however often it switches.
 *
 * `branch` runs inside the new scope, so whatever it creates belongs to the
 * branch.
 *
 * A value that arrives before the anchor is in a parent (a later sibling wrote
 * it while the enclosing element was still mounting its children) is kept, and
 * the switch follows the latest one once the nodes it returned are inserted.
 * A value the branch being mounted writes itself is applied once that branch is
 * inserted (#3141).
 */
export const mountSwitch = <V, K>(
  value: Bindable<V>,
  keyOf: (current: V) => K,
  branch: (key: K, current: V) => Mountable | undefined,
): MountedNodes => {
  const parent = getCurrentScope();

  const anchor = document.createComment('');

  const mut_state: {
    current: Readonly<{ key: K; scope: Scope }> | undefined;
    initialNodes: readonly ChildNode[];
  } = { current: undefined, initialNodes: [] };

  // What a branch derives updates after `value`, so that a branch the next
  // value rules out is disposed before it computes that value (#3605).
  const branchScopeOptions = isObservable(value)
    ? ({ after: value } as const)
    : undefined;

  /** Mounts the branch for `v` in a scope of its own and returns its nodes. */
  const mountBranch = (key: K, v: V): readonly ChildNode[] => {
    const scope = createScope(parent, branchScopeOptions);

    const nodes = scope.run(() => {
      const mounted = toNodes(branch(key, v)?.mount() ?? []);

      onScopeDispose(() => {
        for (const node of mounted) {
          node.remove();
        }
      });

      return mounted;
    });

    mut_state.current = { key, scope };

    return nodes;
  };

  /** Switches the attached switch to the branch for `v`. */
  const switchTo = (v: V): void => {
    const key = keyOf(v);

    if (mut_state.current !== undefined) {
      if (Object.is(mut_state.current.key, key)) {
        return;
      }

      mut_state.current.scope.dispose();
    }

    mountThenInsert((k: K) => mountBranch(k, v), key, insertBefore, anchor);
  };

  const switchWhenAttached = applyWhenAttached(anchor, switchTo);

  bindValue(value, (v) => {
    if (mut_state.current === undefined) {
      mut_state.initialNodes = mountBranch(keyOf(v), v);
    } else {
      switchWhenAttached(v);
    }
  });

  return Arr.toPushed(mut_state.initialNodes, anchor);
};
