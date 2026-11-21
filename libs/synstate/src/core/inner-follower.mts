import {
  EffectClass,
  noValue,
  type ObservableClass,
} from './observable-class.mjs';

/** What an `InnerFollower` reports to: `switchMap` or `mergeMap`. */
export type InnerTarget<B, T> = Readonly<{
  innerEmitted: (value: B, tag: T) => void;
}>;

/**
 * Follows an inner observable of `switchMap` or `mergeMap`, and reports each
 * value it emits after the follower was created to `target`, with `tag` (which
 * inner it is). An effect, so it runs once the update has settled; its owner is
 * the inner's.
 */
export class InnerFollower<B, T> extends EffectClass<B> {
  readonly #target: InnerTarget<B, T>;

  readonly #tag: T;

  constructor(inner: ObservableClass<B>, target: InnerTarget<B, T>, tag: T) {
    super(inner);

    this.#target = target;

    this.#tag = tag;
  }

  run(): void {
    const v = this.source.current;

    if (v !== noValue) {
      this.#target.innerEmitted(v, this.#tag);
    }
  }
}
