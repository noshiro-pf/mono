import { memo } from 'preact/compat';

/**
 * `memo`, with the `displayName` set.
 *
 * `fc` is typed as a plain function of the props rather than as
 * `preact.FunctionComponent<Props>`. That type is `RenderableProps<Props>` —
 * `Props` plus `children`, `ref`, `key` and `jsx` — and a component written
 * against it can never satisfy
 * `ts-restrictions/check-destructuring-completeness`, which asks for every
 * property to be named. Annotating the parameter instead moves the problem to
 * `@typescript-eslint/prefer-readonly-parameter-types`, because a
 * `ComponentChild` is not deeply readonly. React 19's `FC` no longer adds
 * `children` either, so this also brings the two packages back into line.
 *
 * The return type is `ComponentChildren` rather than `VNode | null` because
 * `VNode` is invariant in its props: a component built by `createElement` with
 * concrete props gives a `VNode<Those>`, which is not a `VNode<{}>`.
 */
export const memoNamed = <Props,>(
  displayName: string,
  fc: (props: Readonly<Props>) => preact.ComponentChildren,
): preact.FunctionComponent<Readonly<Props>> => {
  const mut_memoizedComponent: preact.FunctionComponent<Readonly<Props>> =
    memo(fc);

  mut_memoizedComponent.displayName = displayName;

  return mut_memoizedComponent;
};
