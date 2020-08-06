import { RNType, Subscriber, Subscription } from '../types';
import { IdType, Option } from '../util';
import { Pipable } from './pipable';

export interface RN<A> extends Pipable<A> {
  /** @internal */
  readonly type: RNType;
  /** @internal */
  readonly id: IdType;
  /** @internal */
  readonly isUpdateManager: boolean;
  /** @internal */
  readonly depth: number;
  /** @internal */
  readonly parents: RN<any>[];
  /** @internal */
  readonly currentValue: Option<A>;
  /** @internal */
  isUpdated: boolean;

  /** @internal */
  readonly children: readonly RN<any>[];
  /** @internal */
  readonly descendantsIds: readonly IdType[];

  readonly isCompleted: boolean;

  /** @internal */
  addChild(child: RN<any>): void;
  /** @internal */
  addDescendant(child: RN<any>): void;
  /** @internal */
  tryUpdate(nextValue?: A): void;
  /** @internal */
  tryComplete(): void;

  subscribe(
    next: (v: A) => void,
    error?: (e?: any) => void,
    complete?: () => void
  ): Subscription;

  subscribe(fn: Subscriber<A>): Subscription;
}
