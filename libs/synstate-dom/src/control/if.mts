import type { Bindable } from '../constant/index.mjs';
import { mountable, type JSX } from '../jsx/index.mjs';
import { mountSwitch } from './mount-switch.mjs';

/**
 * Mounts `then` while `cond` is `true` and `else` while it is `false`
 * (SPEC.md 8.2). Nothing is mounted for an omitted `else`.
 *
 * Both branches are descriptions, so only the one chosen is mounted. A branch
 * is rebuilt only when `cond` flips; flipping disposes the previous branch's
 * scope and removes its nodes. A constant `cond` mounts one branch once.
 */
export const If = ({
  cond,
  then,
  else: elseBranch,
}: Readonly<{
  cond: Bindable<boolean>;
  then: JSX.Element;
  else?: JSX.Element;
}>): JSX.Element =>
  mountable(() =>
    mountSwitch(
      cond,
      (value) => value,
      (value) => (value ? then : elseBranch),
    ),
  );
