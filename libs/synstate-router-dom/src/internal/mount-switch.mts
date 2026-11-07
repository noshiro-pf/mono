import {
  createScope,
  getCurrentScope,
  onScopeDispose,
  type InitializedObservable,
  type Scope,
} from 'synstate';
import { toNodes, type Mountable } from 'synstate-dom';
import { Arr } from 'ts-data-forge';

/**
 * Mounts one branch at a time in front of an anchor comment, rebuilding it only
 * when `keyOf` gives a different key; within one key the branch keeps its nodes
 * and its scope and follows the value through observables of its own.
 *
 * synstate-dom has this as `mountSwitch` (its SPEC.md 8.1) but keeps it out of
 * its public API until its generic `Match` is designed. This is the same
 * algorithm on the parts it does publish; switch to it if it is exported.
 */
export const mountSwitch = <V, K>(
  value: InitializedObservable<V>,
  keyOf: (current: V) => K,
  branch: (key: K, current: V) => Mountable | undefined,
): readonly ChildNode[] => {
  const parent = getCurrentScope();

  const anchor = document.createComment('');

  const mut_state: {
    current: Readonly<{ key: K; scope: Scope }> | undefined;
    initialNodes: readonly ChildNode[];
  } = { current: undefined, initialNodes: [] };

  const branchScopeOptions = { after: value } as const;

  value.subscribe((v) => {
    const key = keyOf(v);

    if (mut_state.current !== undefined) {
      if (Object.is(mut_state.current.key, key)) {
        return;
      }

      mut_state.current.scope.dispose();
    }

    // What a branch derives updates after `value`, so that a branch the next
    // value rules out is disposed before it computes that value (#3605).
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

    if (anchor.parentNode === null) {
      mut_state.initialNodes = nodes;
    } else {
      anchor.before(...nodes);
    }
  });

  return Arr.toPushed(mut_state.initialNodes, anchor);
};
