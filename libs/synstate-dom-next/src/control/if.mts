import type { Bindable } from '../constant.mjs';
import { ControlDescription, type Description } from '../jsx/index.mjs';
import { mountSwitch } from './switch.mjs';

/**
 * Mounts `then` while `cond` is `true` and `else` while it is `false`; nothing
 * for an omitted `else`.
 *
 * Both branches are descriptions, so only the one chosen is mounted. A branch
 * is rebuilt only when `cond` flips, after the update that flipped it has
 * settled: the previous branch's owner is disposed and its nodes removed. A
 * constant `cond` mounts one branch once.
 */
export const If = ({
  cond,
  then,
  else: elseBranch,
}: Readonly<{
  cond: Bindable<boolean>;
  then: Description;
  else?: Description;
}>): Description =>
  new ControlDescription((out) => {
    mountSwitch(cond, isTrue, (shown) => (shown ? then : elseBranch), out);
  });

const isTrue = (cond: boolean): boolean => cond;
