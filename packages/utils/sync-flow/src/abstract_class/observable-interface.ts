import { ObservableType, Subscriber, Subscription } from '../types';
import { IdType, Option } from '../util';
import { Pipable } from './pipable';

export interface Observable<A> extends Pipable<A> {
  /** @internal */
  readonly type: ObservableType;
  /** @internal */
  readonly id: IdType;
  /** @internal */
  readonly isUpdateManager: boolean;
  /** @internal */
  readonly depth: number;
  /** @internal */
  readonly parents: Observable<any>[];
  /** @internal */
  readonly currentValue: Option<A>;
  /** @internal */
  isUpdated: boolean;

  /** @internal */
  readonly children: readonly Observable<any>[];
  /** @internal */
  readonly descendantsIds: readonly IdType[];

  readonly isCompleted: boolean;

  /** @internal */
  addChild(child: Observable<any>): void;
  /** @internal */
  addDescendant(child: Observable<any>): void;
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
