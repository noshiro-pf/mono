import {
  createScope,
  getCurrentScope,
  onScopeDispose,
  type Scope,
} from 'synstate';
import { Arr } from 'ts-data-forge';
import type { Bindable } from '../constant/index.mjs';
import { bindValue } from '../internal/index.mjs';
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

  bindValue(value, (v) => {
    const key = keyOf(v);

    if (mut_state.current !== undefined) {
      if (Object.is(mut_state.current.key, key)) {
        return;
      }

      mut_state.current.scope.dispose();
    }

    const scope = createScope(parent);

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

    if (anchor.parentNode === null) {
      mut_state.initialNodes = nodes;
    } else {
      anchor.before(...nodes);
    }
  });

  return Arr.toPushed(mut_state.initialNodes, anchor);
};
